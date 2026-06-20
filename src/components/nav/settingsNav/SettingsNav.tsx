import { useEffect, useRef, useState } from 'react';
import './SettingsNav.css';

export interface SettingsNavItem {
  id: string;
  label: string;
}

interface SettingsNavProps {
  items: SettingsNavItem[];
  scrollContainerRef: React.RefObject<HTMLElement>;
  title?: string;
}

/**
 * 좌측 TOC(목차) 네비게이션.
 * - 클릭 시 해당 섹션으로 즉시 스크롤 이동(jump)
 * - 우측 스크롤 영역을 IntersectionObserver로 관찰하여
 *   현재 보이는 섹션에 맞춰 active 상태를 자동으로 갱신
 */
function SettingsNav({ items, scrollContainerRef, title = '설정 메뉴' }: SettingsNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  // 클릭으로 직접 이동 중일 때는 옵저버가 활성 상태를 덮어쓰지 않도록 잠시 잠금
  const isClickScrolling = useRef(false);
  const clickScrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const sections = items.map(item => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // 각 섹션의 현재 교차 비율을 추적해서, "가장 위쪽에 보이는" 섹션을 active로 판단
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        // active 상태 반영만 클릭 스크롤 중에는 보류한다.
        if (isClickScrolling.current) return;

        const visibleIds = items.map(item => item.id).filter(id => (ratios.get(id) ?? 0) > 0);

        if (visibleIds.length > 0) {
          setActiveId(visibleIds[0]);
        }
      },
      {
        root: container,
        // 컨테이너 상단에 가까울수록 먼저 active로 인식되도록 상단 마진을 줄임
        rootMargin: '0px 0px -70% 0px',
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, [items, scrollContainerRef]);

  const handleClick = (id: string) => {
    const container = scrollContainerRef.current;
    const target = document.getElementById(id);
    if (!container || !target) return;

    isClickScrolling.current = true;
    setActiveId(id);

    target.scrollIntoView({ behavior: 'auto', block: 'start' });

    if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current);
    clickScrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 150);
  };

  return (
    <nav className="settings-nav" aria-label={title}>
      <h1 className="settings-nav-title">{title}</h1>
      <ul className="settings-nav-list">
        {items.map(item => (
          <li key={item.id}>
            <button
              type="button"
              className={`settings-nav-item${item.id === activeId ? ' active' : ''}`}
              onClick={() => handleClick(item.id)}
              aria-current={item.id === activeId ? 'true' : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SettingsNav;
