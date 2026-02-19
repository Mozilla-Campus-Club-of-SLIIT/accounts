import type { Ref } from "react";
import { twMerge } from "tailwind-merge";

export type InputProps = {
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export default function Input({
  className,
  error,
  ref,
  ...props
}: InputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={error && error !== "" ? "relative animate-shake" : "relative"}>
      <div className="absolute bg-white text-red-500 px-1 text-xs top-1 left-2 -translate-y-1/2">
        {error}
      </div>
      <input
        className={twMerge(
          "bg-white my-1 p-1 rounded-sm ring-1 ring-gray-200",
          className,
          error && error !== "" && "ring-2 ring-red-500"
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
}
