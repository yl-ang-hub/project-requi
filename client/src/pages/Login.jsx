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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Disclaimer from "@/components/Disclaimer";
import { Loader } from "lucide-react";

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
      navigate("/pr");
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
        if (decoded.role.includes("MMD")) navigate("/approvals/pending");
        else navigate("/pr");
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
    <div className="w-full max-w-4xl mx-auto mt-10">
      <Card className="w-full max-w-md m-auto">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="loginId">Login ID</Label>
                <Input
                  id="loginId"
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
          <Button
            type="submit"
            className="w-full"
            onClick={auth.refetch}
            disabled={auth.isFetching}>
            {auth.isFetching ? <Loader /> : "Login"}
          </Button>
          <div className="text-sm text-red-500">
            {auth.isError && auth.error}
          </div>
        </CardFooter>
      </Card>

      <Disclaimer />
    </div>
  );
};

export default Login;
