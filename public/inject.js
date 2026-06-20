/**
 * Cheese Plus - MAIN world inject script
 *
 * 이 스크립트는 페이지(MAIN world) 컨텍스트에서 실행된다. content script(ISOLATED world)
 * 에서는 접근할 수 없는 React 내부(__reactFiber$ / __reactProps$)를 읽기 위함이다.
 *
 * 핵심 아이디어:
 *  - DOM attribute 는 ISOLATED/MAIN world 간 공유된다.
 *  - 따라서 여기서 fiber 로 읽은 정보를 chzzk DOM 노드에 data-czp-* 속성으로 "찍어"두면,
 *    content script 는 난독화 클래스명에 의존하지 않고 안정적인 속성으로 채팅을 다룰 수 있다.
 *  - 이 스크립트가 동작하지 않아도(예: chzzk 내부 구조 변경) content script 는 기존
 *    클래스 기반 로직으로 자동 폴백하므로 안전하다.
 *
 * 번들러로 처리하면 안 된다(crxjs 의 content-script 로더는 chrome API 에 의존하는데
 * MAIN world 에는 chrome 이 없다). 그래서 의존성 없는 순수 JS 로 작성하고 public/ 에 둔다.
 */
(function () {
  'use strict';

  if (window.__czpInjected) return;
  window.__czpInjected = true;

  var CHAT_ROOT_SELECTOR = '#aside-chatting';

  function getReactProps(node) {
    for (var key in node) {
      if (key.indexOf('__reactProps$') === 0) return node[key];
    }
    return null;
  }

  function getReactFiber(node) {
    for (var key in node) {
      if (key.indexOf('__reactFiber$') === 0 || key.indexOf('__reactInternalInstance$') === 0) {
        return node[key];
      }
    }
    return null;
  }

  // chzzk 의 채팅 메시지 객체를 props / fiber 트리에서 찾는다.
  // 경로 props.children.props.chatMessage 는 경쟁 서비스(cheese-knife)가 동일 사이트에서
  // 실제로 사용하는 검증된 경로다. 내부 구조 변경에 대비해 fiber 탐색으로 폴백한다.
  function findChatMessage(node) {
    var props = getReactProps(node);
    if (props) {
      var fromProps =
        (props.children && props.children.props && props.children.props.chatMessage) ||
        props.chatMessage;
      if (fromProps) return fromProps;
    }
    var fiber = getReactFiber(node);
    var depth = 0;
    while (fiber && depth < 8) {
      var p = fiber.memoizedProps;
      if (p && p.chatMessage) return p.chatMessage;
      fiber = fiber.child;
      depth++;
    }
    return null;
  }

  // chzzk 의 chatMessage.profile 은 JSON 문자열 또는 객체일 수 있어 둘 다 처리한다.
  function extractNickname(chatMessage) {
    if (!chatMessage) return null;
    var profile = chatMessage.profile;
    if (typeof profile === 'string') {
      try {
        profile = JSON.parse(profile);
      } catch (e) {
        profile = null;
      }
    }
    return (
      (profile && profile.nickname) ||
      chatMessage.nickname ||
      (chatMessage.userProfile && chatMessage.userProfile.nickname) ||
      null
    );
  }

  function stampChatItem(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.hasAttribute('data-czp-chat-item')) return;
    var msg = findChatMessage(el);
    if (!msg) return;
    el.setAttribute('data-czp-chat-item', '');
    var nick = extractNickname(msg);
    if (nick != null) el.setAttribute('data-czp-nick', String(nick));
  }

  // 채팅 영역 안에서 추가되는 노드만 처리해 비용을 제한한다.
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if (!node.closest || !node.closest(CHAT_ROOT_SELECTOR)) continue;
        stampChatItem(node);
      }
    }
  });

  function start() {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // 이미 그려져 있는 채팅도 한 번 처리
    var root = document.querySelector(CHAT_ROOT_SELECTOR);
    if (root) {
      var items = root.querySelectorAll('*');
      for (var k = 0; k < items.length; k++) stampChatItem(items[k]);
    }
  }

  if (document.documentElement) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
})();
