import { createContext, useContext, useState, type ReactNode } from "react";
import Alert from "../components/alert";

export type AlertType = "info" | "success" | "warning" | "error";
export type AlertDirection =
  | "top left"
  | "top center"
  | "top right"
  | "middle left"
  | "middle center"
  | "middle right"
  | "bottom left"
  | "bottom center"
  | "bottom right";

export type AlertProps = {
  message: string;
  type: AlertType;
  position: AlertDirection;
};

export type AlertContextProps = {
  alertData: AlertProps | null;
  dispatchAlert: React.Dispatch<React.SetStateAction<AlertProps | null>>;
};

const AlertContext = createContext<AlertContextProps>({
  alertData: null,
  dispatchAlert: () => {
    console.warn("AlertContext not initialized yet");
  },
});

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertData, dispatchAlert] = useState<AlertProps | null>(null);

  return (
    <AlertContext.Provider value={{ alertData, dispatchAlert }}>
      <Alert alertData={alertData} dispatchAlert={dispatchAlert} />
      {children}
    </AlertContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAlert = () => {
  return useContext(AlertContext);
};
