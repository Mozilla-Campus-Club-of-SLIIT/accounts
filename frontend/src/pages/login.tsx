import React, { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import Button from "../components/button";
import Card from "../components/card";
import Input from "../components/input";
import { useAlert } from "../contexts/alert";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const [passwordError, setPasswordError] = useState("");
  const [searchParams] = useSearchParams();
  const { dispatchAlert } = useAlert();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const emailInput = emailRef.current;
    const passwordInput = passwordRef.current;
    const emailValid = emailInput?.checkValidity();
    const passwordValid = passwordInput?.checkValidity();

    setEmailError("");
    setPasswordError("");

    if (!emailValid) {
      if (emailInput?.validity.typeMismatch) setEmailError("Invalid email");
      else setEmailError(emailInput?.validationMessage || "");
    }

    setPasswordError(passwordRef.current?.validationMessage || "");

    if (!emailValid || !passwordValid) return;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput?.value.trim(),
          password: passwordInput?.value.trim(),
        }),
      });
      const result = await response.json();
      if (response.ok && result.data) {
        localStorage.setItem("token", result.data.token);
        const redirect = searchParams.get("redirect");
        if (redirect) window.location.href = redirect;
        else window.location.href = "/";
      } else {
        const errorMessage =
          result?.error?.message || "Something unexpected happened";
        const displayMessage = Array.isArray(errorMessage)
          ? errorMessage[0]?.reason
          : errorMessage;
        dispatchAlert({
          type: "error",
          message: displayMessage,
          position: "top center",
        });
      }
    } catch (error) {
      dispatchAlert({
        type: "error",
        message: "Something unexpected happened",
        position: "top center",
      });
    }
  };

  return (
    <main className="grid content-center-safe justify-center-safe h-screen bg-gray-100 sm:bg-white">
      <Card className="shadow-none sm:shadow-sm mx-auto p-5 sm:p-8">
        <form className="grid" onSubmit={handleSubmit} noValidate>
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
              <Input
                type="email"
                id="email"
                error={emailError}
                ref={emailRef}
                required
              />
            </fieldset>
            <fieldset className="grid">
              <label htmlFor="username">Password</label>
              <Input
                type="password"
                id="password"
                error={passwordError}
                ref={passwordRef}
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
