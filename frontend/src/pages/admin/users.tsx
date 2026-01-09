import { Trash2, TriangleAlert, UserRound } from "lucide-react";
import Card from "../../components/card";
import ProfileImage from "../../components/profileImage";
import { relativeTime } from "../../utils/relativeTime";
import RoleChip from "../../components/roleChip";
import ContextMenu from "../../components/contextMenu";
import { useEffect, useState } from "react";
import type { User } from "../../types/user";
import api from "../../lib/api";
import { twJoin } from "tailwind-merge";
import OverlayWindow from "../../components/overlayWindow";
import Button from "../../components/button";

function UserRow({
  user,
  setDeleteConfirmationOpen,
  setDeletingUser,
  deletingUser,
}: {
  user: User;
  setDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDeletingUser: React.Dispatch<React.SetStateAction<User | null>>;
  deletingUser: User | null;
}) {
  const isDeletingUser = deletingUser?.id === user.id;

  return (
    <tr
      key={user.id}
      className={twJoin(
        "shadow-[0_1px_0_0_rgba(209,213,219,1)] transition-all relative z-1",
        isDeletingUser ? "opacity-20" : ""
      )}
    >
      <td>
        <ProfileImage name={user.name} className="w-8 h-8 text-sm" />
      </td>
      <td className="grid my-2">
        <span>{user.name}</span>
        <span className="text-xs font-extralight">{user.email}</span>
      </td>
      <td>{user.id}</td>
      <td>
        <abbr title={user.createdAt.toString()}>
          {relativeTime(new Date(user.createdAt).getTime())}
        </abbr>
      </td>
      <td>
        {user.updatedAt && (
          <abbr title={user.updatedAt.toString()}>
            {relativeTime(new Date(user.updatedAt).getTime())}
          </abbr>
        )}
      </td>
      <td>
        <div className="flex gap-1 items-center flex-wrap">
          {user.roles.length > 0 && (
            <RoleChip
              name={user.roles[0]}
              highlightedRole={true}
              className="text-xs md:text-xs gap-x-1 px-2"
              logoClassName="w-3 md:w-3"
            />
          )}
          {user.roles.length > 1 && (
            <div className="grid items-center border border-primary text-primary rounded-full p-1 text-xs my-1">
              +{user.roles.length - 1}
            </div>
          )}
        </div>
      </td>
      <td>{user.private ? "Yes" : "No"}</td>
      <td>
        <ContextMenu
          commands={[
            { name: "Edit roles", onSelect: console.log },
            {
              name: "Delete user",
              onSelect: () => {
                setDeletingUser(user);
                setDeleteConfirmationOpen(true);
              },
              icon: Trash2,
              className: "text-red-500 hover:bg-red-100",
            },
          ]}
        />
      </td>
    </tr>
  );
}

export default function UsersView() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshUsers, setRefreshUsers] = useState(true);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const deleteUser = async (id: string) => {
    await api.del(`/api/users/${id}`);
    setDeleteConfirmationOpen(false);
    setTimeout(() => {
      setDeletingUser(null);
      setRefreshUsers((prev) => !prev);
    }, 1000);
  };

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
      <OverlayWindow
        isOpen={deleteConfirmationOpen}
        setIsOpen={setDeleteConfirmationOpen}
        onClose={() => {
          setDeletingUser(null);
        }}
      >
        {deletingUser && (
          <>
            <h4 className="text-lg my-2">
              Delete <b>{deletingUser.name}</b>?
            </h4>
            <hr className="text-gray-300" />
            <form
              className="grid gap-2 my-2"
              onSubmit={(event) => {
                event.preventDefault()
                deleteUser(deletingUser.id)
              }}
              noValidate
            >
              <h5 className="text-md">Are you sure you want to delete <b>{deletingUser.name}</b>?</h5>
              <p className="flex items-center gap-1 font-light text-sm text-gray-400">
                <TriangleAlert />
                <span>This action cannot be undone</span>
              </p>
              <div className="flex items-center justify-end gap-1 my-2">
                <Button type="button" kind="secondary">Cancel</Button>
                <Button type="submit" kind="danger">Delete</Button>
              </div>
            </form>
          </>
        )}
      </OverlayWindow>
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
            {users.map((user) => (
              <UserRow
                key={`${user.id}`}
                user={user}
                setDeleteConfirmationOpen={setDeleteConfirmationOpen}
                deletingUser={deletingUser}
                setDeletingUser={setDeletingUser}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
