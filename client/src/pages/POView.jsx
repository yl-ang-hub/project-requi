import React, { use, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";

const POView = () => {
  const params = useParams();
  const fetchData = useFetch();
  const authCtx = use(AuthCtx);
  const navigate = useNavigate();

  const isMMD = authCtx.role.includes("MMD");
  const isFinance = authCtx.role.includes("Finance");
  const readonly = true;

  const getPR = useQuery({
    queryKey: ["pr"],
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
    id: z.number().optional(),
    name: z.string().nonempty({ message: "required field" }),
    description: z.string(),
    quantity: z.coerce.number().positive({ message: "required field" }),
    unit_of_measure: z.string(),
    unit_cost: z.coerce.number().positive({ message: "required field" }),
  });

  const supplierSchema = z
    .object({
      nameAndRegNo: z.string().optional(),
      supplierContactName: z.string().optional(),
      supplierContactNumber: z.string().optional(),
      supplierEmail: z.string().optional(),
      finalQuotation: z.any().optional(),
      finalFiles: z.any().optional(),
      otherFiles: z.any().optional(),
      isMMD: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.isMMD) {
        if (!data.nameAndRegNo) {
          ctx.addIssue({
            path: ["nameAndRegNo"],
            code: "custom",
            message: "Supplier name & registration number is required for MMD",
          });
        }
        if (!data.supplierContactName) {
          ctx.addIssue({
            path: ["supplierContactName"],
            code: "custom",
            message: "Supplier contact name is required for MMD",
          });
        }
        if (!data.supplierContactNumber) {
          ctx.addIssue({
            path: ["supplierContactNumber"],
            code: "custom",
            message: "Supplier contact number is required for MMD",
          });
        }
        if (!data.supplierEmail) {
          ctx.addIssue({
            path: ["supplierEmail"],
            code: "custom",
            message: "Supplier email is required for MMD",
          });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.supplierEmail)) {
          ctx.addIssue({
            path: ["supplierEmail"],
            code: "custom",
            message: "Invalid email address",
          });
        }
      }
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
    poStatus: z.string().nonempty({ message: "required field" }),
    paymentStatus: z.string().nonempty({ message: "required field" }),
    createdAt: z.preprocess(
      (val) => (val ? new Date(val) : undefined),
      z.date()
    ),
    // updated_at: z.date(),
    // updated_by: z.string(),
    items: z.array(itemSchema).min(1),
    approverComments: z.string(),
    supplier: supplierSchema,
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
      costCentre: getPR.data?.po?.cost_centre || "",
      accountCode: getPR.data?.po?.account_code || "",
      glCode: getPR.data?.po?.gl_code || "",
      totalAmount: getPR.data?.po?.total_amount || "",
      currency: getPR.data?.po?.currency || "",
      amountInSGD: getPR.data?.po?.amount_in_sgd || "",
      comments: getPR.data?.pr?.comments || "",
      goodsRequiredBy: getPR.data?.pr?.goods_required_by
        ? new Date(getPR.data.pr.goods_required_by)
        : undefined,
      prStatus: getPR.data?.pr?.status || "",
      poStatus: getPR.data?.po?.status || "",
      paymentStatus: getPR.data?.pr?.payment_status || "",
      createdAt: getPR.data?.pr?.created_at
        ? new Date(getPR.data.pr.created_at)
        : undefined,
      // updated_at: "",
      // updated_by: "",
      items: getPR.data?.po?.items || [],
      approverComments: "",
      supplier: {
        nameAndRegNo: "",
        supplierContactName: "",
        supplierContactNumber: "",
        supplierEmail: "",
        finalQuotation: null,
        finalFiles: null,
        otherFiles: null,
        isMMD: authCtx.role.includes("MMD"),
      },
    },
  });

  // itemsFormArray is an object of the field arrays
  const itemsFormArray = useFieldArray({
    name: "items",
    control: form.control,
  });

  const getSuppliersMutation = useMutation({
    mutationFn: async () => {
      return await fetchData(
        "/suppliers",
        "GET",
        undefined,
        authCtx.accessToken
      );
    },
  });

  const items = form.watch("items");

  const totalAmount = items.reduce((acc, curr) => {
    return (acc += curr.quantity * curr.unit_cost);
  }, 0);

  const onSubmit = (data) => {
    console.log("running onSubmit");
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

    getSuppliersMutation.mutate();
  }, []);

  useEffect(() => {
    if (getPR.data?.po) {
      form.reset({
        title: getPR.data.pr.title,
        description: getPR.data.pr.description,
        requesterName: getPR.data.pr.requester_contact_name,
        requesterContactNumber: getPR.data.pr.requester_contact_number,
        requesterContactEmail: getPR.data.pr.requester_email,
        prContactName: getPR.data.pr.pr_contact_name,
        prContactNumber: getPR.data.pr.pr_contact_number,
        prContactEmail: getPR.data.pr.pr_contact_email,
        costCentre: getPR.data.po.cost_centre,
        accountCode: getPR.data.po.account_code,
        glCode: getPR.data.po.gl_code,
        totalAmount: getPR.data.po.total_amount,
        currency: getPR.data.po.currency,
        amountInSGD: getPR.data.po.amount_in_sgd,
        comments: getPR.data.pr.comments,
        goodsRequiredBy: new Date(getPR.data.pr.goods_required_by),
        prStatus: getPR.data.pr.status,
        poStatus: getPR.data.po.status,
        paymentStatus: getPR.data.pr.payment_status,
        createdAt: new Date(getPR.data.pr.created_at),
        // updated_at: new Date(getPR.data.pr.updated_at),
        // updated_by: getPR.data.pr.updated_by,
        items: getPR.data.po.items || [],
        approverComments: "",
        supplier: {
          nameAndRegNo: getPR.data.po?.supplier_business_reg_no || "",
          supplierContactName: getPR.data.po?.supplier_contact_name || "",
          supplierContactNumber: getPR.data.po?.supplier_contact_number || "",
          supplierEmail: getPR.data.po?.supplier_contact_email || "",
          finalQuotation: null,
          finalFiles: null,
          otherFiles: null,
          isMMD: authCtx.role.includes("MMD"),
        },
      });
    }
  }, [getPR.data, form, getSuppliersMutation.data, authCtx.role]);

  return (
    <div className="w-full max-w-4xl m-auto mt-8 mb-20">
      <div className="flex justify-between mb-4">
        <span className="text-2xl text-blue-800 font-extrabold dark:text-white">
          Purchase Requisition/Order
        </span>
        <span className="bg-blue-100 text-blue-800 text-2xl font-semibold px-2.5 py-0.5 rounded-sm dark:bg-blue-200 dark:text-blue-800">{`${getPR.data?.pr?.total_amount}`}</span>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (err) => {
            console.log("validation errors", err);
          })}
          className="space-y-8">
          <div className="grid grid-cols-2 gap-2">
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
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poStatus"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">PO Status</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        className="h-46 border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                        readOnly={readonly}
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
                        readOnly={readonly}
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
                        readOnly={readonly}
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
                        readOnly={readonly}
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
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="prStatus"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">PR Status</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

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
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
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
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <div className="text-xl font-bold dark:text-white mt-10">
              Approval Flow
            </div>
            <ApprovalFlow data={getPR?.data?.approval_flow} readonly />
          </div>

          <div className="my-6 mt-10">
            <div className="text-xl font-bold dark:text-white">Line Items</div>
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
                  readOnly={readonly}
                />
              );
            })}
          </div>

          <div>
            <div className="text-xl font-bold dark:text-white mt-10">
              Supplier
            </div>

            <FormField
              control={form.control}
              name="supplier.nameAndRegNo"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">Company</FormLabel>
                  <FormControl>
                    <FormComboBox
                      field={field}
                      setFormValue={form.setValue}
                      data={getSuppliersMutation?.data?.["supplier_listing"]}
                      readOnly={readonly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.supplierContactName"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">Contact Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={readonly}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.supplierContactNumber"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={readonly}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier.supplierEmail"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="font-bold">Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={readonly}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-700 read-only:bg-gray-100 read-only:cursor-grab read-only:select-text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isMMD || isFinance ? (
            <>
              <div>
                <div>For MMD Use</div>
                <div>Upload invoices / DOs</div>
                <div>Upload GRs</div>
                {isMMD ? (
                  <Button type="button">
                    Verify All Goods Received for PO
                  </Button>
                ) : (
                  <></>
                )}
              </div>

              <div>
                <div>For Finance Use</div>
                <div>Upload proof of payment</div>
                {isFinance ? (
                  <Button type="button">Verify Payment Made to Supplier</Button>
                ) : (
                  <></>
                )}
              </div>
            </>
          ) : (
            <></>
          )}
        </form>
      </Form>
    </div>
  );
};

export default POView;
