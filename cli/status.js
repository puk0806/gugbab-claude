// status — 연 프로젝트에 적용된 하네스 요약 (계획서 4장 부가 명령, /harness 가 보여 줌)
'use strict';

const TYPES = [['setting', '설정'], ['hook', '훅'], ['rule', '룰'], ['command', '커맨드'], ['agent', '에이전트'], ['skill', '스킬']];

function statusLines({ manifest, resolved, project, paths, skipped = new Set() }) {
  const items = manifest.items || {};
  const lines = [];
  lines.push(`gugbab 하네스 · ${project.id}${paths.dev ? '  (개발 모드)' : ''}`);
  lines.push(`  프로젝트   ${project.root}`);
  lines.push(`  설정 폴더  ${project.configDir}`);
  lines.push(`  하네스     ${paths.codeHome}`);
  const counts = TYPES.map(([t, label]) => {
    const all = Object.entries(items).filter(([, it]) => it.type === t);
    return `${label} ${all.filter(([id]) => resolved.enabled.has(id)).length}/${all.length}`;
  });
  lines.push(`  켜짐       ${counts.join(' · ')} · 🔒 ${resolved.locked.size}`);
  const onExtra = Object.entries(items).filter(([id, it]) => it.state === 'off' && resolved.enabled.has(id)).map(([id]) => id);
  const offExtra = Object.entries(items).filter(([id, it]) => it.state === 'on' && !resolved.enabled.has(id)).map(([id]) => id);
  // 많으면 12개만 — /harness 가 이 출력을 그대로 대화에 넣는다
  const brief = (label, list) => (list.length > 12
    ? `  ${label} ${list.length}개: ${list.slice(0, 12).join(', ')} …외 ${list.length - 12}개`
    : `  ${label}: ${list.join(', ')}`);
  if (onExtra.length) lines.push(brief('켬(기본 끔)', onExtra));
  if (offExtra.length) lines.push(brief('끔(기본 켬)', offExtra));
  if (skipped.size) lines.push(`  ↷ 프로젝트 자체 .claude 우선 ${skipped.size}개 — 이 프로젝트가 같은 훅·항목을 직접 가지고 있어 래퍼가 건너뜀 (켜고 꺼도 여기엔 적용 안 됨)`);
  if (resolved.refused.length) lines.push(`  🔒 고정이라 끄지 못함: ${resolved.refused.map(r => `${r.id}(${r.source})`).join(', ')}`);
  if (resolved.unknown.length) lines.push(`  모르는 이름(무시): ${resolved.unknown.join(', ')}`);
  for (const w of resolved.warnings) lines.push(`  ⚠ ${w}`);
  lines.push('  켜기·끄기: 화면 /harness (터미널: gugbab-claude harness) · 명령 gugbab-claude on|off <항목|bundle:이름|block:이름> [--all] · 프리셋 gugbab-claude preset');
  return lines;
}

module.exports = { statusLines };
