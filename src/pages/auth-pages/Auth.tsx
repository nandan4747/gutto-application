import { useEffect, useState } from "react";
import { login, register } from "./api";
import type { LoginData, RegisterData } from "./types";
import styles from "./Auth.module.css";
import { useAuth } from "../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { colorScheme } from "../../theme/colorScheme";
import { isUserAlreadyVisted } from "../../../utils/freshUser";
import { useUIContext } from "../../../contexts/UIContextProvider";
import AuroraBorealisBG from "../../components/background/AuroraBorealisBG";
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

  const { setCanShowTabs, setCanShowDesktopHeader } = useUIContext();

  useEffect(() => {
    setCanShowTabs(false);
    setCanShowDesktopHeader(false);

    const userStuff = isUserAlreadyVisted();
    if (!userStuff) {
      navigate("/about");
    }
  }, []);

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
          // CHANGED: response is now { user, token } instead of just
          // the user object — pass both to setUser so the token gets
          // persisted.

          setMessage(`Welcome back, ${response.user.username}!`);
          setUser(response.user, response.token);
          navigate("/", { replace: true });
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
          setMessage(`Registered successfully as ${response.user.username}.`);
          setUser(response.user, response.token);
          navigate("/", { replace: true });
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
    <AuroraBorealisBG>
      <div
        style={{
          color: colorScheme.text,
        }}
        className={styles.authPage}
      >
        <div className={styles.authCard}>
          <div className={styles.authToggle}>
            <button
              type="button"
              style={{
                backgroundColor:
                  mode === "login" ? colorScheme.glassSelected : "#0605050e",
                color: mode === "login" ? colorScheme.text : colorScheme.text,
              }}
              className={mode === "login" ? styles.active : ""}
              onClick={() => {
                setMode("login");
                resetMessages();
              }}
            >
              Login
            </button>
            <button
              style={{
                backgroundColor:
                  mode === "register" ? colorScheme.glassSelected : "#0605050e",
                color:
                  mode === "register" ? colorScheme.text : colorScheme.text,
              }}
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
                <input
                  style={{
                    backgroundColor: colorScheme.glass,
                    color: colorScheme.text,
                    borderColor: colorScheme.glassBorder,
                  }}
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
              <input
                style={{
                  backgroundColor: colorScheme.glass,
                  color: colorScheme.text,
                  borderColor: colorScheme.glassBorder,
                }}
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className={styles.formField}>
              <input
                style={{
                  backgroundColor: colorScheme.glass,
                  color: colorScheme.text,
                  borderColor: colorScheme.glassBorder,
                }}
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {mode === "register" && (
              <div
                style={{
                  backgroundColor: colorScheme.glass,
                  borderColor: colorScheme.glassBorder,
                }}
                className={`${styles.formField} ${styles.accountTypeGroup}`}
              >
                <span>Account type</span>

                <div className={styles.accountToggle}>
                  <button
                    type="button"
                    style={{
                      backgroundColor:
                        accountType === "private"
                          ? colorScheme.glassSelected
                          : "transparent",
                      color:
                        accountType === "private"
                          ? "#ffffff"
                          : colorScheme.textSecondary,
                    }}
                    onClick={() => setAccountType("private")}
                  >
                    Private
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor:
                        accountType === "public"
                          ? colorScheme.glassSelected
                          : "transparent",
                      color:
                        accountType === "public"
                          ? "#ffffff"
                          : colorScheme.textSecondary,
                    }}
                    onClick={() => setAccountType("public")}
                  >
                    Public
                  </button>
                </div>
              </div>
            )}

            <button
              className={styles.submitButton}
              style={{ backgroundColor: colorScheme.primary }}
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
    </AuroraBorealisBG>
  );
}
