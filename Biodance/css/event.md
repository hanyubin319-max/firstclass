# Event 페이지

- 경로: `Biodance/css/event.html`
- 스타일: `Biodance/css/event.css`
- 동작: `Biodance/css/event.js`

## 상단 구성
- 전체 인트로 프레임 높이: 220px
- 상단 여백: 72px
- Event 제목: 42px, 굵기 600, 행간 100%
- 설명: 공식몰에서만 진행하는 이벤트
- 설명 텍스트: 16px, 굵기 400, 행간 100%
- 제목 그룹 간격: 16px

## 이벤트 필터
상품 서브페이지의 목록 정렬 컨트롤과 같은 간격·테두리 규칙을 적용하고, 항목은 전체 / 진행중 / 종료로 구성합니다.

이벤트 데이터는 `event.js`의 `events` 배열에 추가합니다. 각 항목의 `status` 값은 `ongoing` 또는 `ended`입니다.
