import { TriangleAlert } from "lucide-react";
import OverlayWindow from "../../../../components/overlayWindow";
import Button from "../../../../components/button";
import type { User } from "../../../../types/user";
import api from "../../../../lib/api";

export type DeleteUserModelProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deletingUser: User | null;
  setDeletingUser: React.Dispatch<React.SetStateAction<User | null>>;
  setRefreshUsers: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DeleteUserModel({
  isOpen,
  setIsOpen,
  deletingUser,
  setDeletingUser,
  setRefreshUsers,
}: DeleteUserModelProps) {
  const deleteUser = async (id: string) => {
    await api.del(`/api/users/${id}`);
    setIsOpen(false);
    setTimeout(() => {
      setDeletingUser(null);
      setRefreshUsers((prev) => !prev);
    }, 1000);
  };

  return (
    <OverlayWindow
      isOpen={isOpen}
      setIsOpen={setIsOpen}
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
              event.preventDefault();
              deleteUser(deletingUser.id);
            }}
            noValidate
          >
            <h5 className="text-md">
              Are you sure you want to delete <b>{deletingUser.name}</b>?
            </h5>
            <p className="flex items-center gap-1 font-light text-sm text-gray-400">
              <TriangleAlert />
              <span>This action cannot be undone</span>
            </p>
            <div className="flex items-center justify-end gap-1 my-2">
              <Button type="button" kind="secondary">
                Cancel
              </Button>
              <Button type="submit" kind="danger">
                Delete
              </Button>
            </div>
          </form>
        </>
      )}
    </OverlayWindow>
  );
}
