import React from "react";
import { use } from "react";
import AuthCtx from "@/components/context/authContext";
import { Navigate } from "react-router-dom";

const ProtectedRouter = (props) => {
  const authCtx = use(AuthCtx);
  const isAuthenticated = authCtx.accessToken.length > 0;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return props.children;
};

export default ProtectedRouter;
