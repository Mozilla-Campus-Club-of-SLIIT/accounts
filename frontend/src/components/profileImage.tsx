import { twMerge } from "tailwind-merge";

export type ProfileImageProps = {
  name: string;
  className?: string;
};

export default function ProfileImage({ name, className }: ProfileImageProps) {
  return (
    <div
      className={twMerge(
        `grid bg-primary rounded-full justify-center content-center text-white`,
        className ?? ""
      )}
    >
      {name
        .split(" ")
        .splice(0, 2)
        .map((n) => n.toUpperCase()[0])
        .join("")}
    </div>
  );
}
