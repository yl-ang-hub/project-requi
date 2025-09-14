// import PRContext from "@/components/context/prContext";
import React, { use, useEffect, useRef, useState } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import AuthCtx from "@/components/context/authContext";
import PRLineItem from "../components/PRLineItem";
import { jwtDecode } from "jwt-decode";
import ApprovalFlow from "@/components/ApprovalFlow";
import { useNavigate } from "react-router-dom";

const PRCreate = () => {
  // const prCtx = use(PRContext);
  const authCtx = use(AuthCtx);
  const fetchData = useFetch();
  const [clearForm, setClearForm] = useState(false);
  const navigate = useNavigate();

  const prOptions = useQuery({
    queryKey: ["prOptions"],
    queryFn: async () => {
      return await fetchData(
        "/requisitions/getOptions",
        "GET",
        undefined,
        authCtx.accessToken
      );
    },
    enabled: !!authCtx.accessToken,
  });

  const itemSchema = z.object({
    name: z.string().nonempty({ message: "required field" }),
    description: z.string(),
    quantity: z.coerce.number().positive({ message: "required field" }),
    unit_of_measure: z.string(),
    unit_cost: z.coerce.number().positive({ message: "required field" }),
  });

  const formSchema = z.object({
    title: z.string().nonempty({ message: "required field" }),
    description: z.string(),
    prContactName: z.string().nonempty({ message: "required field" }),
    prContactNumber: z.coerce.number().positive({ message: "required field" }),
    prContactEmail: z.email().nonempty({ message: "required field" }),
    costCentre: z.string().nonempty({ message: "required field" }),
    accountCode: z.string().nonempty({ message: "required field" }),
    glCode: z.string().nonempty({ message: "required field" }),
    currency: z.string().nonempty({ message: "required field" }),
    comments: z.string(),
    goodsRequiredBy: z.coerce.date(),
    items: z.array(itemSchema).min(1),
  });

  // form is an object of all the form fields
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Test Title",
      description: "Test Description",
      prContactName: "Shrek", // default to requester
      prContactNumber: "81234567", // default to requester
      prContactEmail: "shrek@example.com", // default to requester
      costCentre: "", // default to requester cost centre
      accountCode: "",
      glCode: "",
      currency: "",
      comments: "Test comments",
      goodsRequiredBy: new Date(
        new Date().getTime() + 30 * 1000 * 60 * 60 * 24
      ),
      items: [
        {
          name: "Item A",
          description: "Item A Description",
          quantity: 100,
          unit_of_measure: "pcs",
          unit_cost: 1500,
        },
        {
          name: "Item B",
          description: "Item B Description",
          quantity: 150,
          unit_of_measure: "pcs",
          unit_cost: 800,
        },
      ],
    },
  });

  // itemsFormArray is an object of the field arrays
  const itemsFormArray = useFieldArray({
    name: "items",
    control: form.control,
  });

  const items = form.watch("items");

  const totalAmount = items.reduce((acc, curr) => {
    return (acc += curr.quantity * curr.unit_cost);
  }, 0);

  const handleAddLineItems = () => {
    itemsFormArray.append({
      name: "",
      description: "",
      quantity: 0,
      unit_of_measure: "pcs",
      unit_cost: 0,
    });
  };

  const costCentre = form.watch("costCentre");
  const currency = form.watch("currency");

  const approvalFlow = useMutation({
    mutationFn: async () => {
      console.log(costCentre);
      return await fetchData(
        "/requisitions/getApprovalFlow",
        "POST",
        {
          costCentre: costCentre,
          totalAmount: totalAmount,
          currency: currency,
        },
        authCtx.accessToken
      );
    },
  });

  const createPRMutation = useMutation({
    mutationFn: async (data) => {
      console.log(JSON.stringify(data.items));
      const total = data.items.reduce((acc, curr) => {
        return (acc += curr.quantity * curr.unit_cost);
      }, 0);
      console.log(`total amount is ${total}`);
      const body = {
        userId: authCtx.userId,
        title: data.title,
        description: data.description,
        prContactName: data.prContactName,
        prContactNumber: data.prContactNumber,
        prContactEmail: data.prContactEmail,
        costCentre: data.costCentre,
        accountCode: data.accountCode,
        glCode: data.glCode,
        totalAmount: total,
        currency: data.currency,
        comments: data.comments,
        goodsRequiredBy: data.goodsRequiredBy,
        items: data.items,
      };
      return await fetchData("/requisitions/create", "PUT", body);
    },
    onSuccess: () => {
      navigate("/");
    },
  });

  const onSubmit = (data) => {
    console.log("running onSubmit");
    console.log(data);
    createPRMutation.mutate(data);
  };

  const onReset = () => {
    form.reset();
    setClearForm(true);
    setTimeout(() => {
      setClearForm(false);
    }, 1000);
  };

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

  useEffect(() => {
    if (costCentre !== "" && costCentre && totalAmount !== 0 && currency !== "")
      approvalFlow.mutate();
  }, [totalAmount, costCentre, currency]);

  return (
    <div className="w-full max-w-4xl m-auto">
      My id is {authCtx.userId}, my role is {authCtx.role}
      and my access token is {authCtx.accessToken}. My refresh token is{" "}
      {localStorage.getItem("refresh")}
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
                      <FormComboBox
                        field={field}
                        setFormValue={form.setValue}
                        clearForm={clearForm}
                        data={prOptions?.data?.["cost_centres"]}
                      />
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
                    <FormLabel>Account Code</FormLabel>
                    <FormControl>
                      <FormComboBox
                        field={field}
                        setFormValue={form.setValue}
                        clearForm={clearForm}
                        data={prOptions?.data?.["account_codes"]}
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
                        data={prOptions?.data?.["gl_codes"]}
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
                        data={prOptions?.data?.["currencies"]}
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
                <FormLabel>Unit Cost (Trade Currency)</FormLabel>
              </div>
              {/* Fields for each line item */}
              {itemsFormArray.fields.map((item, idx) => {
                return (
                  <PRLineItem
                    form={form}
                    itemsFormArray={itemsFormArray}
                    item={item}
                    idx={idx}
                    key={idx}
                    disabled={false}
                  />
                );
              })}
            </div>

            <div className="bg-blue-200">
              Approval Flow
              <br />
              <ApprovalFlow data={approvalFlow?.data} newPR={true} />
            </div>

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
