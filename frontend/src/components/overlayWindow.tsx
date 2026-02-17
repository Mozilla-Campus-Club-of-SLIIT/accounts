import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export type OverlayWindowProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
};

export default function OverlayWindow({
  children,
  isOpen,
  setIsOpen,
  onOpen,
  onClose,
  className,
}: OverlayWindowProps) {
  const [opened, setOpened] = useState(false);

  // Effects are executed according to the order defined here. The first effect will run
  // the onOpen method ONCE if it's present
  useEffect(() => {
    if (!opened && isOpen && onOpen) onOpen();
  }, [isOpen, opened, onOpen]);

  // since this effect runs after the first effect, it will ensure that the first effect is ran once
  // then locked to not run again
  useEffect(() => {
    setOpened(isOpen);
  }, [isOpen]);

  return (
    <div
      className={`${
        isOpen ? "grid" : "hidden"
      } fixed bg-black/15 top-0 left-0 w-screen h-screen z-50`}
    >
      <div
        className={twMerge(
          "bg-white relative m-auto w-max h-max rounded-md p-4 shadow-2xl",
          className
        )}
      >
        <X
          className="absolute top-1 right-1 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => {
            setIsOpen(false);
            setOpened(false);
            if (onClose) onClose();
          }}
        />
        {children}
      </div>
    </div>
  );
}
