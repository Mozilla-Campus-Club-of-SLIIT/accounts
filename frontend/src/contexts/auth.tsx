import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  let [user, setUser] = useState(() => {
    let token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt.decode(token);
      if (!decoded) return null;
      return decoded.payload as unknown as User;
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      const decoded = jwt.decode(token);
      if (!decoded) return;
      setUser(decoded.payload as unknown as User);
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

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

export const useAuth = () => {
  return useContext(AuthContext);
};
