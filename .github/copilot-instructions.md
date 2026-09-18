# 치지직 플러스 Copilot 지침

- 이 프로젝트는 Chrome Manifest V3 기반 치지직 확장 프로그램입니다. `manifest.json`의 권한과 host 범위는 최소한으로 유지합니다.
- 치지직 DOM은 동적으로 교체될 수 있습니다. 주입 기능은 대상이 없을 때 안전하게 종료하고, SPA 전환·재렌더링에도 DOM, event listener, MutationObserver가 중복되지 않도록 작성합니다.
- 채팅 등 빈번한 DOM 변경에는 전체 재탐색이나 과도한 observer 작업을 피합니다.
- 새 설정은 `chrome.storage` 기본값, 설정 UI, 실제 기능 사용처를 함께 갱신합니다.
- `public/inject.js`는 main world 경계이므로 페이지 데이터를 신뢰하지 말고, 확장 프로그램과의 데이터 교환을 최소화합니다.
- `dist/`, `dist.zip`, 무관한 빌드 산출물은 수정하지 않습니다.
- 소스 변경 후 `yarn test`, `yarn lint`, `yarn build`를 실행합니다. DOM 회귀 수정이나 새 기능에는 가능하면 Vitest/jsdom 테스트를 추가합니다.
