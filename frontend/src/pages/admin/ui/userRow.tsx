import { twJoin } from "tailwind-merge";
import type { User } from "../../../types/user";
import ProfileImage from "../../../components/profileImage";
import { relativeTime } from "../../../utils/relativeTime";
import RoleChip from "../../../components/roleChip";
import ContextMenu from "../../../components/contextMenu";
import { Trash2 } from "lucide-react";

export default function UserRow({
  user,
  setDeleteConfirmationOpen,
  setDeletingUser,
  deletingUser,
  setActionUser,
  setAddRoleMenuOpen,
}: {
  user: User;
  setDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAddRoleMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDeletingUser: React.Dispatch<React.SetStateAction<User | null>>;
  deletingUser: User | null;
  setActionUser: React.Dispatch<React.SetStateAction<User | null>>;
  actionUser: User | null;
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
              showDeleteIcon={true}
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
            {
              name: "Edit roles",
              onSelect: () => {
                setActionUser(user);
                setAddRoleMenuOpen(true);
              },
            },
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
