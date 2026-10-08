# 추출 스크립트 3종 (읽기 전용)

> `spring-mybatis-spec-extraction` SKILL.md의 2·4·7절에서 참조한다.
> 셋 다 **대상 소스를 읽기만** 하고 결과는 표준 출력(TSV)으로 낸다. 파일을 고치지 않는다.
> Python 3.8+ 표준 라이브러리만 사용. 대상 레포 **밖**의 폴더(예: `~/spec-tools/`)에 저장하고 경로를 인자로 넘긴다:
> `python3 -I ~/spec-tools/mapping_inventory.py <대상레포>/src/main/java > api-inventory.tsv`
> (`-I`: 대상 레포 안의 같은 이름 모듈이 import되는 것을 막는다)
>
> 스크립트는 2026-10-08 가상 예제(컨트롤러 1개, MyBatis 매퍼 1개, iBATIS sqlMap 1개)로 실행해 출력을 확인했다. 실제 레포에서는 반드시 표본 10건을 근거 줄과 대조한 뒤 쓴다(SKILL.md 9절).

---

## 1. mapping_inventory.py — 매핑 어노테이션 + 클래스 prefix 합성

```python
#!/usr/bin/env python3
"""mapping_inventory.py <src_root> > api-inventory.tsv
Spring MVC 매핑 어노테이션 인벤토리 (정적, 읽기 전용).
출력 TSV: http_method  path  handler  file:line  flags
flags: CONST(경로가 상수) CONCAT(문자열 연결) IFACE(인터페이스 선언) XAPI(넥사크로 X-API 흔적)
"""
import re
import sys
import pathlib

NAMES = {'RequestMapping': None, 'GetMapping': 'GET', 'PostMapping': 'POST',
         'PutMapping': 'PUT', 'DeleteMapping': 'DELETE', 'PatchMapping': 'PATCH'}
ANN = re.compile(r'@(?:org\.springframework\.web\.bind\.annotation\.)?('
                 + '|'.join(NAMES) + r')\b')
XAPI = re.compile(r'HttpPlatformRequest|PlatformData|PlatformRequest|DataSet\b|'
                  r'NexacroResult|@ParamDataSet|@ParamVariable')


def strip_comments(s):
    # 줄 번호 유지: 블록 주석은 공백으로 치환, 줄 주석은 줄 전체 주석만 제거("http://" 보호)
    s = re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), s, flags=re.S)
    return re.sub(r'(?m)^[ \t]*//.*$', '', s)


def args_of(s, i):
    j = i
    while j < len(s) and s[j] in ' \t\r\n':
        j += 1
    if j >= len(s) or s[j] != '(':
        return '', i
    depth, instr, k = 0, False, j
    while k < len(s):
        c = s[k]
        if c == '"' and s[k - 1] != '\\':
            instr = not instr
        elif not instr:
            if c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
                if depth == 0:
                    return s[j + 1:k], k + 1
        k += 1
    return s[j + 1:], len(s)


def paths_of(a):
    m = re.search(r'\b(?:value|path)\s*=\s*(\{[^}]*\}|"[^"]*"|[\w.]+)', a)
    if m:
        raw = m.group(1)
    elif not a.strip() or re.match(r'\s*\w+\s*=', a):
        raw = ''
    else:
        mm = re.match(r'\s*(\{[^}]*\}|"[^"]*"|[\w.]+)', a)
        raw = mm.group(1) if mm else a.strip()
    lits = re.findall(r'"([^"]*)"', raw)
    if lits:
        return lits, ''
    if raw.strip():
        return ['<상수:%s>' % raw.strip()], 'CONST'
    return [''], ''


def methods_of(name, a):
    if NAMES[name]:
        return [NAMES[name]]
    return re.findall(r'RequestMethod\.(\w+)', a) or ['ANY']


def join(p, q):
    r = re.sub(r'/+', '/', '/' + p.strip('/') + '/' + q.strip('/'))
    return r.rstrip('/') or '/'


def handler_after(s, k):
    while True:
        while k < len(s) and s[k].isspace():
            k += 1
        if k < len(s) and s[k] == '@':
            mm = re.match(r'@[\w.]+', s[k:])
            k += mm.end()
            _, k = args_of(s, k)
        else:
            break
    mm = re.match(r'[^;{(]*?(\w+)\s*\(', s[k:])
    return mm.group(1) if mm else '?'


def main(root):
    for f in sorted(pathlib.Path(root).rglob('*.java')):
        src = f.read_text(encoding='utf-8', errors='replace')
        if not ANN.search(src):
            continue
        is_ctrl = re.search(r'@(?:Rest)?Controller\b', src)
        s = strip_comments(src)
        cm = re.search(r'\b(class|interface)\s+(\w+)', s)
        if not cm or (not is_ctrl and cm.group(1) != 'interface'):
            continue
        matches = list(ANN.finditer(s))
        prefixes, cflags = [''], set()
        for idx, m in enumerate(matches):
            a, end = args_of(s, m.end())
            if m.start() < cm.start():  # 클래스 레벨
                if m.group(1) == 'RequestMapping':
                    prefixes, fl = paths_of(a)
                    if fl:
                        cflags.add(fl)
                    if re.search(r'"\s*\+|\+\s*"', a):
                        cflags.add('CONCAT')
                continue
            nxt = matches[idx + 1].start() if idx + 1 < len(matches) else len(s)
            flags = set(cflags)
            paths, fl = paths_of(a)
            if fl:
                flags.add(fl)
            if re.search(r'"\s*\+|\+\s*"', a):
                flags.add('CONCAT')
            if cm.group(1) == 'interface':
                flags.add('IFACE')
            if XAPI.search(s[end:nxt]):
                flags.add('XAPI')
            line = s.count('\n', 0, m.start()) + 1
            handler = '%s.%s' % (cm.group(2), handler_after(s, end))
            for verb in methods_of(m.group(1), a):
                for p in prefixes:
                    for q in paths:
                        print('\t'.join([verb, join(p, q), handler,
                                         '%s:%d' % (f, line), ','.join(sorted(flags))]))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
```

