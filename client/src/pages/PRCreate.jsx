// import PRContext from "@/components/context/prContext";
import React, { use, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FormComboBox from "@/components/FormComboBox";

const PRCreate = () => {
  // const prCtx = use(PRContext);
  const [clearForm, setClearForm] = useState(false);

  const comboxboxFields = [
    {
      value: "next.js",
      label: "Next.js",
    },
    {
      value: "sveltekit",
      label: "SvelteKit",
    },
    {
      value: "nuxt.js",
      label: "Nuxt.js",
    },
    {
      value: "remix",
      label: "Remix",
    },
    {
      value: "astro",
      label: "Astro",
    },
  ];

  // Example
  const formSchema = z.object({
    title: z.string(),
    description: z.string(),
    prContactName: z.string(),
    prContactNumber: z.coerce.number(),
    prContactEmail: z.string(),
    costCentre: z.string(),
    accountCode: z.string(),
    glCode: z.string(),
    totalAmount: z.coerce.number(),
    currency: z.string(), // consider to omit
    amountInSGD: z.coerce.number(), // consider to omit
    comments: z.string(),
    goodsRequiredBy: z.date(),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      prContactName: "", // default to requester
      prContactNumber: "", // default to requester
      prContactEmail: "", // default to requester
      costCentre: "", // default to requester cost centre
      accountCode: "",
      glCode: "",
      totalAmount: 0,
      currency: "SGD", // consider to omit
      amountInSGD: 0, // consider to omit
      comments: "",
      goodsRequiredBy: new Date(
        new Date().getTime() + 30 * 1000 * 60 * 60 * 24
      ),
    },
  });
  const onSubmit = (data) => {
    console.log(data);
  };

  const onReset = () => {
    form.reset();
    setClearForm(true);
    setTimeout(() => {
      setClearForm(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-sm m-auto">
      <div>Create New PR</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name of Contact (for this PR)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prContactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number (for this PR)</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prContactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email (for this PR)</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Code {JSON.stringify(field)}</FormLabel>
                <FormControl>
                  <FormComboBox
                    field={field}
                    setFormValue={form.setValue}
                    clearForm={clearForm}
                    data={comboxboxFields}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="glCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GL Code</FormLabel>
                <FormControl>
                  <FormComboBox
                    field={field}
                    setFormValue={form.setValue}
                    clearForm={clearForm}
                    data={comboxboxFields}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <FormComboBox
                    field={field}
                    setFormValue={form.setValue}
                    clearForm={clearForm}
                    data={comboxboxFields}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments</FormLabel>
                <FormControl>
                  <Textarea placeholder="Comments if any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goodsRequiredBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goods Required By</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-blue-200">Line Items</div>
          <div className="bg-blue-200">Approval Flow</div>

          <Button onClick={() => onReset()}>Reset</Button>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default PRCreate;
