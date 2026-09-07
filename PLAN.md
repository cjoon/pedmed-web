# PLAN — ChartRx 통합 (SOAP 차팅 + 소아 약물 용량 계산기)

## Context

pedcalc-med(소아 약물 용량 계산기, React 19 + Vite, GitHub Pages 배포 중)에
`dental-charting.html` 프로토타입(`~/projects/charting-template/`, 읽기 전용 참조)의
SOAP 차팅 템플릿 기능을 합쳐 하나의 앱(ChartRx)으로 만든다.
프로토타입은 단일 HTML에 기능이 누적되다 붕괴한 전력이 있으므로, 릴리스를 작게 나누고
각 단계마다 진료실 실사용 검증과 Codex 리뷰를 거친다.

**결정 사항 (2026-09-05, CJ 확정):**
- 코드 위치: 이 repo(pedcalc-med) 안에서 확장. 새 repo(chartrx) 사용 안 함
- 스택: 기존 그대로 — React JS/JSX + plain CSS + React state/localStorage
  (TypeScript·Tailwind·Zustand·dnd-kit 도입 안 함, v1.1 이후 재검토)
- 이번 라운드 범위: MVP = Initial Chart + Dosage 탭

---

## 조사 결과 (확정 사실)

- `.github/workflows/deploy.yml`: **`main` push → GitHub Pages 자동 배포.** 작업은
  `feat/chart-templates` 브랜치에서, main 머지는 CJ 승인 후에만.
- `vite.config.js` base `/pedcalc-web/` 유지.
- `src/calculations.js`, `src/medications.js`: 의존성 없는 순수 모듈. 수정 없이 재사용.
- `dental-charting.html` (1,572줄, sha1 `8873824…`, 로컬 사본과 업로드본 바이트 동일):
  - L605 `OPTIONS`(88개 placeholder), L606 `DEFAULT_OPTIONS`, L607 `PH_LABELS`
  - L610 `FACTORY_TEMPLATES`: 5 카테고리 24 procedure, `versions[]{id,label,S,O,A,P[]}`
  - L1318 `VN_TEMPLATES`, L1320 `VN_OPTIONS` (v1.1에서 사용 — **토큰 있음**, free-text 아님)
  - 토큰 규칙: `{ph}` = 드롭다운 토큰. `#{tooth}`는 `#`이 리터럴, 값은 번호만.
  - tooth 동기화(L701 `setFieldValue`): 값 입력 시 **비어 있는** tooth 토큰만 채움 → 개별 수정 가능.
  - 드롭다운(L708): 옵션 목록 + Custom 입력, ↑↓/Enter/Esc, 화면 밖이면 위로 뒤집힘.
  - 복사 포맷(L913 `getPlainChart`): 제목 + `=` 밑줄, `S: …` 한 줄, `P:`는 `  - step` 목록,
    미입력 토큰은 `[ph]`.
  - Visit 복사 포맷(L1464 `getVnPlainText`, v1.1용): 제목+날짜 헤더, `Outcome:`/`Next:` 포함.
  - localStorage key `chartrx_v2` = `{options, templates}`.
  - Reset(L884)은 같은 procedure를 다시 렌더해 값 초기화. Copy는 `navigator.clipboard.writeText` + toast.
  - 빈 상태/힌트 문구는 프로토타입 원문 그대로 사용 (예: "Pick a procedure to begin").
  - Settings(L1125–1128, v1.2용): Export/Import JSON, Reset ALL(confirm), 버전별 factory reset(confirm).
  - **모바일은 DOM 복제 구조**(`syncMobChart`)라 React로 그대로 이식하지 않는다. 하나의 상태를
    두 레이아웃(데스크톱/모바일)이 렌더하는 구조로 재설계.
  - **Tab 키 이동은 프로토타입에 없다** — v2 기획서의 요구사항이므로 신규 구현.
  - **CDT 코드·carpule→mg 환산 데이터는 HTML에 없음** — 아래 "데이터 결정" 참조.

---

## 아키텍처 (MVP)

### 네비게이션
```
Desktop: Topbar 탭  [ Initial Chart ] [ Visit Note ] [ Dosage ]   (Visit Note = v1.1, 완료)
         Chart 모드에서만 좌측 Sidebar(290px) 렌더
Mobile (≤700px): 하단 탭바 [ Chart ] [ Dosage ]
         Chart: procedure 패널(전체화면) ↔ 차트 뷰(전체화면, 뒤로가기)
```
mode 상태: `'chart' | 'dosage'` (`App.jsx` useState, 기본값 `'chart'`).