**알려진 한계 (결과 행의 flags·확신도로 반영):**

| 한계 | 결과에 나타나는 모습 | 조치 |
|------|------|------|
| 경로가 상수(`@RequestMapping(Urls.ORDER)`) | `<상수:Urls.ORDER>` + `CONST` | 상수 정의를 열어 수동 치환, 확신도 "확인됨"은 치환 후에만 |
| 문자열 연결(`"/api" + V`) | 첫 리터럴만 + `CONCAT` | 수동 확인 |
| 인터페이스에 매핑 선언, 구현 클래스는 `@RestController`만 | 인터페이스 행에 `IFACE`, 구현 클래스는 누락 | 구현 클래스를 찾아 핸들러를 구현 클래스로 기록 |
| 한 파일에 여러 클래스·내부 클래스 | 첫 클래스 prefix만 적용 | 드묾. 실행 시 추출(3절)과 대조 |
| 줄 끝 `//` 주석 안의 어노테이션 | 오탐 가능 | 근거 줄 확인 |
| `@HttpExchange`·XML 핸들러 매핑·`registerMapping` | 잡지 않음 | SKILL.md 2-3 grep으로 별도 수집 |
| 메서드 레벨 `params`·`headers`·`consumes` 조건 | 출력하지 않음(같은 URL 다른 핸들러로 보임) | 같은 URL 중복 행은 원문 확인 |

---

## 2. mapper_inventory.py — MyBatis 3 mapper / iBATIS 2 sqlMap → SQL 인벤토리

