/**
 * 비디오 필터 (cheese-knife 의 영상 필터 응용).
 *
 * 견고성을 위해 하이브리드로 구성한다.
 *  - 밝기/대비/채도: 네이티브 CSS filter 함수(brightness/contrast/saturate). SVG url 참조가
 *    필요 없어 어떤 환경에서도 안정적으로 적용된다.
 *  - 감마/선명도: CSS 함수로 표현 불가하므로 SVG <filter>(feComponentTransfer gamma /
 *    feConvolveMatrix)를 만들어 url(#id) 로 덧붙인다.
 *
 * 플레이어가 영상에 자체 filter 를 inline 으로 줄 수 있어 !important 로 우선순위를 확보한다.
 * 값은 storage 에 저장되어 슬라이더로 실시간 조절된다. 전부 기본값이면 아무 효과도 주지 않는다.
 */
import {
  VIDEO_BRIGHTNESS,
  VIDEO_CONTRAST,
  VIDEO_GAMMA,
  VIDEO_SATURATION,
  VIDEO_SHARPNESS,
  VIDEO_FILTER_KEYS,
  VIDEO_FILTER_DEFAULTS,
} from '../constants/storage';
import { WEBPLAYER_VIDEO } from '../constants/class';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FILTER_ID = 'czp-video-filter';
const STYLE_ID = 'czp-video-filter-style';
const ACTIVE_CLASS = 'czp-video-filtered';

let svgFilterEl: SVGFilterElement | null = null;
let styleEl: HTMLStyleElement | null = null;
let initialized = false;

const createSvgEl = (name: string): SVGElement => document.createElementNS(SVG_NS, name) as SVGElement;

const ensureSvgFilter = (): SVGFilterElement => {
  if (svgFilterEl) return svgFilterEl;

  const svg = createSvgEl('svg') as SVGSVGElement;
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.style.pointerEvents = 'none';

  const filter = createSvgEl('filter') as SVGFilterElement;
  filter.setAttribute('id', FILTER_ID);
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  svg.appendChild(filter);
  (document.body || document.documentElement).appendChild(svg);
  svgFilterEl = filter;
  return filter;
};

const ensureStyle = (): HTMLStyleElement => {
  if (styleEl) return styleEl;
  styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  (document.head || document.documentElement).appendChild(styleEl);
  return styleEl;
};

/** 감마/선명도용 SVG 필터 프리미티브를 (필요할 때만) 채운다. */
const buildSvgChildren = (v: Record<string, number>): boolean => {
  const out: SVGElement[] = [];

  const gamma = v[VIDEO_GAMMA];
  if (!isNaN(gamma) && gamma !== 1) {
    const transfer = createSvgEl('feComponentTransfer');
    for (const ff of ['feFuncR', 'feFuncG', 'feFuncB']) {
      const func = createSvgEl(ff);
      func.setAttribute('type', 'gamma');
      func.setAttribute('exponent', String(gamma));
      transfer.appendChild(func);
    }
    out.push(transfer);
  }

  const sharp = v[VIDEO_SHARPNESS];
  if (sharp > 0) {
    const s = Number((sharp / 5).toFixed(2));
    const conv = createSvgEl('feConvolveMatrix');
    conv.setAttribute('preserveAlpha', 'true');
    conv.setAttribute('kernelMatrix', `0 ${-s} 0 ${-s} ${1 + s * 4} ${-s} 0 ${-s} 0`);
    out.push(conv);
  }

  if (out.length === 0) return false;
  ensureSvgFilter().replaceChildren(...out);
  return true;
};

/** CSS filter 문자열을 만든다 (네이티브 함수 + 필요 시 SVG url). */
const buildCssFilter = (v: Record<string, number>): string => {
  const parts: string[] = [];

  const b = v[VIDEO_BRIGHTNESS];
  const c = v[VIDEO_CONTRAST];
  const s = v[VIDEO_SATURATION];
  if (!isNaN(b) && b !== 1) parts.push(`brightness(${b})`);
  if (!isNaN(c) && c !== 1) parts.push(`contrast(${c})`);
  if (!isNaN(s) && s !== 1) parts.push(`saturate(${s})`);

  if (buildSvgChildren(v)) parts.push(`url(#${FILTER_ID})`);

  return parts.join(' ');
};

const apply = (values: Record<string, number>): void => {
  const css = buildCssFilter(values);
  const style = ensureStyle();
  style.textContent = css ? `html.${ACTIVE_CLASS} ${WEBPLAYER_VIDEO} { filter: ${css} !important; }` : '';
  document.documentElement.classList.toggle(ACTIVE_CLASS, css.length > 0);
};

const readAndApply = (): void => {
  chrome.storage.local.get(VIDEO_FILTER_KEYS, res => {
    const values: Record<string, number> = {};
    for (const key of VIDEO_FILTER_KEYS) {
      values[key] = typeof res[key] === 'number' ? res[key] : VIDEO_FILTER_DEFAULTS[key];
    }
    apply(values);
  });
};

export const initVideoFilter = (): void => {
  if (initialized) return;
  initialized = true;

  readAndApply();

  chrome.storage.onChanged.addListener(changes => {
    if (VIDEO_FILTER_KEYS.some(key => key in changes)) readAndApply();
  });
};
