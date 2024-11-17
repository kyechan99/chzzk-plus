import { useEffect, useState } from "react";
import "./List.css";
import TextInput from "../input/TextInput/TextInput";
import TextButton from "../button/TextButton/TextButton";
import CloseButton from "../button/CloseButton/CloseButton";

interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  inputPlaceholder?: string;
  saveButtonText?: string;
}

const List = ({
  children,
  id,
  inputPlaceholder = "입력해주세요",
  saveButtonText = "추가",
  ...props
}: ListProps) => {
  const [listItems, setListItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<string>("");

  useEffect(() => {
    chrome.storage.local.get([id], (result) => {
      if (result[id]) {
        setListItems(result[id]);
      }
    });
  }, []);

  const handleAddItem = () => {
    if (newItem.trim() !== "") {
      const updatedItems = [...listItems, newItem.trim()];
      setListItems(updatedItems);
      setNewItem("");
      chrome.storage.local.set({ [id]: updatedItems });
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = listItems.filter((_, i) => i !== index);
    setListItems(updatedItems);
    chrome.storage.local.set({ [id]: updatedItems });
  };

  return (
    <div id="czp-list" {...props}>
      {children}
      <div id="czp-list-input-wrapper">
        <TextInput
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={inputPlaceholder}
        >
          <TextButton
            text={saveButtonText}
            onClick={handleAddItem}
            isActive={newItem.trim() !== ""}
          />
        </TextInput>
      </div>
      {listItems.map((item, index) => (
        <div key={index} id="czp-list-item">
          <span>{item}</span>
          <CloseButton onClick={() => handleRemoveItem(index)} />
        </div>
      ))}
    </div>
  );
};

export default List;