### 두 기능의 접점: 체중 공유
`weightKg`를 `App.jsx`로 끌어올려 Dosage 탭과 Chart의 마취 환산 행이 공유한다.
체중은 세션 한정(persist 안 함) — PHI 금지 원칙과 일관.

### 디렉토리
```
src/
  App.jsx                    ← 셸: mode 전환, weightKg 소유, Topbar/MobileNav
  App.css                    ← 셸 + 공통 스타일 (ChartRx 팔레트)
  index.css / main.jsx
  calculations.js            ← 그대로
  medications.js             ← 그대로
  dosage/
    DosageCalculator.jsx     ← 현재 App.jsx 본문 이동 (weightKg는 prop)
    dosage.css               ← `.app`→`.dosage`, `.main`→`.dosage-main`만 개명
  chart/
    data/
      initialTemplates.js    ← FACTORY_TEMPLATES 그대로 (VERBATIM)
      dropdownOptions.js     ← OPTIONS, PH_LABELS 그대로
      cdtCodes.js            ← procedure key → CDT 코드 배열 (CJ 제공)
      anesthetics.js         ← 마취제 스펙
    useChartData.js          ← storage 있으면 그것, 없으면 factory. v1.2 Settings 연결점
    storage.js                ← load/save `chartrx_v2`
    serializer.js              ← 차트 상태 → plain text (프로토타입 포맷 + CDT 줄)
    anesthesia.js              ← carpule 수 → mg 환산, 체중 대비 max (순수 함수)
    ChartView.jsx / Sidebar.jsx / ChartCard.jsx / SoapRow.jsx
    FieldToken.jsx / FieldDropdown.jsx / ToothSelector.jsx
    AnesthesiaRow.jsx / CdtRow.jsx / chart.css
```

### 상태 모델 (ChartView 내부, useReducer 하나)
```js
{
  activeKey: "restorative/direct_resto" | null,
  versionId: "v1" | null,
  fieldValues: { [tokenId]: string },   // tokenId = `${row}:${index}`
  selectedTeeth: ["3","14"],
  cdtCodes: ["D2140"],
  anesthesia: { agentIdx, carpules }
}
```
- procedure 변경 시 fieldValues/selectedTeeth/anesthesia 초기화, cdtCodes는 새 템플릿 기본값.
- 다중 치아 값: `teeth.join(", #")` → 본문에 `#3, #14, #19`.

---

## 구현 순서 — 단계마다 Codex 리뷰 게이트 통과 필수

각 Phase는 **`npm run build`/`npm run lint` 통과 → Codex 리뷰(`/review`) → P0/P1 수정 →
다음 Phase**의 순서로 진행한다. P2/P3는 보고만 하고 남겨둔다.

### Phase 0 — 준비
- [x] branch `feat/chart-templates` 생성
- [x] `PLAN.md`·`PLAN_chartrx.md`를 이 문서로 통합, `PLAN_chartrx.md` 삭제
- [x] Codex 리뷰: 문서 변경 확인

### Phase 1 — 데이터 이식
- [x] `initialTemplates.js`: `FACTORY_TEMPLATES` 그대로 복사 (문구 변경 금지)
- [x] `dropdownOptions.js`: `OPTIONS`, `PH_LABELS` 그대로 복사
- [x] 파리티 검증 스크립트 `scripts/check-data-parity.mjs`: HTML의 해당 리터럴을 평가한 값과
      모듈 export를 비교, 불일치 시 exit 1
- [x] `cdtCodes.js`, `anesthetics.js`: 실제 procedure/agent 키로 뼈대만 작성. CJ 미제공 값(CDT
      코드 전체, Articaine/Mepivacaine/Bupivacaine max mg/kg)은 빈 배열/`null`(UNKNOWN) —
      추정하지 않음
- [x] Codex 리뷰 → P0/P1 수정 (findings 없음, PASS)

