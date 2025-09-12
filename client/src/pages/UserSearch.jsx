import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useFetch from "@/hooks/useFetch";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const UserSearch = () => {
  const fetchData = useFetch();

  const mutation = useMutation({
    mutationFn: async (searchQuery) => {
      console.log("running mutation");
      const body = {
        query: searchQuery,
      };
      console.log(JSON.stringify(body));
      return await fetchData("/users/search", "POST", body);
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div>Search for Users</div>
      <div>
        <Input
          placeholder="Search by email"
          onChange={(event) => mutation.mutate(event.target.value)}
        />

        {mutation.isSuccess &&
          mutation?.data?.map((user) => {
            return (
              <Card className="my-1" key={user.id}>
                <CardHeader>
                  <CardTitle>
                    {user.name} ({user.designation})
                  </CardTitle>
                  <CardAction>
                    <Button>Delete</Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p>Email: {user.email}</p>
                  <p>Cost Centre: {user.cost_centre}</p>
                  <p>Role: {user.role}</p>
                </CardContent>
                <CardFooter>
                  <Button>Edit</Button>
                  <Button>Reset Password</Button>
                </CardFooter>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default UserSearch;
