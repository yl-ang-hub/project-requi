import React, { use, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { get, useFieldArray, useForm } from "react-hook-form";
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
import ApprovalFlow from "@/components/ApprovalFlow";
import { useNavigate, useParams } from "react-router-dom";

const PRView = () => {
  const params = useParams();
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();
  const [allowDropping, setAllowDropping] = useState(false);

  const mmdFields = true,
    finFields = true;

  // TODO: display files

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

  const getPR = useQuery({
    queryKey: ["pr", params.id],
    queryFn: async () => {
      return await fetchData(
        `/requisitions/${params.id}`,
        "GET",
        undefined,
        authCtx.accessToken
      );
    },
    enabled: !!authCtx.accessToken,
  });

  const itemSchema = z.object({
    id: z.number().optional(),
    name: z.string().nonempty({ message: "required field" }),
    description: z.string(),
    quantity: z.coerce.number().positive({ message: "required field" }),
    unit_of_measure: z.string(),
    unit_cost: z.coerce.number().positive({ message: "required field" }),
  });

  const formSchema = z.object({
    title: z.string().nonempty({ message: "required field" }),
    description: z.string(),
    requesterName: z.string().nonempty({ message: "required field" }),
    requesterContactNumber: z.string().nonempty({ message: "required field" }),
    requesterContactEmail: z.email().nonempty({ message: "required field" }),
    prContactName: z.string().nonempty({ message: "required field" }),
    prContactNumber: z.string().nonempty({ message: "required field" }),
    prContactEmail: z.email().nonempty({ message: "required field" }),
    costCentre: z.string().nonempty({ message: "required field" }),
    accountCode: z.string().nonempty({ message: "required field" }),
    glCode: z.string().nonempty({ message: "required field" }),
    totalAmount: z.string().nonempty({ message: "required field" }),
    currency: z.string().nonempty({ message: "required field" }),
    amountInSGD: z.string().nonempty({ message: "required field" }),
    comments: z.string(),
    goodsRequiredBy: z.preprocess(
      (val) => (val ? new Date(val) : undefined),
      z.date()
    ),
    prStatus: z.string().nonempty({ message: "required field" }),
    paymentStatus: z.string().nonempty({ message: "required field" }),
    createdAt: z.preprocess(
      (val) => (val ? new Date(val) : undefined),
      z.date()
    ),
    // updated_at: z.date(),
    // updated_by: z.string(),
    items: z.array(itemSchema).min(1),
  });

  // form is an object of all the form fields
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: getPR.data?.pr?.title || "",
      description: getPR.data?.pr?.description || "",
      requesterName: getPR.data?.pr?.requester_contact_name || "",
      requesterContactNumber: getPR.data?.pr?.requester_contact_number || "",
      requesterContactEmail: getPR.data?.pr?.requester_email || "",
      prContactName: getPR.data?.pr?.pr_contact_name || "",
      prContactNumber: getPR.data?.pr?.pr_contact_number || "",
      prContactEmail: getPR.data?.pr?.pr_contact_email || "",
      costCentre: getPR.data?.pr?.cost_centre || "",
      accountCode: getPR.data?.pr?.account_code || "",
      glCode: getPR.data?.pr?.gl_code || "",
      totalAmount: getPR.data?.pr?.total_amount || "",
      currency: getPR.data?.pr?.currency || "",
      amountInSGD: getPR.data?.pr?.amount_in_sgd || "",
      comments: getPR.data?.pr?.comments || "",
      goodsRequiredBy: getPR.data?.pr?.goods_required_by
        ? new Date(getPR.data.pr.goods_required_by)
        : undefined,
      prStatus: getPR.data?.pr?.status || "",
      paymentStatus: getPR.data?.pr?.payment_status || "",
      createdAt: getPR.data?.pr?.created_at
        ? new Date(getPR.data.pr.created_at)
        : undefined,
      // updated_at: "",
      // updated_by: "",
      items: getPR.data?.pr?.items || [],
    },
  });

  // itemsFormArray is an object of the field arrays
  const itemsFormArray = useFieldArray({
    name: "items",
    control: form.control,
  });

  const dropPRMutation = useMutation({
    mutationFn: async () => {
      return await fetchData(
        `/requisitions/${params.id}/drop`,
        "DELETE",
        undefined,
        authCtx.accessToken
      );
    },
    onSuccess: () => {
      navigate(`/pr/${params.id}`);
    },
  });

  const onSubmit = (data) => {
    console.log("running onSubmit");
    dropPRMutation.mutate(data);
  };

  useEffect(() => {
    if (getPR.data?.po && getPR.data?.po.status !== "Draft")
      navigate(`/po/${getPR.data.po.id}}`);

    // Reset form default values after async finished
    if (getPR.data?.pr) {
      form.reset({
        title: getPR.data.pr.title,
        description: getPR.data.pr.description,
        requesterName: getPR.data.pr.requester_contact_name,
        requesterContactNumber: getPR.data.pr.requester_contact_number,
        requesterContactEmail: getPR.data.pr.requester_email,
        prContactName: getPR.data.pr.pr_contact_name,
        prContactNumber: getPR.data.pr.pr_contact_number,
        prContactEmail: getPR.data.pr.pr_contact_email,
        costCentre: getPR.data.pr.cost_centre,
        accountCode: getPR.data.pr.account_code,
        glCode: getPR.data.pr.gl_code,
        totalAmount: getPR.data.pr.total_amount,
        currency: getPR.data.pr.currency,
        amountInSGD: getPR.data.pr.amount_in_sgd,
        comments: getPR.data.pr.comments,
        goodsRequiredBy: new Date(getPR.data.pr.goods_required_by),
        prStatus: getPR.data.pr.status,
        paymentStatus: getPR.data.pr.payment_status,
        createdAt: new Date(getPR.data.pr.created_at),
        // updated_at: new Date(getPR.data.pr.updated_at),
        // updated_by: getPR.data.pr.updated_by,
        items: getPR.data.pr.items || [],
      });
    }

    const check =
      getPR.data?.pr?.requester_id == authCtx.userId &&
      (getPR.data?.pr?.status === "Pending Finance" ||
        getPR.data?.pr?.status === "Pending MMD");
    setAllowDropping(check);
  }, [getPR.data, form, authCtx.role]);

  return (
    <div className="w-full max-w-4xl m-auto mt-8 mb-20">
      <div className="flex justify-between mb-4">
        <span className="text-2xl text-blue-800 font-extrabold dark:text-white">
          Purchase Requisition
        </span>
        <span className="bg-blue-100 text-blue-800 text-2xl font-semibold px-2.5 py-0.5 rounded-sm dark:bg-blue-200 dark:text-blue-800">{`${getPR.data?.pr?.total_amount}`}</span>
      </div>

      <Form {...form} className="overflow-scroll">
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => {
            console.log("validation errors", err);
          })}
          className="space-y-8">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        readOnly={true}
                        className="h-46 border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requesterName"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">
                      Requester's Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requesterContactNumber"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">
                      Requester's Contact Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requesterContactEmail"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">
                      Requester's Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prContactName"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">
                      Name of Contact (for this PR)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prContactNumber"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">
                      Contact Number (for this PR)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prContactEmail"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">
                      Contact Email (for this PR)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="costCentre"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">Cost Centre</FormLabel>
                    <FormControl>
                      <FormComboBox
                        field={field}
                        setFormValue={form.setValue}
                        data={prOptions?.data?.["cost_centres"]}
                        readOnly={finFields}
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
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">Account Code</FormLabel>
                    <FormControl>
                      <FormComboBox
                        field={field}
                        setFormValue={form.setValue}
                        data={prOptions?.data?.["account_codes"]}
                        readOnly={finFields}
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
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">GL Code</FormLabel>
                    <FormControl>
                      <FormComboBox
                        field={field}
                        setFormValue={form.setValue}
                        data={prOptions?.data?.["gl_codes"]}
                        readOnly={finFields}
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
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">Currency</FormLabel>
                    <FormControl>
                      <FormComboBox
                        field={field}
                        setFormValue={form.setValue}
                        data={prOptions?.data?.["currencies"]}
                        readOnly={mmdFields}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountInSGD"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="font-bold">
                      Total Amount (SGD)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comments if any"
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goodsRequiredBy"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">Goods Required By</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prStatus"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">PR Status</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">
                    PR's Payment Status
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">Created at</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100  read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="my-6 mt-10">
              <div className="text-xl font-bold dark:text-white">
                Line Items
              </div>
              {/* Column headers for line items */}
              <div className="my-1 grid grid-cols-6 gap-1">
                <FormLabel className="font-bold">Item Name</FormLabel>
                <FormLabel className="font-bold">Item Description</FormLabel>
                <FormLabel className="font-bold">Quantity</FormLabel>
                <FormLabel className="font-bold">Unit of Measure</FormLabel>
                <FormLabel className="font-bold">
                  Unit Cost (Trade Currency)
                </FormLabel>
              </div>
              {/* Fields for each line item */}
              {itemsFormArray.fields.map((item, idx) => {
                return (
                  <PRLineItem
                    form={form}
                    itemsFormArray={itemsFormArray}
                    item={item}
                    idx={idx}
                    key={item.id}
                    readOnly={mmdFields}
                  />
                );
              })}
            </div>

            <div className="text-xl font-bold dark:text-white mt-10">
              Approval Flow
            </div>
            <ApprovalFlow data={getPR?.data?.approval_flow} />
          </div>

          {allowDropping ? <Button type="submit">Drop PR</Button> : <></>}
        </form>
      </Form>
    </div>
  );
};

export default PRView;
