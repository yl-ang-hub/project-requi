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

const ResetPassword = () => {
  const authCtx = use(AuthCtx);
  const fetchData = useFetch();
  const [loginId, setLoginId] = useState("fin");
  const [currentPassword, setCurrentPassword] = useState("password123");
  const [newPassword, setNewPassword] = useState("12345678");
  const [newPassword2, setNewPassword2] = useState("12345678");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const changePassword = useMutation({
    mutationFn: async () => {
      return await fetchData(
        "/auth/resetpassword",
        "PATCH",
        {
          currentPassword,
          newPassword,
        },
        authCtx.accessToken
      );
    },
    onSuccess: () => {
      navigate("/logout");
    },
  });

  return (
    <div className="w-full max-w-4xl">
      <Card className="w-full max-w-md m-auto">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
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
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="oldpassword">Current Password</Label>
                </div>
                <Input
                  id="oldpassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="newpassword">New Password</Label>
                </div>
                <Input
                  id="newpassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword((prevState) => event.target.value)
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="newpassword">
                    Key in your new password again
                  </Label>
                </div>
                <Input
                  id="newpassword"
                  type="password"
                  value={newPassword2}
                  onChange={(event) => {
                    setNewPassword2((prevState) => {
                      if (event.target.value === newPassword) {
                        setError((prevState) => "");
                      } else {
                        setError((prevState) => "New password does not match");
                      }
                      return event.target.value;
                    });
                  }}
                  required
                />
                <div className="text-red-500">{error}</div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            onClick={changePassword.mutate}>
            Change Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
