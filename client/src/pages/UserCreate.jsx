import React, { use, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormComboBox from "@/components/FormComboBox";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AuthCtx from "@/components/context/authContext";

const UserCreate = () => {
  const fetchData = useFetch();
  const navigate = useNavigate();
  const authCtx = use(AuthCtx);

  const getRegistrationOptions = useQuery({
    queryKey: ["regOpts"],
    queryFn: async () => {
      console.log("running query");
      const data = await fetchData(
        "/auth/users",
        "GET",
        undefined,
        authCtx.accessToken
      );
      console.log(data);
      return data;
    },
    enabled: !!authCtx.accessToken,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      const body = {
        name: data.name,
        email: data.email,
        contactNumber: data.contactNumber,
        loginId: data.loginId,
        password: data.password,
        role: data.role,
        divisionName: data.divisionName,
        costCentre: data.costCentre,
        designation: data.designation,
      };
      return await fetchData("/auth/users", "PUT", body, authCtx.accessToken);
    },
    onSuccess: (data) => {
      console.log(JSON.stringify(data));
      navigate("/admin/users/search");
    },
  });

  const formSchema = z.object({
    name: z.string().nonempty({ message: "required field" }),
    email: z.email().nonempty({ message: "required field" }),
    contactNumber: z.coerce
      .number()
      .min(80000000, { message: "required field" }),
    loginId: z.string().nonempty({ message: "required field" }),
    password: z.string().min(10, { message: "Min of 10 characters" }),
    role: z.string().nonempty({ message: "required field" }),
    divisionName: z.string().nonempty({ message: "required field" }),
    costCentre: z.string().nonempty({ message: "required field" }),
    designation: z.string().nonempty({ message: "required field" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      loginId: "",
      password: "",
      role: "",
      divisionName: "",
      costCentre: "",
      designation: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    createUserMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-20">
      <div>Add New User</div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loginId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <FormComboBox
                    field={field}
                    setFormValue={form.setValue}
                    data={getRegistrationOptions?.data?.roles}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="divisionName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Division Name</FormLabel>
                <FormControl>
                  <FormComboBox
                    field={field}
                    setFormValue={form.setValue}
                    data={getRegistrationOptions?.data?.["division_names"]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="costCentre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Centre</FormLabel>
                <FormControl>
                  <FormComboBox
                    field={field}
                    setFormValue={form.setValue}
                    data={getRegistrationOptions?.data?.["cost_centres"]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default UserCreate;
