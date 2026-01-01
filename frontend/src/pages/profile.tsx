import { useEffect, useState } from "react";
import Card from "../components/card";
import { Pencil, Users } from "lucide-react";

import api from "../lib/api";
import miniLogo from "../assets/logo-small-white.png";

type User = {
  name: string;
  email: string;
  roles: string[];
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const response = await api.get("/api/users/me");
      const result = await response.json();
      if (!response.ok || !result.data) return;
      setUser(result.data);
    })();
  }, []);

  if (user === null) return;

  return (
    <div className="grid">
      <Card className="relative mx-auto mt-20 md:mt-30 w-11/12 md:w-3/5 px-10 rounded-3xl">
        <div className="grid bg-primary w-20 h-20 md:w-35 md:h-35 rounded-full justify-center content-center text-white text-3xl md:text-6xl absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          {user.name
            .split(" ")
            .splice(0, 2)
            .map((n) => n.toUpperCase()[0])
            .join("")}
        </div>
        <div className="grid justify-center pt-8 md:pt-20 text-center">
          <div className="flex gap-3 items-center justify-center">
            <h2 className="text-2xl md:text-5xl">{user.name}</h2>
            <Pencil className="text-primary size-5 md:size-6" />
          </div>
          <div className="text-xs md:text-xl underline md:my-2">
            {user.email}
          </div>
          <div className="grid justify-items-center my-2">
            {user.roles.length > 0 && (
              <div className="flex items-center gap-2 bg-primary text-white text-[10px] md:text-base px-3 py-1 md:px-4 md:py-2 my-1 rounded-full">
                <img src={miniLogo} className="w-4 md:w-6" />
                <span>{user.roles[0]}</span>
              </div>
            )}
            <div>
              {user.roles.slice(1).map((role) => (
                <div className="px-3 py-1 md:px-4 md:py-2 m-1 rounded-full border border-primary inline-block text-[10px] md:text-base">
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Card className="bg-linear-to-b from-black to-stone-800 text-white w-11/12 md:w-3/5 mx-auto my-5 p-8 rounded-3xl">
        <h3 className="text-xl md:text-4xl my-3">Information</h3>
        <div>
          <h5 className="flex gap-2 text-sm md:text-xl my-2 text-primary">
            <Users />
            <span>Connections</span>
          </h5>
          <Card className="bg-white/15 my-3 text-sm md:text-base">
            Github: Seniru
          </Card>
          <Card className="bg-white/15 my-3 text-sm md:text-base">
            SLIIT: IT23284852
          </Card>
        </div>
      </Card>
    </div>
  );
}
