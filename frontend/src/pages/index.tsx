import { useEffect } from "react";
import api from "../lib/api";

export default function Index() {
  useEffect(() => {
    (async () => {
      const response = await api.get("/api/session");
      if (response.ok) return (window.location.href = "/profile");
      window.location.href = "/login";
    })();
  }, []);

  return <></>;
}
