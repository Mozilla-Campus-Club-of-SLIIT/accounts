import { Grip, PlusCircle, ShieldUser, Trash2 } from "lucide-react";
import Card from "../../../components/card";
import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { twJoin } from "tailwind-merge";
import CreateRoleModel from "./models/createRoleModel";

function Role({
  role,
  setRefreshRoles,
}: {
  role: string;
  setRefreshRoles: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [deleteError, setDeleteError] = useState(false);

  const deleteRole = async () => {
    const response = await api.del(`/api/roles/${role}`);
    if (!response.ok) {
      setDeleteError(true);
      return setTimeout(setDeleteError, 500, false);
    }
    setRefreshRoles((prev) => !prev);
  };

  return (
    <div
      key={role}
      className="flex items-center justify-between gap-3 py-3 border border-transparent border-t-gray-300"
    >
      <div className="flex items-center gap-2">
        <Grip className={`text-gray-400 size-4 cursor-pointer`} />
        <div className="text-sm">{role}</div>
      </div>
      <div
        className={twJoin(
          "p-2 rounded-full transition-colors",
          deleteError && "animate-shake",
          role === "admin"
            ? "cursor-not-allowed pointer-events-none"
            : "cursor-pointer hover:bg-red-100"
        )}
        onClick={deleteRole}
      >
        <Trash2
          className={`size-4 ${
            role === "admin" ? "text-gray-400" : "text-red-500"
          }`}
        />
      </div>
    </div>
  );
}

export default function RolesSideBar() {
  const [roles, setRoles] = useState<string[]>([]);
  const [refreshRoles, setRefreshRoles] = useState(false);
  const [createOptionOpen, setCreateOptionOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await api.get("/api/roles");
      if (response.ok) {
        const result = await response.json();
        setRoles(result.data);
      }
    })();
  }, [refreshRoles]);

  return (
    <>
      <CreateRoleModel
        isOpen={createOptionOpen}
        setIsOpen={setCreateOptionOpen}
        setRefreshRoles={setRefreshRoles}
      />
      <Card>
        <div className="flex gap-5 justify-between items-center">
          <h3 className="text-xl text-primary flex items-center gap-2">
            <ShieldUser />
            <span>Roles</span>
          </h3>
          <PlusCircle
            className="cursor-pointer hover:bg-gray-300 rounded-full transition-colors"
            onClick={() => setCreateOptionOpen((prev) => !prev)}
          />
        </div>
        <div className="my-3">
          {roles.map((role) => (
            <Role role={role} setRefreshRoles={setRefreshRoles} />
          ))}
        </div>
      </Card>
    </>
  );
}
