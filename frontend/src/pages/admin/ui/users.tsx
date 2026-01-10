import { UserRound } from "lucide-react";
import Card from "../../../components/card";
import { useEffect, useState } from "react";
import type { User } from "../../../types/user";
import api from "../../../lib/api";
import UserRow from "./userRow";
import DeleteUserModel from "./models/deleteUserModel";
import AddRoleModel from "./models/editRoleModel";

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshUsers, setRefreshUsers] = useState(true);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [addRoleMenuOpen, setAddRoleMenuOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await api.get("/api/users");
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data);
      }
    })();
  }, [refreshUsers]);

  return (
    <>
      <DeleteUserModel
        isOpen={deleteConfirmationOpen}
        setIsOpen={setDeleteConfirmationOpen}
        deletingUser={deletingUser}
        setDeletingUser={setDeletingUser}
        setRefreshUsers={setRefreshUsers}
      />
      <AddRoleModel
        isOpen={addRoleMenuOpen}
        setIsOpen={setAddRoleMenuOpen}
        actionUser={actionUser}
        setActionUser={setActionUser}
        setRefreshUsers={setRefreshUsers}
      />
      <Card className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl text-primary flex items-center gap-2 ml-4">
            <UserRound />
            <span>Users</span>
          </h3>
          <input
            type="search"
            placeholder="Search by username or email"
            className="bg-white p-2 rounded-sm"
          />
        </div>
        <table className="w-full my-3 border-spacing-3 border-separate">
          <thead>
            <tr className="text-left shadow-[0_1px_0_0_rgba(209,213,219,1)] [&>th]:pb-3">
              <th></th>
              <th>NAME</th>
              <th>ID</th>
              <th>CREATED AT</th>
              <th>UPDATED AT</th>
              <th>ROLES</th>
              <th>IS PRIVATE</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {/** refactor note: too much prop drilling. maybe we can use contexts later. or better organization */}
            {users.map((user) => (
              <UserRow
                key={`${user.id}`}
                user={user}
                setDeleteConfirmationOpen={setDeleteConfirmationOpen}
                deletingUser={deletingUser}
                setDeletingUser={setDeletingUser}
                actionUser={actionUser}
                setActionUser={setActionUser}
                setAddRoleMenuOpen={setAddRoleMenuOpen}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
