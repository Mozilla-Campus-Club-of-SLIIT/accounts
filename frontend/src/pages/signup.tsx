import { useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import Button from "../components/button";
import Card from "../components/card";
import api from "../lib/api";
import Input from "../components/input";
import { useAlert } from "../contexts/alert";

export default function Signup() {
  const [searchParams] = useSearchParams();
  const { dispatchAlert } = useAlert();

  const nameRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const [passwordError, setPasswordError] = useState("");
  const confirmationPasswordRef = useRef<HTMLInputElement>(null);
  const [confirmationPasswordError, setConfirmationPasswordError] =
    useState("");

  const validateName = () => {
    const input = nameRef.current;
    if (!input?.checkValidity()) {
      if (input?.validity.tooShort) setNameError("Name must be atleast 3 characters");
      else setNameError(input?.validationMessage || "");
    } else {
      setNameError("");
    }
  };

  const validateEmail = () => {
    const input = emailRef.current;
    if (!input?.checkValidity()) {
      if (input?.validity.typeMismatch) setEmailError("Invalid email");
      else setEmailError(input?.validationMessage || "");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = () => {
    const input = passwordRef.current;
    if (!input?.checkValidity()) {
      if (input?.validity.tooShort) setPasswordError("Password must be atleast 8 characters");
      else if (input?.validity.patternMismatch)
        setPasswordError("Password must have a number, special character, uppercase and lowercase letter");
      else setPasswordError(input?.validationMessage || "");
    } else {
      setPasswordError("");
    }
    if (confirmationPasswordRef.current?.value) validateConfirmPassword();
  };

  const validateConfirmPassword = () => {
    const input = confirmationPasswordRef.current;
    if (!input?.checkValidity()) {
      if (input?.validity.tooShort) setConfirmationPasswordError("Password must be atleast 8 characters");
      else setConfirmationPasswordError(input?.validationMessage || "");
    } else if (input?.value !== passwordRef.current?.value) {
      setConfirmationPasswordError("Confirmation should match your password");
    } else {
      setConfirmationPasswordError("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    validateName();
    validateEmail();
    validatePassword();
    validateConfirmPassword();

    const nameInput = nameRef.current;
    const emailInput = emailRef.current;
    const passwordInput = passwordRef.current;
    const confirmationPasswordInput = confirmationPasswordRef.current;

    if (
      !nameInput?.checkValidity() ||
      !emailInput?.checkValidity() ||
      !passwordInput?.checkValidity() ||
      !confirmationPasswordInput?.checkValidity() ||
      passwordInput?.value !== confirmationPasswordInput?.value
    )
      return;

    const response = await api.post("/api/users", {
      body: JSON.stringify({
        name: nameInput?.value.trim(),
        email: emailInput?.value.trim(),
        password: passwordInput?.value.trim(),
      }),
    });
    const result = await response.json();
    if (response.ok) {
      const redirect = searchParams.get("redirect");
      if (redirect) window.location.href = redirect;
      else window.location.href = "/login";
    } else {
      const errorMessage = result?.error?.message ?? response.statusText;
      const displayMessage = Array.isArray(errorMessage)
        ? errorMessage[0]?.reason
        : errorMessage;

      dispatchAlert({
        message: displayMessage,
        type: "error",
        position: "top center",
      });
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 sm:bg-white px-4 sm:px-0">
      <Card className="shadow-none sm:shadow-sm mx-auto p-5 sm:p-8 w-full max-w-lg">
        <form className="grid w-full min-w-0" onSubmit={handleSubmit} noValidate>
          <div>
            <img src={logo} width={110} className="my-3" />
            <h1 className="text-primary text-2xl">Create Account</h1>
            <h5 className="text-sm text-gray-500 mt-1">Sign up to get started</h5>
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
          <div className="my-4 flex flex-col gap-4">
            <fieldset className="grid">
              <label htmlFor="username">Username</label>
              <Input
                type="text"
                id="username"
                error={nameError}
                ref={nameRef}
                minLength={3}
                required
                onBlur={validateName}
              />
            </fieldset>
            <fieldset className="grid">
              <label htmlFor="email">Email</label>
              <Input
                type="email"
                id="email"
                error={emailError}
                ref={emailRef}
                required
                onBlur={validateEmail}
              />
            </fieldset>
            <fieldset className="grid">
              <label htmlFor="password">Password</label>
              <Input
                type="password"
                id="password"
                error={passwordError}
                ref={passwordRef}
                minLength={8}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$"
                required
                onBlur={validatePassword}
                showToggle
              />
            </fieldset>
            <fieldset className="grid">
              <label htmlFor="confirmPassword">Confirm password</label>
              <Input
                type="password"
                id="confirmPassword"
                error={confirmationPasswordError}
                ref={confirmationPasswordRef}
                minLength={8}
                required
                onBlur={validateConfirmPassword}
                showToggle
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
