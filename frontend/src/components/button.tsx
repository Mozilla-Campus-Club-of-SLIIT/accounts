import { twMerge } from "tailwind-merge";

export type ButtonProps = {
  kind?: "primary" | "secondary" | "danger" | "danger-secondary";
};

export default function Button({
  children,
  className,
  type = "button",
  kind = "primary",
  ...props
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "rounded-sm p-2 px-4 cursor-pointer transition-opacity hover:opacity-80";

  const kindClasses = {
    primary: "bg-black text-white",
    secondary: "bg-transparent text-black border border-black",
    danger: "bg-red-500 text-white",
    "danger-secondary": "bg-transparent text-red-500 border border-red-500",
  };

  return (
    <button
      className={twMerge(base, kindClasses[kind], className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
