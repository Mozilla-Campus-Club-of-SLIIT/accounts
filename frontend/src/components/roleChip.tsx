import { twMerge } from "tailwind-merge";
import miniLogo from "../assets/logo-small-white.png";
import { X } from "lucide-react";

type RoleChipProps = {
  highlightedRole?: boolean;
  name: string;
  className?: string;
  logoClassName?: string;
  showDeleteIcon?: boolean;
  onDeleteIconClick?: () => void;
};

export default function RoleChip({
  highlightedRole = true,
  showDeleteIcon = false,
  name,
  className,
  logoClassName,
  onDeleteIconClick,
}: RoleChipProps) {
  return (
    <div
      className={twMerge(
        `flex items-center gap-2 w-max px-4 py-1 my-1 rounded-full text-[10px] md:text-base`,
        highlightedRole
          ? "bg-primary text-white"
          : "border border-primary inline-block",
        className ?? ""
      )}
    >
      {highlightedRole && (
        <img
          src={miniLogo}
          className={twMerge("w-4 md:w-5", logoClassName ?? "")}
        />
      )}
      <span>{name}</span>
      {showDeleteIcon && (
        <X
          className="cursor-pointer size-4 p-0.5 hover:bg-gray-100/10 rounded-full"
          xlinkTitle="Remove role"
          onClick={() => onDeleteIconClick && onDeleteIconClick()}
        />
      )}
    </div>
  );
}