### Phase 2 — 셸 분리 (Dosage 회귀 없이)
- [x] `App.jsx` 본문 → `dosage/DosageCalculator.jsx` 이동, 로직 변경 없음
- [x] `App.css` → 셸 공통 + `dosage/dosage.css` 분리
- [x] `App.jsx`: mode 상태 + Topbar 탭 + MobileNav
- [x] Disclaimer 전체화면 게이트 제거, `disclaimerAccepted` 키 정리 (5항목을 상시 노출 푸터로 이전,
      결과 카드 내 한 줄 문구도 안전상 유지 — Codex 리뷰에서 확인)
- [x] 디자인 토큰: ChartRx 팔레트(`--bg #f4f2ec`, `--accent #0f5c4a`, `--amber #c4702a` 등) 적용
- [x] `index.html` title → "ChartRx — Charting & Dosage"
- **게이트:** `npm run build` exit 0, Dosage 회귀 검증 케이스 통과 → Codex 리뷰 (3라운드, 최종 PASS)

### Phase 3 — Initial Chart
- [x] `Sidebar.jsx`: 카테고리 헤더, 검색 필터, 버전 pill
- [x] `ChartCard.jsx` + `SoapRow.jsx`, `{ph}` → `FieldToken`
- [x] `FieldToken.jsx`: amber 버튼 + Tab 이동 (신규 기능 — 네이티브 `<button>` + `:focus-visible`)
- [x] 빈 상태/힌트 문구는 프로토타입 원문 그대로
- [x] `FieldDropdown.jsx`: 옵션 + Custom 입력, ↑↓/Enter/Esc, 화면 밖 뒤집기, 모바일 bottom sheet
- [x] `ToothSelector.jsx`: 다중 선택, 값 `teeth.join(", #")`. 선택 0개로도 Apply 가능(필드 개별 삭제)
- [x] `AnesthesiaRow.jsx`: 마취제/carpule → mg 환산, 체중 대비 max 초과 시 경고. `weightKg`를
      `App.jsx`로 끌어올려 Dosage 탭과 공유(Phase 2에서 보류했던 항목, Codex P2로 재확인 후 처리)
- [x] `CdtRow.jsx`: 기본 CDT 코드 칩 + 추가/삭제
- [x] `serializer.js`: 프로토타입 `getPlainChart` 포맷 + 마지막 CDT 줄
- [x] Copy(`navigator.clipboard.writeText` + toast), 모바일 패널 전환, 44px 터치 타겟
- **게이트:** build/lint 통과 + 검증 케이스(Playwright로 브라우저 실사용 확인) → Codex 리뷰
  (3라운드 — Custom 입력 버블링, 모바일 bottom sheet, 음수 carpule, 치아 삭제 불가 수정 후 최종 PASS)
- **보류(v1.2 이후):** `useChartData.js`/`storage.js` — MVP는 템플릿 편집(Settings) 기능이 없어
  저장할 대상이 없음. Settings 붙일 때 추가

### Phase 4 — 문서 마무리
- [x] `CLAUDE.md`/`AGENTS.md` File Map을 실제 구조로 갱신
- [x] Domain Rules에 추가: 템플릿 문구 VERBATIM 이식 원칙, PHI 필드 금지, 마취 최대 용량
      단일 소스(`medications.js`) 유지
- [ ] Codex 리뷰 → 최종 확인

### Phase 5 — 편집/확정 단계, Suture, 처방, S/O 다중선택 (2026-09-06 요청)

CJ 요청 4건. 작업 브랜치 `feat/review-flow`.

- [x] 5a: `src/shared/DraftEditor.jsx` / `FinalOutput.jsx` + Chart의 fill → edit → final 단계.
      Copy는 final 단계에서만. Next는 항상 토큰 값에서 초안을 재생성(자유 편집분은 버림)
- [x] 5b: `useAnchoredPopover.js`로 팝오버 위치/닫기 로직 공통화 → `SutureSelector.jsx`
      (굵기 3-0~6-0 + 재질 7종, CJ 확정 목록, 값 형식 `4-0 silk`). `OPTIONS.suture`는 미수정
- [x] 5c: Dosage 탭 calc → rx → final. `rx.js`(초안·텍스트 생성, 용량 계산 없음),
      `rxOptions.js`(route/frequency/refills), `RxEditor.jsx`. final에서 복사/인쇄.
      주사제(카풀 계량)는 route 기본값 공란 — "by mouth" 오기재 방지
