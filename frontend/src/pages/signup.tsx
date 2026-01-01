import { useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import Button from "../components/button";
import Card from "../components/card";
import api from "../lib/api";

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");

  const confirmationPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmationPassword) {
      confirmationPasswordRef.current?.setCustomValidity(
        "Confirmation password should match your password"
      );
      confirmationPasswordRef.current?.reportValidity();
      return;
    }
    const response = await api.post("/api/users", {
      body: JSON.stringify({ name: username, email, password }),
    });
    if (response.ok) {
      const redirect = searchParams.get("redirect");
      if (redirect) window.location.href = redirect;
      else window.location.href = "/login";
    }
  };

  return (
    <main className="grid content-center-safe justify-center-safe h-screen bg-gray-100 sm:bg-white">
      <Card className="shadow-none sm:shadow-sm mx-auto p-5 sm:p-8">
        <form className="grid" onSubmit={handleSubmit}>
          <div>
            <img src={logo} width={110} className="my-3" />
            <h1 className="text-primary text-2xl">Welcome Back!</h1>
            <h5>Sign in to continue</h5>
          </div>
          <div className="flex my-5 border border-black rounded-2xl p-1">
            <Link
              className="w-full text-primary p-2 cursor-pointer text-center"
              to={`/login?${searchParams.toString()}`}
            >
              Sign in
            </Link>
            <Link
              className="w-full bg-black text-white rounded-xl p-2 cursor-pointer text-center"
              to={`/signup?${searchParams.toString()}`}
            >
              Sign up
            </Link>
          </div>
          <div className="my-2">
            <fieldset className="grid">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="bg-white my-1 p-1 rounded-sm"
                required
              />
            </fieldset>
            <fieldset className="grid">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="bg-white my-1 p-1 rounded-sm"
                required
              />
            </fieldset>
            <fieldset className="grid">
              <label htmlFor="username">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="bg-white my-1 p-1 rounded-sm"
                required
              />
            </fieldset>
            <fieldset className="grid">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmationPassword}
                ref={confirmationPasswordRef}
                onChange={(event) => {
                  confirmationPasswordRef.current?.setCustomValidity("");
                  confirmationPasswordRef.current?.reportValidity();
                  setConfirmationPassword(event.target.value);
                }}
                className="bg-white my-1 p-1 rounded-sm"
                required
              />
            </fieldset>
          </div>
          <Button type="submit" className="text-xl my-2">
            Sign up
          </Button>
        </form>
      </Card>
    </main>
  );
}
