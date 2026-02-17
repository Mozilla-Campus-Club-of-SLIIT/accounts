import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types/user";
import jwt from "../utils/jwt";

type AuthContextProps = {
  token: string | null;
  user: Partial<User> | null;
};

const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  const [user] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt.decode(token);
      if (!decoded) return null;
      return decoded.payload as unknown as User;
    }
    return null;
  });

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
