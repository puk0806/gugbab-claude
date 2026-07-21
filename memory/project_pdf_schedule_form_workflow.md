---
name: pdf-schedule-form-workflow
description: 손글씨 근무표 사진 → 컴퓨터 글씨 PDF 재현 작업 — 레이아웃 사양·스크립트 전문·시행착오. 파일은 사용 후 삭제되며 재요청 시 이 메모리로 재작성
metadata: 
  node_type: memory
  type: project
  originSessionId: f4092d88-c30f-4877-9451-e69fc9f153d4
---

# 근무표(홀/주방 주간표) PDF 생성 워크플로우 (2026-07-15 확립, 재요청 예정)

입력: 손글씨 표 사진(프로젝트 루트 Image.jpeg 등) → 같은 형태를 컴퓨터 글씨로 재현한 인쇄용 PDF.
**사용자가 작업 후 pdf변환/ 산출물·스크립트를 전부 삭제함 — 재요청 시 이 메모리만으로 재작성한다.**
[[pdf-blank-generation-workflow]]와 같은 폴더(`<프로젝트 루트>/pdf변환/`)를 쓰는 별개 반복 작업.

## 확정된 레이아웃 사양 (사용자 수용 완료본)

- A4 가로(842×595pt), 여백 36pt, 왼쪽 라벨 열 50pt + 요일 7열(월~일) 균등
- 행: 요일 헤더 1행 + **홀 8행 + 주방 8행** (행 수는 매번 AskUserQuestion으로 확인 — 사진은 5/6이었으나 사용자가 8/8 선택)
- 괘선: 일반 0.9pt / **요일 헤더 밑줄 1.7pt(MID)** / **홀·주방 구분선 2.6pt 전체 폭** / 외곽 테두리 1.2pt
- 라벨 열: 섹션별 병합 셀(가로선이 라벨 열을 통과하지 않음 — 통과시키면 세로쓰기 글자와 겹쳐 지저분), "홀"·"주방" 세로쓰기(글자별 gap=size×1.35), 크기 20pt / 요일 14pt
- 음영(2차 피드백로 추가): 요일 헤더 행 회색 0.90, **화·목·토 열 교대 음영 0.965** — 요일 간 구분용. 괘선보다 먼저 그린다
- 폰트: `/System/Library/Fonts/Supplemental/AppleGothic.ttf` (macOS 기본)

## 시행착오 (재작성 시 그대로 회피)

1. `fitz.get_text_length(fontname=...)`는 커스텀 폰트 미지원 → **`fitz.Font(fontfile=...).text_length()`로 측정**, 삽입은 `page.insert_font(fontname="kr", fontfile=...)` 후 `insert_text`
2. 수직 중앙 정렬 근사: baseline = cy + size×0.36
3. tdd-guard 훅이 `pdf변환/*.py` Write를 차단(scripts/만 예외) → **대응 `*.test.py`를 함께 작성**해야 함 (구조 검증: 가로선 18·세로선 9·굵은선 1·텍스트 존재)
4. 시스템 python에 fitz 없음, uv 없음 → 스크래치패드에 `python3 -m venv` + `pip install pymupdf`
5. 상·하단 테두리를 별도 hline으로 중복 그리지 말 것 (선 개수 검증 깨짐)

## 스크립트 전문 (최종 수용본 — make-schedule.py)

```python
import sys, pathlib, fitz

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "근무표.pdf")
FONT_PATH = "/System/Library/Fonts/Supplemental/AppleGothic.ttf"
DAYS = ["월", "화", "수", "목", "금", "토", "일"]
HALL_ROWS = 8
KITCHEN_ROWS = 8
PAGE_W, PAGE_H = fitz.paper_size("a4-l")
MARGIN = 36
LABEL_COL_W = 50
THIN, MID, THICK = 0.9, 1.7, 2.6
HEADER_GRAY, STRIPE_GRAY = 0.90, 0.965

doc = fitz.open()
page = doc.new_page(width=PAGE_W, height=PAGE_H)
page.insert_font(fontname="kr", fontfile=FONT_PATH)
FONT = fitz.Font(fontfile=FONT_PATH)

x0, y0 = MARGIN, MARGIN
x1, y1 = PAGE_W - MARGIN, PAGE_H - MARGIN
day_col_w = (x1 - x0 - LABEL_COL_W) / len(DAYS)
n_rows = 1 + HALL_ROWS + KITCHEN_ROWS
row_h = (y1 - y0) / n_rows

def hline(y, width, from_x=None):
    page.draw_line((from_x if from_x is not None else x0, y), (x1, y),
                   color=(0, 0, 0), width=width)

def vline(x, width=THIN):
    page.draw_line((x, y0), (x, y1), color=(0, 0, 0), width=width)

# 배경 음영 (괘선보다 먼저)
header_bottom = y0 + row_h
page.draw_rect(fitz.Rect(x0, y0, x1, header_bottom), color=None, fill=(HEADER_GRAY,) * 3)
for i in range(1, len(DAYS), 2):  # 화·목·토
    sx = x0 + LABEL_COL_W + day_col_w * i
    page.draw_rect(fitz.Rect(sx, header_bottom, sx + day_col_w, y1),
                   color=None, fill=(STRIPE_GRAY,) * 3)

# 가로선
divider_y = y0 + row_h * (1 + HALL_ROWS)
for i in range(n_rows + 1):
    y = y0 + row_h * i
    if abs(y - divider_y) < 0.1:
        hline(y, THICK)                      # 홀/주방 구분 — 전체 폭
    elif i == 0 or i == n_rows:
        hline(y, THIN + 0.3)                 # 상·하단 테두리
    elif i == 1:
        hline(y, MID)                        # 요일 헤더 밑줄
    else:
        hline(y, THIN, from_x=x0 + LABEL_COL_W)  # 라벨 열은 병합 셀

# 세로선
vline(x0, THIN + 0.3)
vline(x0 + LABEL_COL_W)
for i in range(1, len(DAYS)):
    vline(x0 + LABEL_COL_W + day_col_w * i)
vline(x1, THIN + 0.3)

def center_text(cx, cy, text, size):
    w = FONT.text_length(text, fontsize=size)
    page.insert_text((cx - w / 2, cy + size * 0.36), text,
                     fontname="kr", fontsize=size, color=(0, 0, 0))

for i, day in enumerate(DAYS):
    center_text(x0 + LABEL_COL_W + day_col_w * (i + 0.5), y0 + row_h / 2, day, 14)

def section_label(text, top, bottom, size=20):
    cx = x0 + LABEL_COL_W / 2
    gap = size * 1.35
    start = (top + bottom) / 2 - gap * (len(text) - 1) / 2
    for i, ch in enumerate(text):
        center_text(cx, start + gap * i, ch, size)

section_label("홀", y0 + row_h, divider_y)
section_label("주방", divider_y, y1)

doc.save(OUT)
```

## 절차

1. 사진 Read → 구조 파악 → 이해 확인 + 행 수 등 AskUserQuestion으로 확정 후 착수
2. venv 준비 → 스크립트 + test.py 작성 → 테스트 PASS → PDF 생성
3. **생성 PDF를 PNG 렌더(dpi 110)해서 Read로 육안 대조** 후 결과 보고
