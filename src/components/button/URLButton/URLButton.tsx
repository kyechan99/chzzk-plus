import "./URLButton.css";

interface URLButtonProps extends React.ComponentProps<"button"> {
  href: string;
}

export default function URLButton(props: URLButtonProps) {
  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    chrome.tabs.create({ url: props.href });
  };

  return (
    <button {...props} className="url-btn" onClick={onClickHandler}>
      {props.children}
    </button>
  );
}
