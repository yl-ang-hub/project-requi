import AuthCtx from "@/components/context/authContext";
import useFetch from "@/hooks/useFetch";
import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import React, { use, useEffect } from "react";

const Dashboard = () => {
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);

  const refreshAccessToken = useMutation({
    mutationFn: async () => {
      return await fetchData(
        `/auth/refresh`,
        "GET",
        undefined,
        localStorage.getItem("refresh")
      );
    },
    onSuccess: (data) => {
      try {
        authCtx.setAccessToken(data.access);
        const decoded = jwtDecode(data.access);
        if (decoded) {
          authCtx.setUserId(decoded.id);
          authCtx.setRole(decoded.role);
        }
      } catch (e) {
        console.error(e.message);
      }
    },
  });

  useEffect(() => {
    // Auto login for users with refresh token in localStorage
    const refresh = localStorage.getItem("refresh");
    if (refresh && authCtx.accessToken == "") refreshAccessToken.mutate();
  }, []);

  return (
    <div>
      This is my dashboard. My id is {authCtx.userId}, my role is {authCtx.role}
      and my access token is {authCtx.accessToken}. My refresh token is{" "}
      {localStorage.getItem("refresh")}
    </div>
  );
};

export default Dashboard;
