import { twMerge } from "tailwind-merge";
import miniLogo from "../assets/logo-small-white.png";

type RoleChipProps = {
  highlightedRole?: boolean;
  name: string;
  className?: string;
  logoClassName?: string;
};

export default function RoleChip({
  highlightedRole = true,
  name,
  className,
  logoClassName,
}: RoleChipProps) {
  if (highlightedRole)
    return (
      <div
        className={twMerge(
          `flex items-center gap-2 bg-primary text-white text-[10px] md:text-base px-4 py-1 my-1 rounded-full`,
          className ?? ""
        )}
      >
        <img
          src={miniLogo}
          className={twMerge("w-4 md:w-5", logoClassName ?? "")}
        />
        <span>{name}</span>
      </div>
    );

  return (
    <div
      className={twMerge(
        `px-4 py-1 m-1 rounded-full border border-primary inline-block text-[10px] md:text-base`,
        className ?? ""
      )}
    >
      {name}
    </div>
  );
}
