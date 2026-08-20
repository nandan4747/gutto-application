import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthProvider";
import { Avatar } from "../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../theme/colorScheme";
import { updateFullname, changePassword, toggleAccountType } from "./Api";
import styles from "./ProfileSettingsPanel.module.css";
import { clearStoredToken } from "../../../utils/AuthToken";

export default function ProfileSettingsPanel() {
  const { user, setUser } = useAuth();

  const userId = (user as any)?._id ?? "";
  const username = (user as any)?.username ?? "";
  const fullname = (user as any)?.fullname ?? "";
  const accountType = (user as any)?.accountType ?? "private";

  // ---- Fullname editing ----
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(fullname);
  const [nameSubmitting, setNameSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const startEditingName = () => {
    setNameDraft(fullname);
    setNameError(null);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setNameError(null);
  };

  const saveFullname = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameError("Name can't be empty.");
      return;
    }
    if (trimmed === fullname) {
      setIsEditingName(false);
      return;
    }

    setNameSubmitting(true);
    setNameError(null);
    try {
      await updateFullname(trimmed);
      // The route's response shape for the updated field isn't confirmed,
      // so we update from what we just successfully submitted rather than
      // guessing a field name out of the response body.
      setUser({ ...(user as any), fullname: trimmed });
      setIsEditingName(false);
    } catch (err: any) {
      setNameError(err.message);
    } finally {
      setNameSubmitting(false);
    }
  };

  // ---- Account type toggle ----
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const handleToggleAccountType = async () => {
    setToggling(true);
    setToggleError(null);
    try {
      const result = await toggleAccountType();
      setUser({ ...(user as any), accountType: result.accountType });
    } catch (err: any) {
      setToggleError(err.message);
    } finally {
      setToggling(false);
    }
  };

  // ---- Password change ----
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all three fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (newPassword === oldPassword) {
      setPasswordError("New password must be different from the current one.");
      return;
    }

    setPasswordSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    clearStoredToken();
    try {
      window.location.reload();
    } catch (err: any) {
      setLogoutError(err.message);
      setLoggingOut(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileSection}>
        <Avatar name={fullname || username} size={88} />
        <div
          style={{ color: colorScheme.textSecondary }}
          className={styles.username}
        >
          @{username}
        </div>
      </div>

      {/* ---- Account details ---- */}
      <div
        className={styles.card}
        style={{
          background: colorScheme.background,
          borderColor: colorScheme.border,
        }}
      >
        <p style={{ color: colorScheme.text }} className={styles.cardTitle}>
          Account
        </p>

        <div className={styles.fieldRow}>
          <span
            style={{ color: colorScheme.textSecondary }}
            className={styles.fieldLabel}
          >
            User ID
          </span>
          <span
            style={{ color: colorScheme.text }}
            className={styles.fieldValue}
          >
            {userId}
          </span>
        </div>

        <div className={styles.fieldRow}>
          <span
            style={{ color: colorScheme.textSecondary }}
            className={styles.fieldLabel}
          >
            Username
          </span>
          <span
            style={{ color: colorScheme.text }}
            className={styles.fieldValue}
          >
            @{username}
          </span>
        </div>

        <div className={styles.editableRow}>
          <span
            style={{ color: colorScheme.textSecondary }}
            className={styles.fieldLabel}
          >
            Full name
          </span>
          {isEditingName ? (
            <>
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className={styles.textInput}
                style={{
                  color: colorScheme.text,
                  borderColor: colorScheme.border,
                }}
              />
              <button
                className={styles.iconButton}
                style={{ color: "#22c55e" }}
                disabled={nameSubmitting}
                onClick={saveFullname}
                aria-label="Save"
              >
                <Check size={16} />
              </button>
              <button
                className={styles.iconButton}
                style={{ color: colorScheme.textSecondary }}
                disabled={nameSubmitting}
                onClick={cancelEditingName}
                aria-label="Cancel"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <span
                style={{ color: colorScheme.text }}
                className={styles.fieldValue}
              >
                {fullname}
              </span>
              <button
                className={styles.iconButton}
                style={{ color: colorScheme.textSecondary }}
                onClick={startEditingName}
                aria-label="Edit full name"
              >
                <Pencil size={14} />
              </button>
            </>
          )}
        </div>
        {nameError && <p className={styles.errorText}>{nameError}</p>}
      </div>

      {/* ---- Account type ---- */}
      <div
        className={styles.card}
        style={{
          background: colorScheme.background,
          borderColor: colorScheme.border,
        }}
      >
        <p style={{ color: colorScheme.text }} className={styles.cardTitle}>
          Privacy
        </p>

        <div className={styles.fieldRow}>
          <div>
            <div
              style={{ color: colorScheme.text }}
              className={styles.fieldLabel}
            >
              {accountType === "private" ? "Private account" : "Public account"}
            </div>
            <div
              style={{ color: colorScheme.textSecondary }}
              className={styles.accountTypeDescription}
            >
              {accountType === "private"
                ? "Friend requests need your approval before you're connected."
                : "Anyone can connect with you without approval."}
            </div>
          </div>
          <button
            className={styles.toggleTrack}
            style={{
              background:
                accountType === "public" ? "#0a84ff" : colorScheme.border,
              opacity: toggling ? 0.6 : 1,
            }}
            disabled={toggling}
            onClick={handleToggleAccountType}
            aria-label="Toggle account type"
          >
            <div
              className={styles.toggleThumb}
              style={{ left: accountType === "public" ? 23 : 3 }}
            />
          </button>
        </div>
        {toggleError && <p className={styles.errorText}>{toggleError}</p>}
      </div>

      {/* ---- Change password ---- */}
      <div
        className={styles.card}
        style={{
          background: colorScheme.background,
          borderColor: colorScheme.border,
        }}
      >
        <p style={{ color: colorScheme.text }} className={styles.cardTitle}>
          Change Password
        </p>

        <div className={styles.passwordForm}>
          <input
            type="password"
            placeholder="Current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={styles.textInput}
            style={{ color: colorScheme.text, borderColor: colorScheme.border }}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.textInput}
            style={{ color: colorScheme.text, borderColor: colorScheme.border }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.textInput}
            style={{ color: colorScheme.text, borderColor: colorScheme.border }}
          />

          {passwordError && <p className={styles.errorText}>{passwordError}</p>}
          {passwordSuccess && (
            <p className={styles.successText}>Password updated.</p>
          )}

          <button
            className={styles.submitButton}
            disabled={passwordSubmitting}
            onClick={handleChangePassword}
          >
            {passwordSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
      {/* ---- Logout ---- */}
      <div
        className={styles.card}
        style={{
          background: colorScheme.background,
          borderColor: colorScheme.border,
        }}
      >
        <p style={{ color: colorScheme.text }} className={styles.cardTitle}>
          Session
        </p>
        <button
          className={styles.submitButton}
          style={{ background: "#ef4444" }}
          disabled={loggingOut}
          onClick={handleLogout}
        >
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
        {logoutError && <p className={styles.errorText}>{logoutError}</p>}
      </div>

      <div style={{ width: "10vw", height: "150px" }}>_</div>
    </div>
  );
}
