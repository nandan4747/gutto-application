// ProtectedRoute.tsx
import { HashLoader } from "react-spinners";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { colorScheme } from "../theme/colorScheme";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100dvh",
        }}
      >
        <HashLoader color={colorScheme.primary} />
      </div>
    );

  if (!user) return <Navigate to="/auth" replace />;

  return <Outlet />;
}
