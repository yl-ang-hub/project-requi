-- -------------------------------------------------------------
-- TablePlus 6.7.0(634)
--
-- https://tableplus.com/
--
-- Database: requi
-- Generation Time: 2025-09-19 04:25:31.2500
-- -------------------------------------------------------------


-- Table Definition
CREATE TABLE "public"."auth" (
    "user_id" int4 NOT NULL,
    "hash" text NOT NULL,
    PRIMARY KEY ("user_id")
);

-- Table Definition
CREATE TABLE "public"."account_codes" (
    "account_code" varchar(10) NOT NULL,
    "cost_centre" varchar(6),
    PRIMARY KEY ("account_code")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS requisitions_id_seq;

-- Table Definition
CREATE TABLE "public"."requisitions" (
    "id" int4 NOT NULL DEFAULT nextval('requisitions_id_seq'::regclass),
    "title" varchar(200) NOT NULL,
    "description" text,
    "requester_id" int4 NOT NULL,
    "requester_contact_name" varchar(100) NOT NULL,
    "requester_contact_number" varchar(20) NOT NULL,
    "requester_email" varchar(100) NOT NULL,
    "requester_role" varchar(50) NOT NULL,
    "pr_contact_name" varchar(100) NOT NULL,
    "pr_contact_number" varchar(20) NOT NULL,
    "pr_contact_email" varchar(100) NOT NULL,
    "cost_centre" varchar(6) NOT NULL,
    "account_code" varchar(10) NOT NULL,
    "gl_code" varchar(10) NOT NULL,
    "total_amount" numeric(11,2) NOT NULL,
    "currency" varchar(3) NOT NULL,
    "amount_in_sgd" numeric(11,2) NOT NULL,
    "comments" text,
    "goods_required_by" timestamp NOT NULL,
    "status" varchar(30) DEFAULT 'Pending Finance'::character varying,
    "payment_status" varchar(30) DEFAULT 'Pending Order'::character varying,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp,
    "updated_by" int4,
    "mmd_in_charge" int4,
    "next_approver" int4,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."gl_codes" (
    "gl_code" varchar(10) NOT NULL,
    "description" varchar(200),
    PRIMARY KEY ("gl_code")
);

-- Table Definition
CREATE TABLE "public"."currencies" (
    "code" varchar(3) NOT NULL,
    "conversion_rate" numeric(11,4),
    PRIMARY KEY ("code")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS requisition_items_id_seq;

-- Table Definition
CREATE TABLE "public"."requisition_items" (
    "id" int4 NOT NULL DEFAULT nextval('requisition_items_id_seq'::regclass),
    "requisition_id" int4 NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "quantity" int4 NOT NULL,
    "unit_of_measure" varchar(20),
    "unit_cost" numeric(11,2) NOT NULL,
    "currency" varchar(3) DEFAULT 'SGD'::character varying,
    PRIMARY KEY ("id")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS approval_matrix_id_seq;

-- Table Definition
CREATE TABLE "public"."approval_matrix" (
    "id" int4 NOT NULL DEFAULT nextval('approval_matrix_id_seq'::regclass),
    "for_cost_centre" varchar(10) NOT NULL,
    "role" varchar(50) NOT NULL,
    "min_cost" numeric(11,2) NOT NULL,
    "max_cost" numeric(11,2) NOT NULL,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."requisition_approval_flow" (
    "requisition_id" int4 NOT NULL,
    "approval_matrix_id" int4,
    "approval_status" varchar(30) NOT NULL DEFAULT 'Queued'::character varying,
    "requisition_approval_sequence" int4 NOT NULL,
    "approved_at" timestamp,
    "approver_id" int4,
    "approver_comments" text,
    "approver_role" varchar(50) NOT NULL,
    PRIMARY KEY ("requisition_id","requisition_approval_sequence")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS users_id_seq;

-- Table Definition
CREATE TABLE "public"."users" (
    "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    "name" varchar(100) NOT NULL,
    "email" varchar(100) NOT NULL,
    "role" varchar(50) NOT NULL,
    "cost_centre" varchar(6) NOT NULL,
    "designation" varchar(50) NOT NULL,
    "contact_number" varchar(20),
    "login_id" varchar(10),
    "division_name" varchar(100) NOT NULL,
    PRIMARY KEY ("id")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS requisition_attachments_id_seq;

-- Table Definition
CREATE TABLE "public"."requisition_attachments" (
    "id" int4 NOT NULL DEFAULT nextval('requisition_attachments_id_seq'::regclass),
    "requisition_id" int4 NOT NULL,
    "type" varchar(20) NOT NULL,
    "link" text NOT NULL,
    "name" varchar(200) NOT NULL,
    PRIMARY KEY ("id")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS mmd_attachments_id_seq;

-- Table Definition
CREATE TABLE "public"."mmd_attachments" (
    "id" int4 NOT NULL DEFAULT nextval('mmd_attachments_id_seq'::regclass),
    "purchase_order_id" int4 NOT NULL,
    "type" varchar(20) NOT NULL,
    "link" text NOT NULL,
    "name" varchar(200) NOT NULL,
    PRIMARY KEY ("id")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS finance_attachments_id_seq;

-- Table Definition
CREATE TABLE "public"."finance_attachments" (
    "id" int4 NOT NULL DEFAULT nextval('finance_attachments_id_seq'::regclass),
    "purchase_order_id" int4 NOT NULL,
    "type" varchar(20) NOT NULL,
    "link" text NOT NULL,
    "name" varchar(200) NOT NULL,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."cost_centres" (
    "cost_centre" varchar(6) NOT NULL,
    "department_name" varchar(100) NOT NULL,
    "division_name" varchar(100) NOT NULL,
    "finance_officer" int4,
    PRIMARY KEY ("cost_centre")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS purchase_orders_id_seq;

-- Table Definition
CREATE TABLE "public"."purchase_orders" (
    "id" int4 NOT NULL DEFAULT nextval('purchase_orders_id_seq'::regclass),
    "requisition_id" int4 NOT NULL,
    "requester_id" int4 NOT NULL,
    "requester_provided_name" varchar(100) NOT NULL,
    "requester_provided_contact_number" varchar(20) NOT NULL,
    "requester_provided_email" varchar(100) NOT NULL,
    "cost_centre" varchar(6) NOT NULL,
    "account_code" varchar(10) NOT NULL,
    "gl_code" varchar(10) NOT NULL,
    "total_amount" numeric(11,2) NOT NULL,
    "currency" varchar(3) NOT NULL,
    "amount_in_sgd" numeric(11,2) NOT NULL,
    "comments" text,
    "status" varchar(30) NOT NULL DEFAULT 'Draft'::character varying,
    "supplier_business_reg_no" varchar(100),
    "company_name" varchar(200),
    "billing_address" varchar(200),
    "supplier_contact_name" varchar(200),
    "supplier_contact_number" varchar(20),
    "supplier_contact_email" varchar(100),
    "created_at" timestamp NOT NULL,
    "created_by" int4 NOT NULL,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."suppliers" (
    "business_reg_no" varchar(100) NOT NULL,
    "company_name" varchar(200) NOT NULL,
    "billing_address" varchar(200) NOT NULL,
    "default_contact_number" varchar(20),
    "default_contact_email" varchar(100),
    "default_bank_account" varchar(20),
    "is_active" bool NOT NULL DEFAULT true,
    PRIMARY KEY ("business_reg_no")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS purchase_order_items_id_seq;

-- Table Definition
CREATE TABLE "public"."purchase_order_items" (
    "id" int4 NOT NULL DEFAULT nextval('purchase_order_items_id_seq'::regclass),
    "purchase_order_id" int4 NOT NULL,
    "name" varchar(200) NOT NULL,
    "description" text,
    "quantity" int4 NOT NULL,
    "unit_of_measure" varchar(20),
    "unit_cost" numeric(11,2) NOT NULL,
    "currency" varchar(3) NOT NULL DEFAULT 'SGD'::character varying,
    PRIMARY KEY ("id")
);

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS purchase_order_attachments_id_seq;

-- Table Definition
CREATE TABLE "public"."purchase_order_attachments" (
    "id" int4 NOT NULL DEFAULT nextval('purchase_order_attachments_id_seq'::regclass),
    "purchase_order_id" int4 NOT NULL,
    "type" varchar(20) NOT NULL,
    "link" text NOT NULL,
    "name" varchar(200) NOT NULL,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."roles" (
    "role" varchar(50) NOT NULL,
    "max_users" int4 NOT NULL,
    PRIMARY KEY ("role")
);

ALTER TABLE "public"."auth" ADD FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."account_codes" ADD FOREIGN KEY ("cost_centre") REFERENCES "public"."cost_centres"("cost_centre");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("next_approver") REFERENCES "public"."users"("id");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("mmd_in_charge") REFERENCES "public"."users"("id");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("gl_code") REFERENCES "public"."gl_codes"("gl_code");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("account_code") REFERENCES "public"."account_codes"("account_code");
ALTER TABLE "public"."requisitions" ADD FOREIGN KEY ("cost_centre") REFERENCES "public"."cost_centres"("cost_centre");
ALTER TABLE "public"."requisition_items" ADD FOREIGN KEY ("requisition_id") REFERENCES "public"."requisitions"("id");
ALTER TABLE "public"."requisition_items" ADD FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code");
ALTER TABLE "public"."approval_matrix" ADD FOREIGN KEY ("role") REFERENCES "public"."roles"("role");
ALTER TABLE "public"."requisition_approval_flow" ADD FOREIGN KEY ("requisition_id") REFERENCES "public"."requisitions"("id");
ALTER TABLE "public"."requisition_approval_flow" ADD FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."requisition_approval_flow" ADD FOREIGN KEY ("approval_matrix_id") REFERENCES "public"."approval_matrix"("id");
ALTER TABLE "public"."users" ADD FOREIGN KEY ("role") REFERENCES "public"."roles"("role");
ALTER TABLE "public"."users" ADD FOREIGN KEY ("cost_centre") REFERENCES "public"."cost_centres"("cost_centre");
ALTER TABLE "public"."requisition_attachments" ADD FOREIGN KEY ("requisition_id") REFERENCES "public"."requisitions"("id");
ALTER TABLE "public"."mmd_attachments" ADD FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id");
ALTER TABLE "public"."finance_attachments" ADD FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id");
ALTER TABLE "public"."cost_centres" ADD FOREIGN KEY ("finance_officer") REFERENCES "public"."users"("id");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("gl_code") REFERENCES "public"."gl_codes"("gl_code");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("requisition_id") REFERENCES "public"."requisitions"("id");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("supplier_business_reg_no") REFERENCES "public"."suppliers"("business_reg_no");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("cost_centre") REFERENCES "public"."cost_centres"("cost_centre");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("account_code") REFERENCES "public"."account_codes"("account_code");
ALTER TABLE "public"."purchase_orders" ADD FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id");
ALTER TABLE "public"."purchase_order_items" ADD FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code");
ALTER TABLE "public"."purchase_order_items" ADD FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id");
ALTER TABLE "public"."purchase_order_attachments" ADD FOREIGN KEY ("purchase_order_id") REFERENCES "public"."requisitions"("id");