```python
#!/usr/bin/env python3
"""mapper_inventory.py <root> > sql-inventory.tsv
MyBatis 3 mapper XML / iBATIS 2 sqlMap XML -> SQL 인벤토리 (정적, 읽기 전용).
출력 TSV: sql_id  tag  tables(이름:CRUD;...)  cond_tables(동적 태그 안에서만 등장)
          proc  dynamic(Y/N)  dollar(Y/N)  unresolved_include  file:line
"""
import re
import sys
import pathlib
import xml.parsers.expat

STMT_TAGS = {'select', 'insert', 'update', 'delete', 'statement', 'procedure'}
DYN_TAGS = {'if', 'choose', 'when', 'otherwise', 'foreach', 'trim', 'where', 'set',
            'bind', 'dynamic', 'iterate'}
TBL = r'([A-Z_][\w$#]*(?:\.[A-Z_][\w$#]*)?|\$\{[^}]+\}|\$[\w.]+\$)'
KW = {'SET', 'WHERE', 'SELECT', 'DUAL', 'VALUES', 'TABLE', 'LATERAL', 'ONLY', 'ALL',
      'FIRST', 'WHEN', 'ON', 'THE'}


def is_dyn(tag):
    # iBATIS 2 조건 태그: isNull, isNotEmpty, isEqual, isPropertyAvailable ...
    return tag in DYN_TAGS or (tag.startswith('is') and tag[2:3].isupper())


class MapperFile:
    def __init__(self, path):
        self.path, self.ns, self.root = path, '', ''
        self.frags, self.stmts = {}, []
        self.cur, self.depth, self.dyn = None, 0, 0
        p = xml.parsers.expat.ParserCreate()
        p.StartElementHandler, p.EndElementHandler = self.start, self.end
        p.CharacterDataHandler = self.text
        self.p = p

    def parse(self, data):
        self.p.Parse(data, True)
        return self

    def _emit(self, s):
        self.cur['full'].append(s)
        if self.dyn == 0:
            self.cur['static'].append(s)

    def start(self, tag, attrs):
        if self.cur is None:
            if tag in ('mapper', 'sqlMap'):
                self.root, self.ns = tag, attrs.get('namespace', '')
            elif (tag in STMT_TAGS or tag == 'sql') and 'id' in attrs:
                self.cur = {'tag': tag, 'id': attrs['id'], 'attrs': attrs,
                            'line': self.p.CurrentLineNumber,
                            'full': [], 'static': [], 'has_dyn': False}
                self.depth, self.dyn = 1, 0
            return
        self.depth += 1
        if tag == 'include':
            self._emit(' @@INC(%s)@@ ' % attrs.get('refid', ''))
        elif is_dyn(tag):
            self.dyn += 1
            self.cur['has_dyn'] = True

    def end(self, tag):
        if self.cur is None:
            return
        self.depth -= 1
        if self.depth == 0:
            c, self.cur = self.cur, None
            c['key'] = c['id'] if (not self.ns or '.' in c['id']) else self.ns + '.' + c['id']
            c['ns'] = self.ns
            (self.frags.__setitem__(c['key'], c) if c['tag'] == 'sql'
             else self.stmts.append(c))
        elif is_dyn(tag):
            self.dyn -= 1

    def text(self, data):
        if self.cur is not None:
            self._emit(data)


def resolve(text, ns, frags, unresolved, depth=0):
    def rep(m):
        ref = m.group(1)
        key = ref if ref in frags else '%s.%s' % (ns, ref)
        f = frags.get(key)
        if f is None or depth > 5:
            unresolved.append(ref)
            return ' '
        return resolve(''.join(f['full']), f['ns'], frags, unresolved, depth + 1)
    return re.sub(r'@@INC\(([^)]*)\)@@', rep, text)


def clean(sql):
    sql = re.sub(r'/\*.*?\*/', ' ', sql, flags=re.S)
    sql = re.sub(r'--[^\n]*', ' ', sql)
    sql = re.sub(r"'(?:[^']|'')*'", "''", sql)
    sql = re.sub(r'#\{[^}]*\}|#[\w.\[\]:]+#', '?', sql)
    sql = re.sub(r'\b(EXTRACT|TRIM|SUBSTRING|OVERLAY|POSITION)\s*\([^()]*\)', 'F()', sql,
                 flags=re.I)
    return re.sub(r'\s+', ' ', sql).upper()


def crud(sql):
    t = {}

    def add(name, op):
        if name not in KW:
            t.setdefault(name, set()).add(op)
    for m in re.finditer(r'\bMERGE INTO ' + TBL, sql):
        add(m.group(1), 'C')
        add(m.group(1), 'U')
    upsert = ' ON DUPLICATE KEY UPDATE ' in sql  # MySQL upsert = C+U
    for m in re.finditer(r'(?<!MERGE )\bINTO ' + TBL, sql):
        add(m.group(1), 'C')
        if upsert:
            add(m.group(1), 'U')
    for m in re.finditer(r'(?<!FOR )(?<!KEY )\bUPDATE ' + TBL, sql):
        add(m.group(1), 'U')
    for m in re.finditer(r'\bDELETE (?:FROM )?' + TBL, sql):
        add(m.group(1), 'D')
    for m in re.finditer(r'\b(?:FROM|JOIN|USING) ' + TBL, sql):
        if 'D' not in t.get(m.group(1), set()):
            add(m.group(1), 'R')
    # FROM a x, b y 형태의 콤마 조인
    for m in re.finditer(r'\bFROM ([^()]+?)(?= WHERE | GROUP | ORDER | HAVING | UNION |'
                         r' CONNECT | START |\)|$)', sql):
        for part in m.group(1).split(',')[1:]:
            name = part.strip().split(' ')[0]
            if re.fullmatch(TBL, name):
                add(name, 'R')
    return t


def fmt(t):
    order = 'CRUD'
    return ';'.join('%s:%s' % (k, ''.join(sorted(v, key=order.index)))
                    for k, v in sorted(t.items()))


def main(root):
    files = []
    for f in sorted(pathlib.Path(root).rglob('*.xml')):
        data = f.read_bytes()
        if b'<mapper' not in data and b'<sqlMap' not in data:
            continue
        try:
            mf = MapperFile(f).parse(data)
        except xml.parsers.expat.ExpatError as e:
            print('[파싱 실패 -> 수동 확인] %s: %s' % (f, e), file=sys.stderr)
            continue
        if mf.root:
            files.append(mf)
    frags = {}
    for mf in files:
        frags.update(mf.frags)
    for mf in files:
        for c in mf.stmts:
            unresolved = []
            full = clean(resolve(''.join(c['full']), c['ns'], frags, unresolved))
            static = clean(resolve(''.join(c['static']), c['ns'], frags, []))
            t_all, t_static = crud(full), crud(static)
            cond = {k: v for k, v in t_all.items() if k not in t_static}
            proc = ''
            pm = re.search(r'\bCALL ([\w.$]+)|\bBEGIN ([\w.$]+) ?\(', full)
            if pm:
                proc = pm.group(1) or pm.group(2)
            elif c['tag'] == 'procedure' or c['attrs'].get('statementType') == 'CALLABLE':
                proc = '?'
            raw = ''.join(c['full'])
            print('\t'.join([
                c['key'], c['tag'], fmt(t_all), fmt(cond), proc,
                'Y' if c['has_dyn'] else 'N',
                'Y' if re.search(r'\$\{|\$[\w.]+\$', raw) else 'N',
                ','.join(sorted(set(unresolved))),
                '%s:%d' % (mf.path, c['line'])]))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
```

