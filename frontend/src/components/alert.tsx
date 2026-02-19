import { twMerge } from "tailwind-merge";
import Card from "./card";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AlertDirection, AlertProps, AlertType } from "../contexts/alert";

export type AlertComponentProps = {
  alertData: AlertProps | null;
  dispatchAlert: React.Dispatch<React.SetStateAction<AlertProps | null>>;
  className?: string;
};

const icons: Record<AlertType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

const alertTypeClasses: Record<AlertType, string> = {
  info: "text-blue-500 bg-blue-50",
  success: "text-green-500 bg-green-50",
  warning: "text-amber-500 bg-amber-50",
  error: "text-red-500 bg-red-50",
};

const directionClasses: Record<AlertDirection, string> = {
  "top left": "top-4 left-4",
  "top center": "top-4 left-1/2 -translate-x-1/2",
  "top right": "top-4 right-4",
  "middle left": "top-1/2 -translate-y-1/2 left-4",
  "middle center": "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2",
  "middle right": "top-1/2 -translate-y-1/2 right-4",
  "bottom left": "bottom-4 left-4",
  "bottom center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom right": "bottom-4 right-4",
};

export default function Alert({
  alertData,
  dispatchAlert,
  className,
}: AlertComponentProps) {
  const Icon = icons[alertData?.type || "info"];
  return (
    <Card
      className={twMerge(
        alertData ? "flex" : "hidden",
        directionClasses[alertData?.position || "top right"],
        alertTypeClasses[alertData?.type || "info"],
        "z-50 fixed justify-between items-center max-w-xs w-xs text-xs",
        className
      )}
    >
      <div className="flex gap-2 items-center">
        <Icon className="size-4" />
        <span>{alertData?.message}</span>
      </div>
      <X
        className="size-5 cursor-pointer p-1 hover:bg-gray-200 transition-colors rounded-full"
        onClick={() => dispatchAlert(null)}
      />
    </Card>
  );
}
