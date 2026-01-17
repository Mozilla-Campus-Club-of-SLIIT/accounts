import { useEffect, useState } from "react";
import Card from "../components/card";
import { Pencil, Users } from "lucide-react";

import api from "../lib/api";
import logo from "../assets/logo.png";
import type { User } from "../types/user";
import Button from "../components/button";
import RoleChip from "../components/roleChip";
import ProfileImage from "../components/profileImage";

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

  const linkGithub = async () => {
    const response = await api.post("/api/connections/github/link")
    const result = await response.json()
    window.location = result.data
  }

  return (
    <div className="grid">
      <div className="bg-[#F47624]/15 p-5 px-10 pt-20">
        <img src={logo} width={400} className="float-right opacity-20" />
      </div>
      <div className="relative mx-10">
        <ProfileImage
          name={user.name}
          className="absolute top-0 -translate-y-1/2 w-20 h-20 md:w-38 md:h-38 text-3xl md:text-6xl"
        />
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
            <div className="flex gap-2">
              <RoleChip highlightedRole={true} name={user.roles[0]} />
              {user.roles.slice(1).map((role) => (
                <RoleChip name={role} />
              ))}
            </div>
          </>
        )}
      </div>
      <button onClick={linkGithub}>Github</button>
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
