import { Navigate, Outlet } from "react-router-dom";

import Forbidden from "./forbidden";
import { useAuth } from "../contexts/auth";

export default function PrivateRoute({
  requiredRoles,
}: {
  requiredRoles?: string[];
}) {
  let { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!requiredRoles || requiredRoles?.length === 0) return <Outlet />;
  for (let role of requiredRoles) {
    if (user.roles?.includes(role)) return <Outlet />;
  }

  return <Forbidden />;
}
