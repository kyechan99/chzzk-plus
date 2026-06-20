import { useEffect, useState } from 'react';

import './Range.css';

interface RangeProps extends React.PropsWithChildren {
  id: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  digits?: number;
  className?: string;
}

export default function Range({
  id,
  min,
  max,
  step,
  defaultValue,
  unit = '',
  digits = 2,
  children,
  className,
}: RangeProps) {
  const [value, setValue] = useState<number>(defaultValue);

  useEffect(() => {
    chrome.storage.local.get([id], res => {
      setValue(typeof res[id] === 'number' ? res[id] : defaultValue);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    setValue(next);
    chrome.storage.local.set({ [id]: next });
  };

  const reset = () => {
    setValue(defaultValue);
    chrome.storage.local.set({ [id]: defaultValue });
  };

  return (
    <div className={`form-group czp-range-group ${className}`}>
      {children}
      <div className="czp-range-row">
        <input
          type="range"
          id={id}
          className="czp-range-input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
        />
        <span className="czp-range-value">
          {value.toFixed(digits)}
          {unit}
        </span>
        <button type="button" className="czp-range-reset" onClick={reset}>
          초기화
        </button>
      </div>
    </div>
  );
}
