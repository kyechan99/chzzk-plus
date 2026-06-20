import { ReactNode, useState } from 'react';
import './Collapsible.css';

interface CollapsibleProps {
  /** 토글 버튼에 표시할 라벨 (예: "그룹 3개") */
  label: ReactNode;
  /** 펼쳤을 때 보여줄 내용 */
  children: ReactNode;
  /** 초기 펼침 상태 (기본값: false) */
  defaultExpanded?: boolean;
}

export default function Collapsible({ label, children, defaultExpanded = false }: CollapsibleProps) {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="czp-collapsible">
      <button
        type="button"
        className="czp-collapsible-toggle"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <span>{label}</span>
        <svg
          className={`czp-collapsible-caret ${expanded ? 'is-open' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 9l6 6l6 -6" />
        </svg>
      </button>

      {expanded && children}
    </div>
  );
}
