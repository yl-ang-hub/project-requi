import React, { useState } from "react";
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

const UserCreate = () => {
  const formSchema = z.object({
    name: z.string().nonempty({ message: "required field" }),
    email: z.email().nonempty({ message: "required field" }),
    password: z.string().min(10, { message: "Min of 10 characters" }),
    role: z.string().nonempty({ message: "required field" }),
    department: z.string().nonempty({ message: "required field" }),
    designation: z.string().nonempty({ message: "required field" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      designation: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="w-full max-w-2xl m-auto">
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
                    data={[
                      {
                        value: "next.js",
                        label: "Next.js",
                      },
                      {
                        value: "sveltekit",
                        label: "SvelteKit",
                      },
                    ]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <FormComboBox
                    field={field}
                    setFormValue={form.setValue}
                    data={[
                      {
                        value: "next.js",
                        label: "Next.js",
                      },
                      {
                        value: "sveltekit",
                        label: "SvelteKit",
                      },
                    ]}
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
