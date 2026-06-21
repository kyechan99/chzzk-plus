import './URLButton.css';

interface URLButtonProps extends React.ComponentProps<'button'> {
  href: string;
  variant?: 'primary' | 'secondary';
}

export default function URLButton({ href, variant = 'primary', ...props }: URLButtonProps) {
  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: href });
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <button {...props} className={`czp-url-btn ${variant}`} onClick={onClickHandler}>
      {props.children}
    </button>
  );
}
