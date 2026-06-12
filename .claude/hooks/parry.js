// PreToolUse Write — 시크릿·프롬프트 인젝션 패턴 스캔 (시크릿/인젝션 감지 시 차단)
const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  { name: 'Anthropic API Key', regex: /sk-ant-[a-zA-Z0-9\-]{30,}/ },
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{48}/ },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { name: 'Bearer Token', regex: /Bearer\s+[a-zA-Z0-9\-._~+\/]{32,}/i },
  { name: 'API Key 패턴', regex: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{20,}['"]?/i },
  { name: 'DB 비밀번호 패턴', regex: /(?:password|passwd|DB_PASS)\s*[:=]\s*['"][^'"]{6,}['"]/i },
  { name: 'GitHub Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}/ },
];

const INJECTION_PATTERNS = [
  { name: '이전 지시 무시', regex: /ignore\s+(all\s+)?previous\s+instructions/i },
  { name: '역할 교체 시도', regex: /you\s+are\s+now\s+(?:a\s+)?(?:different|new|another|dan|jailbreak)/i },
  { name: 'System 프롬프트 주입', regex: /\bsystem\s*:\s*(?:you\s+are|act\s+as)/i },
  { name: 'LLM 특수 토큰', regex: /(?:<\|im_start\|>|\[INST\]|<s>|<\/s>|\|\|END_OF_SYSTEM_PROMPT\|\|)/ },
  { name: '프롬프트 종료 시도', regex: /---+\s*END\s+(?:OF\s+)?(?:SYSTEM|INSTRUCTIONS)/i },
];

try {
  const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  if (input.tool_name !== 'Write') process.exit(0);

  const content = input.tool_input?.content || '';
  const filePath = input.tool_input?.file_path || '';

  // .env 파일 자체는 의도적으로 시크릿을 담으므로 스킵
  if (path.basename(filePath).startsWith('.env')) process.exit(0);

  const secretHits = [];
  const injectionHits = [];

  for (const p of SECRET_PATTERNS) {
    if (p.regex.test(content)) secretHits.push(`🔐 시크릿: ${p.name}`);
  }
  for (const p of INJECTION_PATTERNS) {
    if (p.regex.test(content)) injectionHits.push(`💉 인젝션: ${p.name}`);
  }

  const all = [...secretHits, ...injectionHits];
  if (all.length === 0) process.exit(0);

  process.stderr.write(`[parry] ❌ 보안 위협 감지 (${path.basename(filePath)}):\n`);
  all.forEach(w => process.stderr.write(`  ${w}\n`));

  if (secretHits.length > 0) {
    process.stderr.write(`[parry] 시크릿은 .env 파일에 보관하고 코드에서 환경변수로 참조하세요.\n`);
  }
  if (injectionHits.length > 0) {
    process.stderr.write(`[parry] 프롬프트 인젝션 의심 패턴이 감지됐습니다. 내용을 검토하세요.\n`);
  }
  process.stderr.write(`[parry] 의도된 내용이라면 패턴을 수정하거나 직접 파일을 작성하세요.\n`);

  process.exit(2); // 차단
} catch {}

process.exit(0);
