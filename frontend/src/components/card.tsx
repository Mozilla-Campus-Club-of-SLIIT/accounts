import { twMerge } from "tailwind-merge";

export default function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge("bg-gray-100 rounded-md shadow-sm p-5", className)}
      {...props}
    >
      {children}
    </div>
  );
}
