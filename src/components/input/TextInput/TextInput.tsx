import "./TextInput.css";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
}

export const TextInput = ({
  value,
  onChange,
  placeholder = "",
  children,
  ...props
}: TextInputProps) => {
  return (
    <div id="text-input-container">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {children}
    </div>
  );
};

export default TextInput;
