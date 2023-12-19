import { useEffect, useState } from "react";

import "./Checkbox.css";

interface CheckboxProps extends React.PropsWithChildren {
  id: string;
}

export default function Checkbox({ id, children }: CheckboxProps) {
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.local.get([id], (res) => {
      setChecked(res[id]);
    });
  }, []);

  const onChangeHandler = () => {
    const curChecked = !checked;
    setChecked(curChecked);
    chrome.storage.local.set({ [id]: curChecked });
  };

  return (
    <div className="form-group">
      {children}
      <input
        checked={checked}
        onChange={onChangeHandler}
        className="form-switch-input"
        type="checkbox"
        id={id}
      />
      <label className="form-switch-label" htmlFor={id}>
        Switch
      </label>
    </div>
  );
}
