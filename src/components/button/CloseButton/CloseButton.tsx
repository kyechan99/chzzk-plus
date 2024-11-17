import { ButtonHTMLAttributes } from "react";
import "./CloseButton.css";

interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const CloseButton = ({ ...props }: CloseButtonProps) => {
  return (
    <button type="button" id="close-button" {...props}>
      <svg
        width="16"
        height="16"
        viewBox="10 10 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 10L20 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        ></path>
        <path
          d="M20.0001 10L10.0001 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        ></path>
      </svg>
    </button>
  );
};

export default CloseButton;
