import { useEffect, useState } from "react";

type OptionType = {
  name: string;
  value: string;
};

interface SelectProps extends React.PropsWithChildren {
  id: string;
  options: OptionType[];
}

export const Select = ({ id, options, children }: SelectProps) => {
  const [selectValue, setSelectValue] = useState<string>();

  useEffect(() => {
    chrome.storage.local.get([id], (res) => {
      console.log(id, res[id]);
      setSelectValue(res[id]);
    });
  }, []);

  const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
    chrome.storage.local.set({ [id]: e.target.value });
  };

  return (
    <>
      <div className="form-group">
        {children}
        <select value={selectValue} onChange={onChangeHandler}>
          {options.map((option) => (
            <option key={option.name} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
