import React, { useState, useEffect } from "react";
import { use } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import AuthCtx from "@/components/context/authContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const authCtx = use(AuthCtx);
  const fetchData = useFetch();
  const [loginIdInput, setLoginIdInput] = useState("fin");
  const [passwordInput, setPasswordInput] = useState("password123");
  const navigate = useNavigate();

  const loginToApp = async () => {
    const res = await fetchData(`/auth/login`, "POST", {
      loginId: loginIdInput.trim(),
      password: passwordInput.trim(),
    });

    try {
      localStorage.setItem("refresh", res.refresh);
      authCtx.setAccessToken(res.access);
      const decoded = jwtDecode(res.access);
      if (decoded) {
        authCtx.setUserId(decoded.id);
        authCtx.setRole(decoded.role);
        authCtx.setName(decoded.name);
      }
      navigate("/dashboard");
    } catch (e) {
      throw "A login error has occurred";
    }
    return true;
  };

  const auth = useQuery({
    queryKey: ["auth"],
    queryFn: loginToApp,
    enabled: false,
    retry: false,
  });

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
          authCtx.setName(decoded.name);
        }
        navigate("/dashboard");
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
    <div className="w-full max-w-4xl mx-auto mt-40">
      <div>{localStorage.getItem("refresh")}</div>
      <Card className="w-full max-w-md m-auto">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            {refreshAccessToken.isLoading}
            {refreshAccessToken.isPending}
            {refreshAccessToken.isError}
            {refreshAccessToken.isSuccess}
            Enter your email below to login to your account.
            <p>
              My id is {authCtx.userId}, my role is {authCtx.role}
              and my access token is {authCtx.accessToken}. My refresh token is
              {localStorage.getItem("refresh")}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="loginId">Login ID</Label>
                <Input
                  id="loginId"
                  placeholder="company id"
                  value={loginIdInput}
                  onChange={(event) => setLoginIdInput(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" onClick={auth.refetch}>
            Login
          </Button>
          <div className="text-sm text-red-500">
            {auth.isError && auth.error}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