- [x] 5d: `{+ph}` 다중선택 토큰(`tokenize.js`, `fieldValue.js`, `MultiSelectDropdown.jsx`),
      `soOptions.js`(16 그룹 219 항목), `soOverrides.js`(32 version S/O 전부),
      `templates.js`(FACTORY_TEMPLATES + 오버레이, 불일치 시 throw).
      parity 스크립트에 "S/O 외 전부 동일" 검사 추가
- [x] 5e: CLAUDE.md/AGENTS.md File Map·Domain Rules, PLAN.md 갱신
- [ ] Codex 리뷰 → P0/P1 수정
- **CJ 검토 대기:** `src/chart/data/soOptions.js`의 소견 어휘, `src/dosage/rxOptions.js`의
      sig 문구. 둘 다 임상 문구일 뿐 용량 데이터가 아님

---

## 데이터 결정 (CJ 확인 필요 — 확인 전엔 UNKNOWN)

| 항목 | 상태 | 비고 |
|---|---|---|
| carpule 용량 | 확정 | `medications.js` 기준 1.7 mL 사용 |
| Lidocaine 2% epi 최대 | 확정 | `medications.js` 4.4 mg/kg, absolute 500 mg (AAPD) |
| Articaine / Mepivacaine / Bupivacaine 최대 mg/kg | UNKNOWN | 제공 전엔 mg 환산만 표시, max 경고 없음 |
| CDT 코드 매핑 (24 procedure) | UNKNOWN | 미제공 procedure는 빈 배열 |
| 신규 procedure 5개 문구 (Emergency exam, Occlusal adj, Night guard, Denture reline, Re-cement, Post-op check) | UNKNOWN | 문구는 CJ 작성 후 추가. 코드 구조는 데이터만 넣으면 되게 준비 |

---

## 후속 로드맵 (각 릴리스 후 실사용 검증)

| 릴리스 | 범위 | 검증 |
|---|---|---|
| **MVP (이번)** | Initial Chart + Dosage 탭 + 모바일 반응형 | 2주 실사용, 차팅 시간 측정 |
| ~~v1.1~~ ✅ | Visit Notes(`VN_TEMPLATES`/`VN_OPTIONS`, FieldToken 재사용), 방문별 탭, Outcome/Next, 날짜+CDT 포함 복사, 하단 탭바 3개 | visit note 90초 이내 |
| v1.2 | Settings(Templates/Options 편집, Export/Import JSON, Reset), `useChartData`/`storage.js` 연결 | 병원 커스텀 설정 완성 |
| v2.0 | PWA(오프라인, 업데이트 배너). 배포는 GitHub Pages 유지 | 다기기 사용 |

---

## 검증

```
npm run build          # exit 0
npm run lint            # exit 0
node scripts/check-data-parity.mjs   # HTML vs 모듈 데이터 동일
npm run dev              # 수동 확인
```

**Dosage 회귀 (Phase 2 후, 현재 앱과 결과 동일해야 함)**
- 20 kg, Tylenol 160 mg/5 mL → per dose 300 mg, 9.4 mL, max/day 1500 mg
- 20 kg, Amoxicillin 400 mg/5 mL, High dose → 450 mg q12h
- 45 kg, Advil 200 mg tab → Adult 800 mg, 4 tab
- 15 kg, Lidocaine → 66 mg, 3.3 mL, 1.9 carpule
- 60 kg, Azithromycin Day 1 → 500 mg (absolute cap)

**Chart (Phase 3 후)**
- Extraction → Simple, tooth 토큰에 `3` 입력 → 나머지 tooth 토큰 자동 `3`, 하나만 `4`로 개별 수정 가능
- ToothSelector에서 3,14 선택 → 본문 `#3, #14`
- 15 kg + Lidocaine 2 carpules → 68 mg, max 66 mg 초과 경고 표시
- Copy 결과가 프로토타입 `getPlainChart` 포맷과 동일 + 마지막 CDT 줄
- 미입력 토큰 `[anesthetic]` 형식, 카운터 `filled/total` 정확
- 375px 폭: 패널 전환, 드롭다운 bottom sheet, 하단 탭바
- localStorage에 `chartrx_v2` 외 키 없음, 체중·차트 값은 새로고침 시 초기화

**배포:** main 머지 전 CJ 승인. 머지 즉시 GitHub Pages 반영됨.
