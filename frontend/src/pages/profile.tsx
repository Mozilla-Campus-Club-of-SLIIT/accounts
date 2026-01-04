import { useEffect, useState } from "react";
import Card from "../components/card";
import { Pencil, Users } from "lucide-react";

import api from "../lib/api";
import miniLogo from "../assets/logo-small-white.png";
import logo from "../assets/logo.png";
import type { User } from "../types/user";
import Button from "../components/button";

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
      <div className="bg-[#F47624]/15 p-5 px-10 pt-20">
        <img src={logo} width={400} className="float-right opacity-20" />
      </div>
      <div className="relative mx-10">
        <div className="grid bg-primary w-20 h-20 md:w-38 md:h-38 rounded-full justify-center content-center text-white text-3xl md:text-6xl absolute top-0 -translate-y-1/2">
          {user.name
            .split(" ")
            .splice(0, 2)
            .map((n) => n.toUpperCase()[0])
            .join("")}
        </div>
        <Button
          type="button"
          className="flex items-center gap-3 float-right mt-3"
        >
          <Pencil className="size-4" />
          <span>Edit profile</span>
        </Button>
      </div>
      <div className="mx-10 mt-10">
        <h2 className="text-2xl md:text-5xl">{user.name}</h2>
        <div className="text-xs md:text-xl font-extralight">{user.email}</div>
        {user.roles.length > 0 && (
          <>
            <h5 className="text-xl my-3">Roles</h5>

            <div className="flex">
              <div className="flex items-center gap-2 bg-primary text-white text-[10px] md:text-base px-4 py-1 my-1 rounded-full">
                <img src={miniLogo} className="w-4 md:w-5" />
                <span>{user.roles[0]}</span>
              </div>
              {user.roles.slice(1).map((role) => (
                <div className="px-4 py-1 m-1 rounded-full border border-primary inline-block text-[10px] md:text-base">
                  {role}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Card className="mx-10 my-5">
        <h3 className="text-xl md:text-4xl my-4">Information</h3>
        <div>
          <h5 className="flex gap-2 text-sm md:text-xl my-2 text-primary">
            <Users />
            <span>Connections</span>
          </h5>
          <Card className="bg-white my-3 text-sm md:text-base">
            Github: Seniru
          </Card>
          <Card className="bg-white my-3 text-sm md:text-base">
            SLIIT: IT23284852
          </Card>
        </div>
      </Card>
    </div>
  );
}
