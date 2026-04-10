import { Eye, EyeOff } from "lucide-react";
import { useState, type Ref } from "react";
import { twMerge } from "tailwind-merge";

export type InputProps = {
  error?: string;
  ref?: Ref<HTMLInputElement>;
  showToggle?: boolean;
};

export default function Input({
  className,
  error,
  ref,
  showToggle = false,
  type,
  ...props
}: InputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const hasError = !!error && error !== "";

  const inputType = showToggle && type === "password"
    ? (visible ? "text" : "password")
    : type;

  return (
    <div className={twMerge("w-full min-w-0", hasError ? "animate-shake" : "")}>
      <div className="relative w-full min-w-0">
        <input
          type={inputType}
          className={twMerge(
            "bg-white w-full my-1 p-1 rounded-sm ring-1 ring-gray-200",
            showToggle && "pr-8",
            className,
            hasError && "ring-2 ring-red-500"
          )}
          ref={ref}
          {...props}
        />
        {showToggle && type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hasError && (
        <p className="text-red-500 text-xs mt-0.5 mb-1 break-words">{error}</p>
      )}
    </div>
  );
}
