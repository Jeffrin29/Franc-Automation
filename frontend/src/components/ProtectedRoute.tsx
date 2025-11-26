import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(userRole || "")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
