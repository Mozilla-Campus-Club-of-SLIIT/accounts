import { EllipsisVertical, Grip, PlusCircle, ShieldUser, Trash2, UsersRound } from "lucide-react";
import type { User } from "../../types/user";
import Card from "../../components/card";
import ProfileImage from "../../components/profileImage";
import RoleChip from "../../components/roleChip";
import { relativeTime } from "../../utils/relativeTime";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminDashboard() {

  const [roles, setRoles] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    (async () => {
      const response = await api.get("/api/roles")
      if (response.ok) {
        const result = await response.json()
        setRoles(result.data)
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      const response = await api.get("/api/users")
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data)
      }
    })()
  }, [])

  return (
    <main className="flex gap-3 px-10 my-5 w-full items-start">
      {/** roles sidebar */}
      <Card>
        <div className="flex gap-5 justify-between items-center">
          <h3 className="text-xl text-primary flex items-center gap-2">
            <ShieldUser />
            <span>Roles</span>
          </h3>
          <PlusCircle />
        </div>
        <div className="my-3">
          {roles.map((role) => (
            <div
              key={role}
              className="flex items-center justify-between gap-3 py-3 border border-transparent border-t-gray-300"
            >
              <div className="flex items-center gap-2">
                <Grip className="text-gray-400 size-4 cursor-pointer" />
                <div className="text-sm">{role}</div>
              </div>
              <Trash2 className="text-red-500 size-4 cursor-pointer" />
            </div>
          ))}
        </div>
      </Card>
      {/** users view */}
      <Card className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl text-primary flex items-center gap-2 ml-4">
            <UsersRound />
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
              <tr
                key={user.id}
                className="shadow-[0_1px_0_0_rgba(209,213,219,1)]"
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
                <td><EllipsisVertical className="text-gray-400"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  );
}
