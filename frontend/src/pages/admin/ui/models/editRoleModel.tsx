import { use, useEffect, useRef, useState, type FormEvent } from "react";
import Button from "../../../../components/button";
import OverlayWindow from "../../../../components/overlayWindow";
import type { User } from "../../../../types/user";
import api from "../../../../lib/api";
import RoleChip from "../../../../components/roleChip";

export type EditRoleModelProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  actionUser: User | null;
  setActionUser: React.Dispatch<React.SetStateAction<User | null>>;
  setRefreshUsers: React.Dispatch<React.SetStateAction<boolean>>;
};

const fetchRoles = (async () => {
  const response = await api.get("/api/roles");
  const result = await response.json();
  return result.data as string[];
})();

export default function EditRoleModel({
  isOpen,
  setIsOpen,
  actionUser,
  setActionUser,
  setRefreshUsers,
}: EditRoleModelProps) {
  const roles = use(fetchRoles);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const roleSelectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!actionUser) return setUserRoles([]);
    setUserRoles(actionUser.roles)
  }, [actionUser?.id]);

  const addRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (actionUser === null) return setIsOpen(false);

    const selectedRole = roleSelectRef.current?.value;

    const response = await api.post(`/api/users/${actionUser.id}/roles`, {
      body: JSON.stringify({
        name: selectedRole,
      }),
    });

    console.log(response);
    setIsOpen(false);
    setActionUser(null);
    setRefreshUsers((prev) => !prev);
  };

  return (
    <OverlayWindow
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className="max-w-md"
      onClose={() => {
        setActionUser(null);
      }}
    >
      {actionUser && (
        <>
          <h4 className="text-lg my-2">
            <b>{actionUser.name}</b>'s roles
          </h4>
          <hr className="text-gray-300" />
          <div className="flex gap-2 flex-wrap my-2">
            {userRoles.map((role, index) => (
              <RoleChip
                key={`userrole-${actionUser.id}-${role}-${index}`}
                name={role}
                showDeleteIcon={true}
              />
            ))}
          </div>
          <form onSubmit={addRole}>
            <h5 className="my-2 mt-5">Add a new role to <b>{actionUser.name}</b></h5>
            <select
              className="w-full p-1 m-1 ring-1 ring-gray-200"
              ref={roleSelectRef}
            >
              {roles.map((role) => (
                <option>{role}</option>
              ))}
            </select>
            <div className="flex gap-1 justify-end my-2">
              <Button
                type="button"
                kind="secondary"
                onClick={() => {
                  setActionUser(null);
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </>
      )}
    </OverlayWindow>
  );
}
