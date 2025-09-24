import React, { use } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import AuthCtx from "@/components/context/authContext";
import { useNavigate } from "react-router-dom";

const UserSearch = () => {
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (searchQuery) => {
      const body = {
        query: searchQuery,
      };

      return await fetchData(
        "/users/search",
        "POST",
        body,
        authCtx.accessToken
      );
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto my-2">
      <div className="text-2xl font-bold text-gray-800 dark:text-white my-5">
        Search for Users
      </div>
      <div>
        <Input onChange={(event) => mutation.mutate(event.target.value)} />

        {mutation.isSuccess &&
          mutation?.data?.map((user) => {
            return (
              <Card className="my-1" key={user.id}>
                <CardHeader>
                  <CardTitle>
                    {user.name} ({user.designation})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Login ID: {user.login_id}</p>
                  <p>Email: {user.email}</p>
                  <p>Cost Centre: {user.cost_centre}</p>
                  <p>Role: {user.role}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() =>
                      navigate(
                        `/admin/resetpassword/${user.login_id}/${user.id}`
                      )
                    }>
                    Reset Password
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default UserSearch;
