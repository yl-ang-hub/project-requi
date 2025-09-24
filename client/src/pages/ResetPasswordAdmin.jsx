import React, { useState } from "react";
import { use } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useMutation } from "@tanstack/react-query";
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

const ResetPasswordAdmin = () => {
  const params = useParams();
  const authCtx = use(AuthCtx);
  const fetchData = useFetch();
  const [newPassword, setNewPassword] = useState("12345678");
  const [newPassword2, setNewPassword2] = useState("12345678");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const changePassword = useMutation({
    mutationFn: async () => {
      return await fetchData(
        "/auth/admin/resetpassword",
        "PATCH",
        {
          userId: params.id,
          newPassword,
        },
        authCtx.accessToken
      );
    },
    onSuccess: () => {
      navigate("/users/search");
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto mt-40">
      <Card className="w-full max-w-md m-auto">
        <CardHeader>
          <CardTitle>Admin Password Reset for {params.login}</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
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
                    Key in the new password again
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
            onClick={() => {
              if (
                authCtx.role !== "IT Officer" &&
                authCtx.role !== "System Admin"
              ) {
                setError("You're unauthorised to execute this action");
                return;
              }
              if (error === "") {
                changePassword.mutate();
              }
            }}>
            Change Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordAdmin;
