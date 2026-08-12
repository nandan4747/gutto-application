import { useState } from "react";
import { login, register } from "./api";
import type { LoginData, RegisterData } from "./types";
import styles from "./Auth.module.css";
import { useAuth } from "../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const { setUser } = useAuth();
  const [accountType, setAccountType] = useState<"private" | "public">(
    "private",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetMessages = () => {
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const loginData: LoginData = { username, password };
        const response = await login(loginData);

        if ((response as any).error) {
          setError((response as any).error);
        } else {
          setMessage(`Welcome back, ${response.username}!`);
          setUser(response);
          navigate("/", { replace: false });
        }
      } else {
        const registerData: RegisterData = {
          username,
          fullname,
          password,
          accountType,
        };
        const response = await register(registerData);

        if ((response as any).error) {
          setError((response as any).error);
        } else {
          setMessage(`Registered successfully as ${response.username}.`);
          setUser(response);
          navigate("/", { replace: false });
        }
      }
    } catch (submitError: any) {
      setError(
        submitError?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authToggle}>
          <button
            type="button"
            className={mode === "login" ? styles.active : ""}
            onClick={() => {
              setMode("login");
              resetMessages();
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? styles.active : ""}
            onClick={() => {
              setMode("register");
              resetMessages();
            }}
          >
            Register
          </button>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className={styles.formField}>
              <label htmlFor="fullname">Full Name</label>
              <input
                id="fullname"
                type="text"
                value={fullname}
                onChange={(event) => setFullname(event.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          )}

          <div className={styles.formField}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {mode === "register" && (
            <div className={`${styles.formField} ${styles.accountTypeGroup}`}>
              <span>Account type</span>
              <label>
                <input
                  type="radio"
                  name="accountType"
                  value="private"
                  checked={accountType === "private"}
                  onChange={() => setAccountType("private")}
                />
                Private
              </label>
              <label>
                <input
                  type="radio"
                  name="accountType"
                  value="public"
                  checked={accountType === "public"}
                  onChange={() => setAccountType("public")}
                />
                Public
              </label>
            </div>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : mode === "login"
                ? "Login"
                : "Register"}
          </button>

          {message && <p className={styles.successMessage}>{message}</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
