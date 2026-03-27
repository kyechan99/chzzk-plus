import './URLButton.css';

interface URLButtonProps extends React.ComponentProps<'button'> {
  href: string;
}

export default function URLButton(props: URLButtonProps) {
  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: props.href });
    } else {
      window.open(props.href, '_blank');
    }
  };

  return (
    <button {...props} className="url-btn" onClick={onClickHandler}>
      {props.children}
    </button>
  );
}
