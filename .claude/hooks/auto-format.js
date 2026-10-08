#!/usr/bin/env node
// auto-format.js — PostToolUse Write / Edit Hook (개발 템플릿)
//
// 목적: 저장한 파일 하나를 프로젝트의 포매터로 바로 정리 (2026-10-06 사용자 요청)
//   확장자로 언어를 고르고, 그 언어의 포매터가 "프로젝트에 설정 + 설치"돼 있을 때만 실행한다.
//   없으면 아무것도 하지 않는다 — 인터넷에서 내려받지 않는다(npx 금지).
//
// 언어별:
//   JS·TS·JSON·CSS 등 → biome(biome.json[c] + node_modules/.bin/biome) 우선, 없으면 prettier(설정 + node_modules/.bin/prettier)
//   Python            → ruff(ruff.toml·.ruff.toml·pyproject [tool.ruff] + 실행 파일) 우선, 없으면 black([tool.black] + 실행 파일)
//   Rust              → rustfmt (Cargo.toml + PATH 의 rustfmt, Cargo.toml 의 edition 사용)
//   Java 등           → 대상 아님 (포매터가 빌드 도구 경유라 파일 단위 실행이 수십 초 걸림)
//
// 결과는 막지 않는다 (PostToolUse — 파일은 이미 저장됨):
//   정리됨 → additionalContext 로 "파일이 바뀌었으니 다음 Edit 전에 다시 읽으라" 안내
//   실패   → additionalContext 로 경고만
// 명령은 execFileSync + 인자 배열 — 셸을 거치지 않으므로 파일 이름으로 명령 주입 불가

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const TIMEOUT_MS = 20000
const JS_EXT = /\.(?:[cm]?[jt]sx?|json|jsonc|css|scss|less|html|vue|svelte|ya?ml|md|mdx|graphql)$/i
const PY_EXT = /\.pyi?$/i
const RS_EXT = /\.rs$/i
const SKIP_DIR = /(?:^|\/)(?:node_modules|\.git|dist|build|out|\.next|target|\.venv|venv|__pycache__)\//
const PRETTIER_CONFIGS = ['.prettierrc', '.prettierrc.json', '.prettierrc.yaml', '.prettierrc.yml', '.prettierrc.json5', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.mjs', '.prettierrc.toml', 'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs', 'prettier.config.ts']

const exists = (p) => { try { return fs.existsSync(p) } catch { return false } }
const readText = (p) => { try { return fs.readFileSync(p, 'utf8') } catch { return '' } }

function projectRoot() {
  return path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd())
}