**가상 예제 실행 결과(발췌):**

```text
com.example.order.OrderMapper.selectOrder  select  CUSTOMER:R;ORDERS:R;ORDER_ITEM:R  ORDER_ITEM:R   Y N    .../OrderMapper.xml:5
com.example.order.OrderMapper.mergeStock   update  STOCK:CU                                       N N    .../OrderMapper.xml:17
com.example.order.OrderMapper.callProc     select                        PKG_ORDER.CLOSE_DAY      N N    .../OrderMapper.xml:23
com.example.order.OrderMapper.dynTable     select  ${TABLENAME}:R;CODE_MASTER:R                   N Y missingFrag .../OrderMapper.xml:24
Member.findMember                          statement DEPT:R;MEMBER:R  DEPT:R                      Y N    .../Legacy.xml:4
```

**알려진 한계:**

| 한계 | 결과 | 조치 |
|------|------|------|
| 테이블명은 대문자로 정규화, `${tableName}`도 대문자화 | `${TABLENAME}` | 원문의 `${}` 출처(호출부 파라미터)를 추적, 확신도 "미확인" |
| `<sql>` 조각 안의 동적 태그 | 조각 내용 전체를 정적으로 취급 | `dynamic=Y`가 아니어도 조각 원문 확인 |
| 뷰·시노님·DB 링크(`t@link`) | 테이블처럼 나옴 | DB 메타데이터(뷰 정의·시노님)와 대조 |
| 프로시저 내부 CRUD | `proc` 칸에 이름만 | DB에서 프로시저 소스를 따로 추출(SKILL.md 4-5) |
| 어노테이션 SQL(`@Select` 등)·`@SelectProvider`·Java 문자열 SQL | 잡지 않음 | SKILL.md 4-6 grep으로 별도 수집 |
| 함수 인자 속 `FROM`(EXTRACT·TRIM 등 외 다른 함수) | 컬럼명이 테이블로 오탐 가능 | 표본 대조 |
| 정의되지 않은 XML 엔티티(`&nbsp;` 등) | 파싱 실패(stderr) | 수동 확인 목록으로 |
| iBATIS ID 앞의 namespace | `namespace.id`로 출력 | `useStatementNamespaces=false`면 코드에서는 `id`만으로 호출 → 매칭 시 접두어 제거 |

