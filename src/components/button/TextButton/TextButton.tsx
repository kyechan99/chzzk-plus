import { ButtonHTMLAttributes } from "react";
import "./TextButton.css";

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isActive?: boolean;
  className?: string;
}

export const TextButton = ({
  text,
  isActive = false,
  className = "",
  ...props
}: TextButtonProps) => {
  return (
    <button
      type="button"
      id="text-button"
      className={`${className} ${isActive && "isActive"}`}
      {...props}
    >
      {text}
    </button>
  );
};

export default TextButton;
