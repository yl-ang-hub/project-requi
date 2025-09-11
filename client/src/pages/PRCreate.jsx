// import PRContext from "@/components/context/prContext";
import React, { use, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
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
  const [totalAmount, setTotalAmount] = useState(0);

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

  const itemSchema = z.object({
    itemName: z.string().nonempty({ message: "required field" }),
    itemDescription: z.string(),
    quantity: z.coerce.number().positive({ message: "required field" }),
    unitOfMeasure: z.string(),
    unitCost: z.coerce.number().positive({ message: "required field" }),
  });
  const formSchema = z.object({
    title: z.string().nonempty({ message: "required field" }),
    description: z.string(),
    prContactName: z.string().nonempty({ message: "required field" }),
    prContactNumber: z.coerce.number().positive({ message: "required field" }),
    prContactEmail: z.email(),
    costCentre: z.string(),
    accountCode: z.string(),
    glCode: z.string(),
    totalAmount: z.coerce.number().positive({ message: "required field" }),
    currency: z.string(), // consider to omit
    amountInSGD: z.coerce.number(), // consider to omit
    comments: z.string(),
    goodsRequiredBy: z.coerce.date(),
    items: z.array(itemSchema),
  });

  // form is an object of all the form fields
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "New Bike",
      description: "Bicycle",
      prContactName: "Shrek", // default to requester
      prContactNumber: "81234567", // default to requester
      prContactEmail: "shrek@example.com", // default to requester
      costCentre: "888666", // default to requester cost centre
      accountCode: "",
      glCode: "",
      totalAmount: 1203,
      currency: "", // consider to omit
      amountInSGD: 1203, // consider to omit
      comments: "Dash and whell",
      goodsRequiredBy: new Date(
        new Date().getTime() + 30 * 1000 * 60 * 60 * 24
      ),
      items: [],
    },
  });

  // itemsFormArray is an object of the field arrays
  const itemsFormArray = useFieldArray({
    name: "items",
    control: form.control,
  });

  const handleAddLineItems = () => {
    itemsFormArray.append({
      itemName: "",
      itemDescription: "",
      quantity: 0,
      unitOfMeasure: "pcs",
      unitCost: 0,
    });
    const allFields = form.getValues("root");
    console.log(allFields);
  };

  const onSubmit = (data) => {
    console.log("running onSubmit");
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
    <div className="w-full max-w-4xl m-auto">
      <div>Create New PR</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-2">
            <div>
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
            </div>

            <div>
              <span className="text-red-800">
                Insert total amount here {totalAmount}
              </span>

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
            </div>
          </div>

          <div>
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

            <div className="my-6">
              Line Items <br />
              <Button type="button" onClick={handleAddLineItems}>
                Add new line item
              </Button>
              {/* Column headers for line items */}
              <div className="my-1 grid grid-cols-6 gap-1">
                <FormLabel>Item Name</FormLabel>
                <FormLabel>Item Description</FormLabel>
                <FormLabel>Quantity</FormLabel>
                <FormLabel>Unit of Measure</FormLabel>
                <FormLabel>Unit Cost</FormLabel>
              </div>
              {/* Fields for each line item */}
              {itemsFormArray.fields.map((item, idx) => {
                return (
                  <div className="my-1 grid grid-cols-6 gap-1" key={item.id}>
                    <FormField
                      control={form.control}
                      name={`items.${idx}.itemName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="item name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${idx}.itemDescription`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${idx}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${idx}.unitOfMeasure`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${idx}.unitCost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              // TODO: Display total amount for PR
                              // onChange={(event) => {
                              //   field.value = event.target.value;
                              //   totalAmount = parseFloat(event.target.value);
                              // }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={() => itemsFormArray.remove(idx)}>
                      Delete
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-200">Approval Flow</div>

            <Button type="reset" onClick={() => onReset()}>
              Reset
            </Button>

            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PRCreate;
