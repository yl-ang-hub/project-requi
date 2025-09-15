import React, { use, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
    <div className="w-full max-w-4xl m-auto">
      <div>PR for Approval</div>

      <Form {...form}>
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
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                  <FormItem>
                    <FormLabel>Requester's Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                  <FormItem>
                    <FormLabel>Requester's Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                  <FormItem>
                    <FormLabel>Requester's Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                  <FormItem>
                    <FormLabel>Name of Contact (for this PR)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                  <FormItem>
                    <FormLabel>Contact Number (for this PR)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                  <FormItem>
                    <FormLabel>Contact Email (for this PR)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <span className="text-red-800 text-right">{`${getPR.data?.pr?.total_amount}`}</span>

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
                  <FormItem>
                    <FormLabel>Account Code</FormLabel>
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
                  <FormItem>
                    <FormLabel>GL Code</FormLabel>
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
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
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
                  <FormItem>
                    <FormLabel>Total Amount (SGD)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={true}
                        className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                    <Textarea
                      placeholder="Comments if any"
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                <FormItem>
                  <FormLabel>Goods Required By</FormLabel>
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
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                <FormItem>
                  <FormLabel>PR Status</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                <FormItem>
                  <FormLabel>PR's Payment Status</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={true}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                <FormItem>
                  <FormLabel>Created at</FormLabel>
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
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-slate-">
            Approval Flow
            <br />
            <ApprovalFlow data={getPR?.data?.approval_flow} readonly />
          </div>

          <div className="my-6 ">
            Line Items <br />
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
                  key={item.id}
                  readOnly={readonly}
                />
              );
            })}
          </div>

          <div>Supplier</div>

          <div>
            <FormField
              control={form.control}
              name="supplier.nameAndRegNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
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
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={readonly}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={readonly}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
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
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={readonly}
                      className="border-gray-300 bg-white text-black px-2 py-1 read-only:border-gray-100 read-only:text-gray-500 read-only:cursor-grab read-only:select-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Supplier information 
              business_reg_no VARCHAR(100) PRIMARY KEY,
              company_name VARCHAR(200), 
              billing_address VARCHAR(200),
              default_bank_account VARCHAR(20),
              supplier_contact_name VARCHAR(200), 
              supplier_contact_number
              VARCHAR(20), 
              supplier_contact_email VARCHAR(100)
              Quotation (Final): 
              Specs & Others (Final):
              Quotations (Other suppliers): */}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default POView;
