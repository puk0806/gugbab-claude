#!/usr/bin/env node
/**
 * _lib.js — 훅 공통 유틸리티
 * 다른 훅에서 require(path.join(__dirname, '_lib.js')) 로 import
 */
const crypto  = require('crypto')
const fs      = require('fs')
const os      = require('os')
const path    = require('path')
const { execSync } = require('child_process')

/** 쉘 명령 실행 — 실패 시 빈 문자열 반환 */
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...opts,
    }).trim()
  } catch { return '' }
}

/** 프로젝트 경로 기반 8자 해시 — 훅 간 상태 파일 키 공유 */
function getProjectHash(projectDir) {
  const dir = projectDir
    || process.env.CLAUDE_PROJECT_DIR
    || process.cwd()
  return crypto.createHash('md5').update(path.resolve(dir)).digest('hex').slice(0, 8)
}

/** 세션 상태 파일 디렉터리 (~/.claude/session-state/) */
function getStateDir() {
  const dir = path.join(os.homedir(), '.claude', 'session-state')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * 세션 상태 파일 경로
 * @param {string} key   - 상태 구분 키 (예: 'needs-verify', 'verified')
 * @param {string} [projectDir]
 */
function getStateFile(key, projectDir) {
  const hash = getProjectHash(projectDir)
  return path.join(getStateDir(), `${hash}-${key}`)
}

/** 핸드오프 파일 디렉터리 (~/.claude/handoffs/) */
function getHandoffDir() {
  const dir = path.join(os.homedir(), '.claude', 'handoffs')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * 핸드오프 파일 경로
 * @param {string} [projectDir]
 */
function getHandoffFile(projectDir) {
  const hash = getProjectHash(projectDir)
  return path.join(getHandoffDir(), `handoff-${hash}.md`)
}

/** 파일 수정 시각 (ms) — 없으면 0 */
function getMtime(filePath) {
  try { return fs.statSync(filePath).mtimeMs } catch { return 0 }
}

module.exports = {
  run,
  getProjectHash,
  getStateDir,
  getStateFile,
  getHandoffDir,
  getHandoffFile,
  getMtime,
}