---

## 3. crud_matrix.py — 프로세스 × 테이블 행렬

```python
#!/usr/bin/env python3
"""crud_matrix.py <process-sql.tsv> <sql-inventory.tsv> > crud-matrix.tsv
process-sql.tsv : 프로세스ID \t SQL ID \t 근거(파일:줄)   (5절 추적 결과)
sql-inventory.tsv: mapper_inventory.py 출력
출력: 행=테이블, 열=프로세스, 칸=C/R/U/D + 완전성 점검 칸. 읽기 전용.
"""
import sys
import collections


def rows(path):
    with open(path, encoding='utf-8') as fh:
        for line in fh:
            if line.strip() and not line.startswith('#'):
                yield line.rstrip('\n').split('\t')


def main(proc_path, inv_path):
    inv = {r[0]: r[2] for r in rows(inv_path) if len(r) > 2}
    links = [r for r in rows(proc_path) if len(r) >= 2]
    m = collections.defaultdict(lambda: collections.defaultdict(set))
    for r in links:
        proc, sql_id = r[0], r[1]
        if sql_id not in inv:
            print('[인벤토리에 없는 SQL ID -> 미확인] %s %s' % (proc, sql_id), file=sys.stderr)
            continue
        for item in filter(None, inv[sql_id].split(';')):
            tbl, ops = item.rsplit(':', 1)
            m[tbl][proc].update(ops)
    procs = sorted({r[0] for r in links})
    print('\t'.join(['TABLE'] + procs + ['없는 연산', 'C 다중']))
    for tbl in sorted(m):
        cells = [''.join(o for o in 'CRUD' if o in m[tbl][p]) for p in procs]
        allops = set().union(*m[tbl].values())
        lack = ''.join(o for o in 'CRUD' if o not in allops)
        multi_c = sum('C' in m[tbl][p] for p in procs) > 1
        print('\t'.join([tbl] + cells + [lack, 'Y' if multi_c else '']))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
```

`없는 연산`·`C 다중` 칸은 **판정이 아니라 단서**다. 해석(논리 삭제·외부 적재·이력 테이블 등)은 `spec-extraction-method` 5절 원인 표를 따른다.
