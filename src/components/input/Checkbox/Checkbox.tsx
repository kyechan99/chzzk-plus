import { useEffect, useState } from 'react';

import './Checkbox.css';

interface CheckboxProps extends React.PropsWithChildren {
  id: string;
  className?: string;
  disabled?: boolean;
}

export default function Checkbox({ id, children, className, disabled }: CheckboxProps) {
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.local.get([id], res => {
      setChecked(res[id]);
    });
  }, []);

  const onChangeHandler = () => {
    if (disabled) return;
    const curChecked = !checked;
    setChecked(curChecked);
    chrome.storage.local.set({ [id]: curChecked });
  };

  return (
    <div className={`form-group ${className ?? ''} ${disabled ? 'is-disabled' : ''}`}>
      {children}
      <input
        checked={checked}
        onChange={onChangeHandler}
        className="form-switch-input"
        type="checkbox"
        id={id}
        disabled={disabled}
      />
      <label className="form-switch-label" htmlFor={id}>
        Switch
      </label>
    </div>
  );
}