// 파일이 있는 폴더부터 루트까지 올라가며 첫 번째로 조건을 만족하는 폴더
function findUp(fromDir, root, pred) {
  let dir = fromDir
  for (let hop = 0; dir && hop < 40; hop++) {
    if (pred(dir)) return dir
    if (dir === root) break
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function binIn(dir, name) {
  const p = path.join(dir, 'node_modules', '.bin', name)
  return exists(p) ? p : null
}

function onPath(name) {
  for (const d of String(process.env.PATH || '').split(path.delimiter)) {
    if (d && exists(path.join(d, name))) return path.join(d, name)
  }
  return null
}

// 반환: { tool, cmd, args } | null
function pickFormatter(file, root) {
  const dir = path.dirname(file)
  if (JS_EXT.test(file)) {
    const biomeDir = findUp(dir, root, d => exists(path.join(d, 'biome.json')) || exists(path.join(d, 'biome.jsonc')))
    if (biomeDir) {
      const bin = findUp(dir, root, d => !!binIn(d, 'biome'))
      if (bin) return { tool: 'biome', cmd: binIn(bin, 'biome'), args: ['format', '--write', file] }
    }
    const prettierDir = findUp(dir, root, d => PRETTIER_CONFIGS.some(c => exists(path.join(d, c)))
      || /"prettier"\s*:/.test(readText(path.join(d, 'package.json'))))
    if (prettierDir) {
      const bin = findUp(dir, root, d => !!binIn(d, 'prettier'))
      if (bin) return { tool: 'prettier', cmd: binIn(bin, 'prettier'), args: ['--write', '--log-level', 'warn', file] }
    }
    return null
  }
  if (PY_EXT.test(file)) {
    const cfgDir = findUp(dir, root, d => exists(path.join(d, 'ruff.toml')) || exists(path.join(d, '.ruff.toml'))
      || /^\[tool\.ruff/m.test(readText(path.join(d, 'pyproject.toml'))) || /^\[tool\.black\]/m.test(readText(path.join(d, 'pyproject.toml'))))
    if (!cfgDir) return null
    const venvBin = (name) => findUp(dir, root, d => exists(path.join(d, '.venv', 'bin', name)))
    const usesRuff = exists(path.join(cfgDir, 'ruff.toml')) || exists(path.join(cfgDir, '.ruff.toml')) || /^\[tool\.ruff/m.test(readText(path.join(cfgDir, 'pyproject.toml')))
    if (usesRuff) {
      const v = venvBin('ruff')
      const cmd = v ? path.join(v, '.venv', 'bin', 'ruff') : onPath('ruff')
      if (cmd) return { tool: 'ruff', cmd, args: ['format', file] }
    }
    if (/^\[tool\.black\]/m.test(readText(path.join(cfgDir, 'pyproject.toml')))) {
      const v = venvBin('black')
      const cmd = v ? path.join(v, '.venv', 'bin', 'black') : onPath('black')
      if (cmd) return { tool: 'black', cmd, args: ['--quiet', file] }
    }
    return null
  }
  if (RS_EXT.test(file)) {
    const cargoDir = findUp(dir, root, d => exists(path.join(d, 'Cargo.toml')))
    const cmd = onPath('rustfmt')
    if (!cargoDir || !cmd) return null
    const m = /^\s*edition\s*=\s*"(\d{4})"/m.exec(readText(path.join(cargoDir, 'Cargo.toml')))
    return { tool: 'rustfmt', cmd, args: ['--edition', m ? m[1] : '2021', file] }
  }
  return null
}

function handle(input) {
  if (!input || typeof input !== 'object') return null
  if ((input.hook_event_name || input.hookEventName) !== 'PostToolUse') return null
  if (input.tool_name !== 'Write' && input.tool_name !== 'Edit') return null
  const ti = input.tool_input && typeof input.tool_input === 'object' ? input.tool_input : {}
  if (typeof ti.file_path !== 'string' || !ti.file_path) return null

  const root = projectRoot()
  const file = path.resolve(root, ti.file_path)
  // 프로젝트 밖·빌드 산출물·의존성 폴더는 손대지 않는다
  if (!(file === root || file.startsWith(root + path.sep))) return null
  if (SKIP_DIR.test(path.relative(root, file).split(path.sep).join('/') + '/')) return null
  let stat
  try { stat = fs.lstatSync(file) } catch { return null }
  if (!stat.isFile() || stat.isSymbolicLink()) return null

  const f = pickFormatter(file, root)
  if (!f) return null

  const before = readText(file)
  try {
    execFileSync(f.cmd, f.args, { cwd: root, timeout: TIMEOUT_MS, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
  } catch (e) {
    const msg = String((e && (e.stderr || e.message)) || '').split('\n').slice(0, 3).join(' ').slice(0, 300)
    return ctx(`[auto-format] ${f.tool} 실행 실패(${path.relative(root, file)}) — 파일은 그대로입니다: ${msg}`)
  }
  if (readText(file) === before) return null
  return ctx(`[auto-format] ${f.tool} 가 ${path.relative(root, file)} 를 정리했습니다. 파일 내용이 바뀌었으니 다시 Edit 하기 전에 Read 로 최신 내용을 확인하세요.`)
}

function ctx(text) {
  return { hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text } }
}

if (require.main === module) {
  let input = null
  try { input = JSON.parse(fs.readFileSync(0, 'utf8')) } catch { process.exit(0) }
  let r = null
  try { r = handle(input) } catch { r = null }
  if (r) process.stdout.write(JSON.stringify(r) + '\n')
  process.exit(0)
} else {
  module.exports = { handle, pickFormatter }
}
