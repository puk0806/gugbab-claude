'use strict';
// relations.test.js — 레포 전체 관계 정합성 검사 (2026-10-16)
//
// relations.json(훅·룰·커맨드·에이전트·스킬 관계 원본, 계획서 14장)이 레포 실물과 맞는지 본다.
// 검사 로직은 .claude/hooks/relation-guard.js 의 check() 를 그대로 쓴다(판정 규칙 이원화 방지).
//
// 3계층 (rules/adversarial-testing.md):
//  - 정상: 레포 실물 전수 — 분류 안 된 관계·소속 없는 항목·없는 항목 참조·체크리스트 누락이 0건
//  - 악성·오남용: requires 가 묶음 정리 규칙을 우회하지 못하는지(없는 항목·자기 자신 요구), 블록이 겹치지 않는지
//  - 경계·이상: relations.json 의 모든 항목 id 가 "종류:이름" 형식이고 종류가 정해진 5가지인지

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const guard = require(path.join(REPO, '.claude', 'hooks', 'relation-guard.js'));
const REL = JSON.parse(fs.readFileSync(path.join(REPO, 'relations.json'), 'utf8'));
const TYPES = new Set(['hook', 'rule', 'command', 'agent', 'skill']);

test('정상: 레포 실물에 분류 안 된 관계·소속 없는 항목·없는 항목 참조·체크리스트 누락이 없다', () => {
  const r = guard.check(REPO, null);
  assert.ok(!r.skip, 'relations.json 이 있어야 한다');
  assert.deepStrictEqual(r.problems, [], '문제 목록:\n' + (r.problems || []).join('\n'));
});

test('정상: 레포의 모든 스킬·에이전트가 블록 정확히 하나에 들어 있다', () => {
  const items = guard.scanItems(REPO);
  const count = new Map();
  for (const b of Object.values(REL.blocks)) for (const id of b.items) count.set(id, (count.get(id) || 0) + 1);
  for (const [id, it] of items) {
    if (it.type !== 'agent' && it.type !== 'skill') continue;
    assert.strictEqual(count.get(id), 1, `${id} 의 블록 소속 수`);
  }
});

test('악성·오남용: requires 는 자기 자신을 요구하지 않고, 스킬을 요구할 때는 스킬 블록에 있는 것만', () => {
  const blocked = new Set(Object.values(REL.blocks).flatMap(b => b.items));
  for (const [from, list] of Object.entries(REL.requires)) {
    assert.ok(Array.isArray(list) && list.length, `${from} 의 requires 는 비어 있지 않은 배열`);
    for (const to of list) {
      assert.notStrictEqual(from, to, `${from} 가 자기 자신을 요구`);
      if (to.startsWith('skill:')) assert.ok(blocked.has(to), `${to} 는 블록에 있어야 한다`);
    }
  }
});

test('경계: relations.json 의 모든 id 가 "종류:이름" 형식이고 종류는 5가지 중 하나다', () => {
  const ids = [
    ...Object.values(REL.bundles).flatMap(b => b.items),
    ...Object.values(REL.blocks).flatMap(b => b.items),
    ...REL.standalone,
    ...Object.keys(REL.requires), ...Object.values(REL.requires).flat(),
    ...Object.keys(REL.edges).flatMap(k => k.split('>')),
  ];
  for (const id of ids) {
    const m = /^([a-z]+):(.+)$/.exec(id);
    assert.ok(m && TYPES.has(m[1]) && !/[\s>]/.test(m[2]), `형식이 틀린 id: ${id}`);
  }
  for (const v of Object.values(REL.edges)) assert.ok(['requires', 'uses', 'mention', 'code'].includes(v), `분류값: ${v}`);
});
