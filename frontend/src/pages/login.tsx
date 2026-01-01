import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import Button from "../components/button";
import Card from "../components/card";
import api from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await api.post("/api/login", {
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (response.ok && result.data) {
      localStorage.setItem("token", result.data.token);
      const redirect = searchParams.get("redirect");
      if (redirect) window.location.href = redirect;
      else window.location.href = "/";
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
              className="w-full bg-black text-white rounded-xl p-2 cursor-pointer text-center"
              to={`/login?${searchParams.toString()}`}
            >
              Sign in
            </Link>
            <Link
              className="w-full text-primary p-2 cursor-pointer text-center"
              to={`/signup?${searchParams.toString()}`}
            >
              Sign up
            </Link>
          </div>
          <div className="my-2">
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
          </div>
          <Button type="submit" className="text-xl my-2">
            Sign in
          </Button>
        </form>
      </Card>
    </main>
  );
}
