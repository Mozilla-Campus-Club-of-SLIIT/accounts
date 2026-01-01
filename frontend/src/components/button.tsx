import { twMerge } from "tailwind-merge";

export default function Button({
  children,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={twMerge(
        "bg-black text-white rounded-sm px-4 p-2 cursor-pointer",
        className ?? ""
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
