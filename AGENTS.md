# 치지직 플러스 에이전트 가이드

## 프로젝트 개요

치지직 플러스는 치지직 웹 사이트를 확장하는 Chrome Manifest V3 브라우저 확장 프로그램입니다. React 설정 화면과 content script를 통해 페이지의 동적 DOM에 기능과 UI를 추가합니다. 치지직의 비공개 API나 페이지 구조는 예고 없이 바뀔 수 있으므로, 기능 저하와 중복 주입에 안전하게 대응해야 합니다.

## 주요 구조

- `manifest.json`: 확장 프로그램 권한, content script, background service worker, web-accessible resource 정의입니다.
- `src/content.tsx`: 페이지 기능 초기화와 SPA 전환·DOM 재구성 감지의 진입점입니다.
- `src/background.ts`: storage 기본값과 runtime message 처리입니다.
- `src/feature/`: 치지직 페이지에 주입되는 개별 기능입니다.
- `src/page/`: 라이브·다시보기·카테고리 등 페이지별 편집 로직입니다.
- `src/components/`: 설정 화면과 주입 UI용 React 컴포넌트입니다.
- `src/utils/`: DOM 탐색, observer, storage, 치지직 데이터 접근 등의 공용 도우미입니다.
- `tests/`: Vitest와 jsdom 기반 회귀 테스트입니다.

## 작업 원칙

- TypeScript, ESLint, Prettier의 기존 규칙을 따릅니다. 새 의존성·빌드 도구는 작업상 필요할 때만 추가합니다.
- `manifest.json`의 permission, host permission, content script, web-accessible resource 변경은 최소 권한 원칙과 Chrome MV3 동작을 함께 검토합니다. 사용자 데이터·외부 전송·권한 범위를 넓히는 변경은 PR에 이유를 설명합니다.
- 치지직 DOM selector는 쉽게 깨질 수 있습니다. selector 변경이나 새 주입 기능은 대상 페이지·상태가 없을 때 안전하게 종료하고, 기존 기능이 없거나 지연 렌더링되는 경우를 고려합니다.
- `content.tsx`, `feature/`, `page/`의 초기화는 여러 번 실행되어도 중복 DOM·이벤트 리스너·observer를 만들지 않는 idempotent한 형태를 유지합니다. SPA URL 전환, 레이아웃 재생성, unmount 상황에서 timer·observer·listener 정리를 확인합니다.
- 채팅처럼 빈번히 바뀌는 DOM에는 과도한 MutationObserver 처리나 전체 DOM 재탐색을 피합니다. 필요한 범위만 관찰하고 debounce/throttle 또는 중복 방지를 사용합니다.
- `chrome.storage`의 키와 기본값은 기존 사용자의 저장 데이터를 깨지 않게 유지합니다. 새 설정은 background 기본값, 설정 UI, 실제 기능 사용처를 함께 갱신합니다.
- `public/inject.js`와 main world 주입은 isolated world 제약을 우회하는 경계입니다. 페이지와 확장 프로그램 간 데이터 교환을 최소화하고, 신뢰하지 않는 페이지 데이터는 검증합니다.
- 생성된 `dist/`, `dist.zip`, 무관한 이미지·빌드 산출물은 수정하지 않습니다.

## 검증

작업 중에는 관련 테스트를 먼저 실행하고, TypeScript·확장 기능·UI 변경을 마무리하기 전에 다음을 실행합니다.

```sh
yarn test
yarn lint
yarn build
```

새 기능 또는 DOM 회귀 수정에는 가능하면 `tests/`에 jsdom 회귀 테스트를 추가합니다. 실제 치지직 UI 동작은 자동 테스트만으로 보장할 수 없으므로, 변경한 페이지·라이브/다시보기 상태·설정 저장 동작을 수동으로 확인한 내용도 PR에 적습니다.

## PR 규칙

- 제목은 Conventional Commit 형식(`feat:`, `fix:`, `docs:`, `chore:` 등)으로 작성합니다.
- 사용자에게 보이는 기능 변화, manifest/권한 변화, 치지직 DOM 의존성, 호환성 위험과 검증 결과를 설명합니다.
- 기능 변경과 대규모 리팩터링은 가능하면 분리합니다.

## 코드 리뷰 우선순위

다음 문제를 우선적으로 지적합니다.

- 권한·host 범위 확대, 사용자 데이터 처리, main world 경계의 안전성 문제
- 치지직 DOM 변경 시 오류·중복 UI·중복 listener/observer·메모리 누수로 이어질 변경
- SPA 전환 또는 DOM 재생성에서 사라지거나 여러 번 실행되는 기능
- `chrome.storage` 키·기본값·설정 UI·기능 동작의 불일치
- 새 기능에 필요한 Vitest 회귀 테스트 또는 수동 검증 설명이 빠진 경우

Prettier나 ESLint가 처리하는 형식 문제만으로 리뷰 의견을 남기지 않습니다.
