// some stuff stolen from: https://github.com/Mozilla-Campus-Club-of-SLIIT/official-web/blob/main/components/Navbar.tsx
// it's technically not stealing though because it's our own project

import Button from "./button";

import logo from "../assets/logo.png";
import logoMini from "../assets/logo-small-white.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import api from "../lib/api";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/auth";

function NavigationButtons() {
  const { user } = useAuth();

  const logout = async () => {
    await api.post("/api/logout");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      {user?.roles?.includes("admin") && (
        <Link to="/admin/dashboard">
          <Button className="bg-primary flex items-center gap-1">
            <img src={logoMini} width={24} />
            <span>Admin dashboard</span>
          </Button>
        </Link>
      )}
      <Button onClick={logout}>Logout</Button>
    </>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-1000 flex justify-between items-center px-4 sm:px-8 lg:px-10 py-3 shadow-lg bg-white">
      <Link to="" className="flex items-center">
        <img src={logo} width={120} className="h-8 sm:h-10 w-auto" />
      </Link>
      <nav className="flex items-center">
        <div className="hidden md:flex gap-2 items-center">
          <NavigationButtons />
        </div>
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="block md:hidden p-2 text-gray-700 relative group"
        >
          {isMenuOpen ? (
            // Rotates on hover when open
            <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <div
          className={`
            md:hidden
            flex gap-3 items-stretch flex-col
            fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg p-6
            transition-transform duration-300 ease-in-out transform
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <NavigationButtons />
        </div>
      </nav>
    </header>
  );
}