---
name: pdf-inventory-form-workflow
description: 술·음료 재고량 표 PDF 생성 작업 — 레이아웃 사양·스크립트 요지·품목 리스트. 사진 없이 말로 받는 양식 생성의 기준
metadata: 
  node_type: memory
  type: project
  originSessionId: abdc9334-52d5-400c-8a03-e7acd72da2bd
  modified: 2026-08-13T01:50:45.515Z
---

# 술·음료 재고량 표 PDF 생성 워크플로우 (2026-08-13 수용 완료)

가게(홀/주방 근무표와 같은 곳) 운영 서식 시리즈 중 하나. 사진 없이 **말로 항목을 불러주면
인쇄용 A4 표를 만드는** 유형이다. 산출물 폴더는 [[pdf-schedule-form-workflow]]·
[[pdf-blank-generation-workflow]]와 같은 `<프로젝트 루트>/pdf변환/`.

## 확정 사양 (사용자 수용본)

- A4 **세로**(595×842pt), 여백 40pt, 표는 가로 중앙 정렬
- 제목 "술 음료 재고량" 24pt, 상단 중앙
- 3열 — **품목 130pt / 재고량 270pt(가장 넓게) / 기타 115pt**. "재고량을 길게"가 사용자 요구
- 헤더행 34pt + 데이터행 36pt (손글씨 기입용, 12.7mm)
- 행 = 품목 15개 + **여분 3줄**(빈 행). 여분 줄은 매번 요청에 포함됨
- 괘선: 외곽·헤더 상하 1.8pt / 행 구분 0.8pt
- 음영: 헤더 0.90, **데이터행 한 줄 걸러 0.93**(2차 피드백으로 추가 — "한줄씩 음영넣어서 구분")
  여분 3줄까지 같은 패턴 유지
- 폰트: `/System/Library/Fonts/Supplemental/AppleGothic.ttf`

## 품목 리스트 (2026-08-13 기준)

후레쉬, 처음처럼, 빨참 클래식, 이즈백, 새로, 청하, 카스, 테라, 켈리, 막걸리,
복분자, 콜라, 사이다, 환타 오렌지, 환타 파인

재요청 시 이 리스트를 기본값으로 제시하고 **추가·삭제 품목이 있는지 확인**한다.

## 구현 메모

- 스크립트 `pdf변환/make-inventory.py`, 검증 `make-inventory.test.py` (13 케이스)
- 음영은 괘선보다 **먼저** 그린다 (덮이면 선이 흐려짐)
- 텍스트 중앙 정렬: `fitz.Font(fontfile=...).text_length()`로 폭 측정,
  baseline = 셀중앙 + size×0.36 — 자세한 함정은 [[pdf-schedule-form-workflow]] 참조
- 검증 포인트: 품목명이 품목 열을 침범하지 않는지, 여분 3행이 비어 있는지,
  음영 간격이 행 높이의 정확히 2배인지, 음영이 0.88보다 진하지 않은지(글씨 가독성)

## 절차

1. 품목 리스트·여분 줄 수 확인 → 스크립트 + test.py 작성 → 테스트 PASS
2. PDF 생성 후 **PNG 렌더(dpi 110) → Read로 육안 대조**
3. PDF와 미리보기 PNG를 함께 전달 ([[output-revision-delivery]])
