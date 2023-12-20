import React, { useEffect, useState } from "react";

interface CheckboxProps extends React.PropsWithChildren {
  id: string;
}
const ColorPicker = ({ id, children }: CheckboxProps) => {
  const [selectedColor, setSelectedColor] = useState<string>("#000000");

  useEffect(() => {
    chrome.storage.local.get([id], (res) => {
      setSelectedColor(res[id]);
    });
  }, []);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    chrome.storage.local.set({ [id]: newColor });
    document.documentElement.style.setProperty(`--${id}`, newColor);
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{children}</label>
      <div>
        <input
          type="color"
          id={id}
          value={selectedColor}
          onChange={handleColorChange}
        />
      </div>
    </div>
  );
};

export default ColorPicker;
