import RolesSideBar from "./roles";
import UsersView from "./users";

export default function AdminDashboard() {
  return (
    <main className="flex gap-3 px-10 my-5 w-full items-start">
      <RolesSideBar />
      <UsersView />
    </main>
  );
}
