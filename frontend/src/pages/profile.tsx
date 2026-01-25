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
      {/* Banner section */}
      <div className="bg-[#F47624]/15 p-4 px-4 pt-12 sm:p-5 sm:px-10 sm:pt-20 overflow-hidden">
        <img
          src={logo}
          className="float-right opacity-20 w-48 sm:w-72 md:w-96"
        />
      </div>

      {/* Profile header with avatar and edit button */}
      <div className="relative mx-4 sm:mx-6 md:mx-10">
        <ProfileImage
          name={user.name}
          className="absolute top-0 -translate-y-1/2 w-24 h-24 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-38 lg:h-38 text-3xl sm:text-3xl md:text-5xl lg:text-6xl"
        />
        <Button
          type="button"
          className="flex items-center gap-2 sm:gap-3 float-right mt-2 sm:mt-3 text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2"
        >
          <Pencil className="size-3 sm:size-4" />
          <span className="hidden xs:inline sm:inline">Edit profile</span>
          <span className="xs:hidden sm:hidden">Edit</span>
        </Button>
      </div>

      {/* User info section */}
      <div className="mx-4 sm:mx-6 md:mx-10 mt-8 sm:mt-10 md:mt-14">
        <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold">
          {user.name}
        </h2>
        <div className="text-xs sm:text-sm md:text-lg lg:text-xl font-extralight text-gray-600">
          {user.email}
        </div>
        {user.roles.length > 0 && (
          <>
            <h5 className="text-base sm:text-lg md:text-xl my-2 sm:my-3 font-medium">
              Roles
            </h5>
            <div className="flex flex-wrap gap-2">
              <RoleChip highlightedRole={true} name={user.roles[0]} />
              {user.roles.slice(1).map((role) => (
                <RoleChip key={role} name={role} />
              ))}
            </div>
          </>
        )}
      </div>
      <button onClick={linkGithub}>Github</button>
      <Card className="mx-4 sm:mx-6 md:mx-10 my-5">
        <h3 className="text-xl md:text-4xl my-4">Information</h3>
        <div>
          <h5 className="flex gap-2 items-center text-sm sm:text-base md:text-xl my-2 text-primary">
            <Users className="size-4 sm:size-5" />
            <span>Connections</span>
          </h5>
          <Card className="bg-white my-2 sm:my-3 text-xs sm:text-sm md:text-base p-3 sm:p-4">
            Github: Seniru
          </Card>
          <Card className="bg-white my-2 sm:my-3 text-xs sm:text-sm md:text-base p-3 sm:p-4">
            SLIIT: IT23284852
          </Card>
        </div>
      </Card>
    </div>
  );
}
