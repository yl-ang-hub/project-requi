import React, { useEffect } from "react";
import { use } from "react";
import { useNavigate } from "react-router-dom";
import AuthCtx from "./context/authContext";

const Logout = () => {
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("refresh");
    authCtx.setAccessToken("");
    authCtx.setUserId("");
    authCtx.setRole("");
    navigate("/");
    // to empty all states and contexts for next user
    window.location.reload(true);
  }, []);

  return <></>;
};

export default Logout;
