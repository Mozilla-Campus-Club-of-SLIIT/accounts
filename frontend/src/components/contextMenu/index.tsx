import { EllipsisVertical, type LucideIcon } from "lucide-react";

import "./styles.css";
import type { MouseEventHandler } from "react";

export type ConextMenuCommand = {
  name: string;
  icon?: LucideIcon;
  className?: string;
  onSelect: MouseEventHandler<HTMLOptionElement>;
};

export type ContextMenuProps = {
  commands: ConextMenuCommand[];
};

export default function ContextMenu({ commands }: ContextMenuProps) {
  return (
    <select className="select-context-menu">
      <button>
        <EllipsisVertical className="text-gray-400" />
      </button>
      {commands.map((command, index) => {
        const CommandIcon = command.icon;
        return (
          <option key={`${command.name}-${index}`} onClick={command.onSelect} className={command.className}>
            <span className="w-6">{CommandIcon && <CommandIcon />}</span>
            <span>{command.name}</span>
          </option>
        );
      })}
    </select>
  );
}
