import React, { useState, useEffect } from "react";
import { use } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import AuthCtx from "@/components/context/authContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
  const [usernameInput, setUsernameInput] = useState("Shrek");
  const [passwordInput, setPasswordInput] = useState("password123");
  const navigate = useNavigate();

  // const loginToApp = async () => {
  //   const res = await fetchData(`/auth/login`, "POST", {
  //     username: usernameInput.trim(),
  //     password: passwordInput.trim(),
  //   });

  //   try {
  //     localStorage.setItem("refresh", res.refresh);
  //     authCtx.setAccessToken(res.access);
  //     const decoded = jwtDecode(res.access);
  //     if (decoded) {
  //       authCtx.setUsername(decoded.username);
  //       authCtx.setUserId(decoded.id);
  //     }
  //     navigate("/user");
  //   } catch (e) {
  //     throw "A login error has occurred";
  //   }
  //   return true;
  // };

  // const auth = useQuery({
  //   queryKey: ["auth"],
  //   queryFn: loginToApp,
  //   enabled: false,
  //   retry: false,
  // });

  // const refreshAccessTokenMutation = useMutation({
  //   mutationFn: async () => {
  //     return await fetchData(`/auth/refresh`, "POST", {
  //       refresh: localStorage.getItem("refresh"),
  //     });
  //   },
  //   onSuccess: (data) => {
  //     try {
  //       authCtx.setAccessToken(data.access);
  //       const decoded = jwtDecode(data.access);
  //       if (decoded) {
  //         authCtx.setUsername(decoded.username);
  //         authCtx.setUserId(decoded.id);
  //       }
  //       navigate("/user");
  //     } catch (e) {
  //       console.error(e.message);
  //     }
  //   },
  // });

  // useEffect(() => {
  //   // Auto login for users with refresh token in localStorage
  //   const refresh = localStorage.getItem("refresh");
  //   if (refresh && refresh !== "undefined") refreshAccessTokenMutation.mutate();
  // }, []);

  return (
    <>
      <Card className="w-full max-w-sm m-auto">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={usernameInput}
                  onChange={(event) => setUsernameInput(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a>
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
          <Button type="submit" className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default Login;
