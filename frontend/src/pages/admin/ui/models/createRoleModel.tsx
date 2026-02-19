import React, { useRef, useState, type FormEvent } from "react";
import OverlayWindow from "../../../../components/overlayWindow";
import api from "../../../../lib/api";
import Input from "../../../../components/input";
import Button from "../../../../components/button";

export type CreateRoleModelProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRefreshRoles: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateRoleModel({
  isOpen,
  setIsOpen,
  setRefreshRoles,
}: CreateRoleModelProps) {
  const [newRoleError, setNewRoleError] = useState("");
  const newRoleRef = useRef<HTMLInputElement>(null);

  const createRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newRoleInput = newRoleRef.current;

    if (!newRoleInput?.checkValidity())
      return setNewRoleError(newRoleInput?.validationMessage || "");

    const response = await api.post("/api/roles", {
      body: JSON.stringify({
        name: newRoleInput?.value,
      }),
    });
    const result = await response.json();

    if (!response.ok) return setNewRoleError(result?.error?.message?.[0]?.reason ?? "An unexpected error occurred");

    setIsOpen(false);
    setRefreshRoles((prev) => !prev);
  };

  return (
    <OverlayWindow
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onOpen={() => {
        if (newRoleRef.current) newRoleRef.current.value = "";
        setNewRoleError("");
      }}
    >
      <h4 className="text-lg my-2">Create a new role</h4>
      <hr className="text-gray-300" />
      <form className="grid gap-2 my-2" onSubmit={createRole} noValidate>
        <fieldset>
          <Input type="text" ref={newRoleRef} error={newRoleError} required />
        </fieldset>
        <Button type="submit">Create</Button>
      </form>
    </OverlayWindow>
  );
}
