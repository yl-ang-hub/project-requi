-- -------------------------------------------------------------
-- TablePlus 6.7.0(634)
--
-- https://tableplus.com/
--
-- Database: requi
-- Generation Time: 2025-09-19 18:25:37.0490
-- -------------------------------------------------------------


DROP TABLE IF EXISTS "public"."auth";
-- Table Definition
CREATE TABLE "public"."auth" (
    "user_id" int4 NOT NULL,
    "hash" text NOT NULL,
    PRIMARY KEY ("user_id")
);

DROP TABLE IF EXISTS "public"."account_codes";
-- Table Definition
CREATE TABLE "public"."account_codes" (
    "account_code" varchar(10) NOT NULL,
    "cost_centre" varchar(6),
    PRIMARY KEY ("account_code")
);

DROP TABLE IF EXISTS "public"."requisitions";
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

DROP TABLE IF EXISTS "public"."gl_codes";
-- Table Definition
CREATE TABLE "public"."gl_codes" (
    "gl_code" varchar(10) NOT NULL,
    "description" varchar(200),
    PRIMARY KEY ("gl_code")
);

DROP TABLE IF EXISTS "public"."currencies";
-- Table Definition
CREATE TABLE "public"."currencies" (
    "code" varchar(3) NOT NULL,
    "conversion_rate" numeric(11,4),
    PRIMARY KEY ("code")
);

DROP TABLE IF EXISTS "public"."requisition_items";
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

DROP TABLE IF EXISTS "public"."approval_matrix";
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

DROP TABLE IF EXISTS "public"."requisition_approval_flow";
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

DROP TABLE IF EXISTS "public"."users";
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

DROP TABLE IF EXISTS "public"."requisition_attachments";
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

DROP TABLE IF EXISTS "public"."mmd_attachments";
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

DROP TABLE IF EXISTS "public"."finance_attachments";
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

DROP TABLE IF EXISTS "public"."cost_centres";
-- Table Definition
CREATE TABLE "public"."cost_centres" (
    "cost_centre" varchar(6) NOT NULL,
    "department_name" varchar(100) NOT NULL,
    "division_name" varchar(100) NOT NULL,
    "finance_officer" int4,
    PRIMARY KEY ("cost_centre")
);

DROP TABLE IF EXISTS "public"."purchase_orders";
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

DROP TABLE IF EXISTS "public"."suppliers";
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

DROP TABLE IF EXISTS "public"."purchase_order_items";
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

DROP TABLE IF EXISTS "public"."purchase_order_attachments";
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

DROP TABLE IF EXISTS "public"."roles";
-- Table Definition
CREATE TABLE "public"."roles" (
    "role" varchar(50) NOT NULL,
    "max_users" int4 NOT NULL,
    PRIMARY KEY ("role")
);

INSERT INTO "public"."auth" ("user_id", "hash") VALUES
(1, '$2b$12$ycL6IZ48XLgDP2lZyUIiV.EIqQOSas7NuquYaeNo6xYoNeu.CBw9K'),
(2, '$2b$12$Cf8iQfRtsCR0KQoxu.BvIevu0vAP6KPE6Z1h.v3.KFDD8yOSV4zIe'),
(3, '$2b$12$yszx2JkLGwSqUKzwWfCgqOAoSDPjtgJu8IQBeR.yw4Dx2i9d5ob.O'),
(4, '$2b$12$ZNMBO3WGFzFU8lAF4y1k9uLv0QdDupAkTqd7rWL0JI5vELRXYmwL.'),
(5, '$2b$12$sGDKwOIK/zVz534yOdZ1LOGVkh6Ail7XT9qpIG1nadBoCeEJAeDqC'),
(9, '$2b$12$gPzKF1D25gUKMkBCSKWjR.GInHYeYY0aa6g3ABOYNg9WJszerKoSi'),
(10, '$2b$12$KzpFTnieqK94gxtBfWZQZO6Qs7zU3VGeV4DWXD44TXF34pm92Km9y'),
(11, '$2b$12$DBOX9b6FlaRg2OELny5xgOcB1rZl208IO52d1IUGS3PlKVdPHbenu'),
(12, '$2b$12$iIfKEDwBFTFPCFX9OjT91ecx.CCpACG5KcVwrznlAs74aItlNwEOe'),
(13, '$2b$12$RvZpaSHVLFx6cz0wWjS3QOqSaUvhXmATtJojVyyXNw4h/iresd9IC'),
(14, '$2b$12$QxtxAH38ZA8Te7bPNTKDDuRGDTYGfaZaoFfQfpuYS4xxY2XfiYTRm'),
(15, '$2b$12$uml2ODCVTe1RxNou8EIC4O8rMuEWPBqBNygg6qIc.YkuwGzO.R6Iy'),
(16, '$2b$12$dxhkl2UBE.IsfhTyGPbapOyVV47tLwbxGvWSTKwHUFslykWkRkpu2'),
(17, '$2b$12$9ZvMiz21Z7QQNKYzavpcvumtl15uLJKg9RdbAGIH1aFKr3wNcLDsO'),
(18, '$2b$12$gWJeJ/hzTVrv8f7IhnCHLeDImUEK8nsGlK.7RUsjGnEKeMdH/1rc2');

INSERT INTO "public"."account_codes" ("account_code", "cost_centre") VALUES
('AC1001', 'FIN001'),
('AC2001', 'IT001'),
('AC2002', 'IT002'),
('AC3001', 'MMD001'),
('AC3002', 'MMD002'),
('AC4001', 'MKT001'),
('AC5001', 'HR001'),
('AC6001', 'OPS001'),
('AC6002', 'OPS002'),
('AC7001', 'EXE001');

INSERT INTO "public"."requisitions" ("id", "title", "description", "requester_id", "requester_contact_name", "requester_contact_number", "requester_email", "requester_role", "pr_contact_name", "pr_contact_number", "pr_contact_email", "cost_centre", "account_code", "gl_code", "total_amount", "currency", "amount_in_sgd", "comments", "goods_required_by", "status", "payment_status", "created_at", "updated_at", "updated_by", "mmd_in_charge", "next_approver") VALUES
(1, 'New Bike', 'Bicycle', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 1935.00, 'SGD', 1935.00, 'For patrol', '2025-10-12 16:27:26.865', 'Rejected', 'Not Applicable', '2025-09-13 00:49:23.909117', NULL, NULL, NULL, NULL),
(5, 'Other items', 'adjsfBicycle', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 1890.00, 'SGD', 1890.00, 'Dash and whell', '2025-10-12 17:56:27.044', 'Rejected', 'Not Applicable', '2025-09-13 02:00:38.678369', NULL, NULL, NULL, NULL),
(6, 'Buy Mount Everest', 'Expand land ownership', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 1750000.00, 'USD', 2397260.27, 'Expand land ownership', '2025-10-13 20:32:18.648', 'Pending MMD', 'Not Applicable', '2025-09-14 04:42:25.898751', NULL, NULL, 11, 12),
(7, 'Buy some machines', 'Dunno what machines', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL2000', 45600000.00, 'JPY', 414545.45, 'None', '2025-10-13 20:51:35.97', 'Rejected', 'Not Applicable', '2025-09-14 04:55:04.782328', NULL, NULL, NULL, NULL),
(8, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6001', 'GL7000', 270000.00, 'EUR', 402985.07, 'Test comments', '2025-10-14 16:47:39.719', 'Rejected', 'Not Applicable', '2025-09-15 00:49:00.390204', '2025-09-15 00:53:06.832905', 3, NULL, NULL),
(9, 'Test Title', 'Test Description', 3, 'Fin', '81111113', 'fin@mail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'SGD', 270000.00, 'Test comments', '2025-10-14 17:06:02.918', 'Rejected', 'Not Applicable', '2025-09-15 01:06:18.007167', NULL, NULL, NULL, NULL),
(10, 'Desks', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 270500.00, 'JPY', 2459.09, 'Test comments', '2025-12-01 00:00:00', 'Dropped', 'Not Applicable', '2025-09-15 14:42:09.204234', '2025-09-15 17:53:51.239957', 5, NULL, NULL),
(11, 'Chairs', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 279376.00, 'JPY', 2539.78, 'kasudhfljandfl;nl;nflansl;dnflasknfl;dsanflnasdl;kflasdknfl', '2025-10-15 06:42:21.242', 'Rejected', 'Not Applicable', '2025-09-15 14:44:25.468913', NULL, NULL, 11, NULL),
(12, 'Monitors', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-15 06:44:30.994', 'Pending Next Level Approver', 'Pending Order', '2025-09-15 14:45:32.115693', NULL, NULL, NULL, 10),
(13, 'Desk Phones', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 23975600.00, 'JPY', 217960.00, 'Test comments', '2025-10-15 06:45:37.418', 'Pending Next Level Approver', 'Pending Order', '2025-09-15 14:46:30.771865', NULL, NULL, NULL, 10),
(14, 'Projectors (test jpy)', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-15 07:47:27.559', 'Completed', 'Pending Order', '2025-09-15 15:48:57.215307', NULL, NULL, 11, NULL),
(15, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL5000', 270000.00, 'HKD', 47368.42, 'Test comments', '2025-10-15 14:28:30.566', 'Rejected', 'Not Applicable', '2025-09-15 22:28:55.96815', NULL, NULL, 11, NULL),
(16, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL4000', 270000.00, 'SGD', 270000.00, 'Test comments', '2025-10-15 14:29:46.469', 'Dropped', 'Not Applicable', '2025-09-15 22:30:10.087826', '2025-09-19 03:53:57.62825', 5, NULL, NULL),
(17, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL4000', 270000.00, 'SGD', 270000.00, 'Test comments', '2025-10-15 14:30:11.89', 'Rejected', 'Not Applicable', '2025-09-15 22:30:27.033489', NULL, NULL, NULL, NULL),
(20, 'pickleballs', 'Test Description', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL2000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-16 08:44:53.715', 'Rejected', 'Not Applicable', '2025-09-16 16:53:41.324948', NULL, NULL, 18, NULL),
(21, 'Buy wall paintings for decoration', 'wall paintings', 5, 'ops', '82221111', 'ops@mail.com', 'Staff', 'yl', '81234567', 'yl@mail.com', 'OPS002', 'AC6002', 'GL6000', 701000.00, 'EUR', 1046268.66, 'Test comments', '2025-10-16 17:24:39.966', 'Delivered', 'Pending Order', '2025-09-17 01:28:49.432748', '2025-09-17 01:36:56.220391', 3, 11, NULL),
(22, 'Buy keyboards', 'mechanical keyboards', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL5000', 1300.00, 'SGD', 1300.00, 'Test comments', '2025-10-16 18:43:58.757', 'Rejected', 'Not Applicable', '2025-09-17 02:44:59.440831', NULL, NULL, 11, NULL),
(23, 'Buy computer mouse', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL5000', 100.00, 'SGD', 100.00, 'Test comments', '2025-10-16 18:45:58.231', 'Rejected', 'Not Applicable', '2025-09-17 02:46:25.292172', NULL, NULL, 11, NULL),
(24, 'Buy Nintendo Switch', 'Nintendo', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL2000', 800210.00, 'USD', 1096178.08, 'Test comments', '2025-10-17 02:53:13.191', 'Approved', 'Pending Order', '2025-09-17 10:56:22.895467', NULL, NULL, 11, NULL),
(25, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL5000', 270000.00, 'SGD', 270000.00, 'Test comments', '2025-10-17 03:47:33.715', 'Rejected', 'Not Applicable', '2025-09-17 11:50:42.033815', NULL, NULL, NULL, NULL),
(26, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL5000', 13500.00, 'SGD', 13500.00, 'Test comments', '2025-10-17 03:52:59.332', 'Rejected', 'Not Applicable', '2025-09-17 11:53:31.700996', NULL, NULL, NULL, NULL),
(27, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL3000', 1300.00, 'SGD', 1300.00, 'Test comments', '2025-10-17 03:54:18.686', 'Rejected', 'Not Applicable', '2025-09-17 11:54:45.820149', NULL, NULL, NULL, NULL),
(28, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL8000', 1600.00, 'GBP', 2758.62, 'Test comments', '2025-10-17 03:55:07.708', 'Rejected', 'Not Applicable', '2025-09-17 11:55:35.688276', NULL, NULL, NULL, NULL),
(29, 'Test Title', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 05:24:44.912', 'Dropped', 'Not Applicable', '2025-09-17 13:25:01.018582', '2025-09-19 03:50:05.171679', 5, NULL, NULL),
(30, 'Test Title', 'new pr attachments test', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 270000.00, 'JPY', 2454.55, 'test xlsx and pdf (2)', '2025-10-30 00:00:00', 'Dropped', 'Not Applicable', '2025-09-17 16:47:28.881694', '2025-09-17 16:53:14.417013', 5, NULL, NULL),
(31, 'new pr attachments test', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 08:50:10.326', 'Dropped', 'Not Applicable', '2025-09-17 16:50:44.337557', '2025-09-17 16:52:50.487557', 5, NULL, NULL),
(40, 'Test Title', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:00:01.01', 'Rejected', 'Not Applicable', '2025-09-18 02:00:28.770655', NULL, NULL, NULL, NULL),
(41, 'Test Title 2', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL3000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:09:27.262', 'Rejected', 'Not Applicable', '2025-09-18 02:09:55.849956', NULL, NULL, NULL, NULL),
(42, 'Test Title 3', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:22:55.503', 'Rejected', 'Not Applicable', '2025-09-18 02:23:16.733422', NULL, NULL, 11, NULL),
(43, 'Test Title 3', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:22:55.503', 'Dropped', 'Not Applicable', '2025-09-18 02:33:30.396615', '2025-09-19 03:55:56.911417', 3, NULL, NULL),
(44, 'Test Title 3', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:22:55.503', 'Pending MMD', 'Pending Order', '2025-09-18 02:34:09.820073', NULL, NULL, 11, 11),
(45, 'Test Title 3', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:22:55.503', 'Pending MMD', 'Pending Order', '2025-09-18 02:35:11.963594', NULL, NULL, 11, 11),
(46, 'Test Title 3', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:22:55.503', 'Dropped', 'Not Applicable', '2025-09-18 02:36:00.789319', '2025-09-19 03:56:41.911113', 3, NULL, NULL),
(47, 'Test Title 4', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:37:25.182', 'Dropped', 'Not Applicable', '2025-09-18 02:37:56.512394', '2025-09-19 04:03:40.983141', 3, NULL, NULL),
(48, 'Test Title 4', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:37:25.182', 'Dropped', 'Not Applicable', '2025-09-18 02:38:20.004234', '2025-09-19 04:05:05.322779', 3, NULL, NULL),
(49, 'Test Title 4', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:37:25.182', 'Pending Next Level Approver', 'Pending Order', '2025-09-18 02:39:02.160942', NULL, NULL, NULL, 16),
(50, 'Test Title 4', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:37:25.182', 'Pending Finance', 'Pending Order', '2025-09-18 02:43:56.964588', NULL, NULL, NULL, 15),
(51, 'Test Title 4', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:37:25.182', 'Pending Finance', 'Pending Order', '2025-09-18 02:46:22.9773', NULL, NULL, NULL, 15),
(52, 'Test Title 4', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:37:25.182', 'Pending Finance', 'Pending Order', '2025-09-18 02:46:53.330172', NULL, NULL, NULL, 15),
(53, 'Test Title 5', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:47:51.563', 'Pending Finance', 'Pending Order', '2025-09-18 02:51:15.941213', NULL, NULL, NULL, 15),
(54, 'Test Title 6', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:52:32.184', 'Pending Finance', 'Pending Order', '2025-09-18 02:52:52.510366', NULL, NULL, NULL, 15),
(55, 'Test Title 6', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:52:32.184', 'Pending Finance', 'Pending Order', '2025-09-18 02:54:33.613926', NULL, NULL, NULL, 15),
(56, 'Test Title 6', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:52:32.184', 'Pending Finance', 'Pending Order', '2025-09-18 02:55:48.333789', NULL, NULL, NULL, 15),
(57, 'Test Title 6', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:52:32.184', 'Pending Finance', 'Pending Order', '2025-09-18 02:58:13.363708', NULL, NULL, NULL, 15),
(58, 'Test Title 6', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:52:32.184', 'Pending Finance', 'Pending Order', '2025-09-18 03:00:05.04313', NULL, NULL, NULL, 15),
(59, 'Test Title 6', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:52:32.184', 'Pending Finance', 'Pending Order', '2025-09-18 03:01:23.266356', NULL, NULL, NULL, 15),
(60, 'Test Title 7', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 18:52:32.184', 'Pending Finance', 'Pending Order', '2025-09-18 03:03:27.368855', NULL, NULL, NULL, 15),
(61, 'Test Title 8', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:33:28.005', 'Pending Finance', 'Pending Order', '2025-09-18 03:34:00.102454', NULL, NULL, NULL, 15),
(62, 'Test Title 8', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:33:28.005', 'Pending Finance', 'Pending Order', '2025-09-18 03:35:40.107689', NULL, NULL, NULL, 15),
(63, 'Test Title', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:44:35.733', 'Pending Finance', 'Pending Order', '2025-09-18 03:45:39.341144', NULL, NULL, NULL, 15),
(64, 'Test Title', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:44:35.733', 'Pending Finance', 'Pending Order', '2025-09-18 03:45:39.437992', NULL, NULL, NULL, 15),
(65, 'Test Title', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:44:35.733', 'Pending Finance', 'Pending Order', '2025-09-18 03:47:12.485958', NULL, NULL, NULL, 15),
(66, 'Test Title', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:47:22.996', 'Pending Finance', 'Pending Order', '2025-09-18 03:47:42.694445', NULL, NULL, NULL, 15),
(67, 'Test Title', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:47:22.996', 'Pending Finance', 'Pending Order', '2025-09-18 03:48:23.486271', NULL, NULL, NULL, 15),
(68, 'Test Title 8', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:47:22.996', 'Pending Finance', 'Pending Order', '2025-09-18 03:50:03.848986', NULL, NULL, NULL, 15),
(69, 'Test Title 9', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL5000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-17 19:55:45.389', 'Pending MMD', 'Pending Order', '2025-09-18 03:56:21.215367', NULL, NULL, 11, 11),
(70, 'Buy cartons of coke', 'fizzy drinks', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL7000', 2500.00, 'SGD', 2500.00, 'Test comments', '2025-10-17 20:42:05.774', 'Pending Finance', 'Pending Order', '2025-09-18 04:43:54.182742', NULL, NULL, NULL, 3),
(71, 'Buy Pepsi', 'Test Description', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL8000', 2700.00, 'SGD', 2700.00, 'Test comments', '2025-10-17 20:54:11.292', 'Approved', 'Pending Order', '2025-09-18 04:55:33.21413', NULL, NULL, 11, NULL),
(72, 'Buy coke 2', 'Test Description', 3, 'Fin', '81111113', 'app6dev@gmail.com', 'Finance Officer', 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL3000', 270000.00, 'JPY', 2454.55, 'Test comments', '2025-10-18 03:07:11.48', 'Pending MMD', 'Pending Order', '2025-09-18 11:09:15.779814', NULL, NULL, 11, 13),
(73, 'Buy F1 cars (models)', 'Pretending to be rich', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL8000', 2700.00, 'USD', 3698.63, 'Test comments', '2025-10-18 09:49:52.951', 'Pending Next Level Approver', 'Pending Order', '2025-09-18 17:51:13.143172', NULL, NULL, NULL, 9),
(74, 'Demo - Buy Apple', 'Latest model', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@mycompany.com', 'OPS002', 'AC6002', 'GL1000', 900000.00, 'JPY', 8181.82, 'No discount for new models', '2025-10-18 19:48:39.117', 'Completed', 'Pending Order', '2025-09-19 03:49:30.116731', '2025-09-19 04:06:38.840829', 3, 11, NULL),
(75, 'test', 'Latest model', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@mycompany.com', 'OPS002', 'AC6002', 'GL3000', 20800.00, 'SGD', 20800.00, 'No discount for new models', '2025-10-19 01:31:36.497', 'Dropped', 'Not Applicable', '2025-09-19 09:32:21.08252', '2025-09-19 11:10:58.148843', 5, NULL, NULL),
(76, 'Demo - Buy Apple iPhone', 'Latest model', 5, 'ops', '82221111', 'app6dev@gmail.com', 'Staff', 'Shrek', '81234567', 'shrek@mycompany.com', 'OPS002', 'AC6002', 'GL3000', 3199.00, 'SGD', 3199.00, 'No discount for new models', '2025-10-19 02:58:18.097', 'Completed', 'Pending Order', '2025-09-19 11:00:37.54529', NULL, NULL, 11, NULL);

INSERT INTO "public"."gl_codes" ("gl_code", "description") VALUES
('GL1000', 'IT Hardware Purchases'),
('GL1001', 'IT Software Licenses'),
('GL2000', 'Equipment Purchases'),
('GL3000', 'Professional Services (Audit/Legal/Consulting)'),
('GL4000', 'Marketing & Printing Services'),
('GL5000', 'General Office Supplies'),
('GL6000', 'Facilities Maintenance'),
('GL7000', 'Logistics & Warehousing'),
('GL8000', 'Staff Training & Development');

INSERT INTO "public"."currencies" ("code", "conversion_rate") VALUES
('AUD', 1.0200),
('CAD', 0.9800),
('CNY', 5.2000),
('EUR', 0.6700),
('GBP', 0.5800),
('HKD', 5.7000),
('INR', 54.0000),
('JPY', 110.0000),
('SGD', 1.0000),
('USD', 0.7300);

INSERT INTO "public"."requisition_items" ("id", "requisition_id", "name", "description", "quantity", "unit_of_measure", "unit_cost", "currency") VALUES
(1, 5, 'dasf', 'adsf', 5, 'pcs', 10.00, 'SGD'),
(2, 5, 'asd', 'asdf', 10, 'pcs', 120.00, 'SGD'),
(3, 5, 'af', 'sd', 8, 'pcs', 80.00, 'SGD'),
(4, 6, 'Mount Everest', '', 1, 'pcs', 1000000.00, 'USD'),
(5, 6, 'Surrounding lakes', '', 5, 'pcs', 150000.00, 'USD'),
(6, 7, 'Machine A', 'Do A function', 10, 'pcs', 4500000.00, 'JPY'),
(7, 7, 'Machine B', 'Do B function', 5, 'pcs', 120000.00, 'JPY'),
(8, 8, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'EUR'),
(9, 8, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'EUR'),
(10, 9, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'SGD'),
(11, 9, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'SGD'),
(12, 10, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(13, 10, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(14, 10, 'Item C', 'Item C Description', 10, 'pcs', 10.00, 'JPY'),
(15, 10, 'D', 'D description', 20, 'pcs', 20.00, 'JPY'),
(16, 11, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(17, 11, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(18, 11, 'High back', 'chairs', 19, 'pcs', 132.00, 'JPY'),
(19, 11, 'bar seats', 'seats', 101, 'pcs', 68.00, 'JPY'),
(20, 12, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(21, 12, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(22, 13, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(23, 13, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(24, 13, 'C', '', 64, 'pcs', 320000.00, 'JPY'),
(25, 13, 'D', '', 32, 'pcs', 100800.00, 'JPY'),
(27, 14, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(28, 14, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(29, 15, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'HKD'),
(30, 15, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'HKD'),
(31, 16, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'SGD'),
(32, 16, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'SGD'),
(33, 17, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'SGD'),
(34, 17, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'SGD'),
(39, 20, 'rackets', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(40, 20, 'balls', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(41, 21, 'Mona Lisa', 'famous', 1, 'pcs', 500000.00, 'EUR'),
(42, 21, 'Scream', 'famous too', 1, 'pcs', 200000.00, 'EUR'),
(43, 21, 'Unnamed', 'street painting', 2, 'pcs', 500.00, 'EUR'),
(44, 22, 'Keyboards', 'Item A Description', 10, 'pcs', 130.00, 'SGD'),
(45, 23, 'Item A', 'Item A Description', 10, 'pcs', 10.00, 'SGD'),
(46, 24, 'console', 'Item A Description', 1, 'pcs', 800000.00, 'USD'),
(47, 24, 'protector', 'Item B Description', 1, 'pcs', 50.00, 'USD'),
(48, 24, 'game', 'diablo', 1, 'pcs', 100.00, 'USD'),
(49, 24, 'game2', 'pokemon', 1, 'pcs', 60.00, 'USD'),
(50, 25, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'SGD'),
(51, 25, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'SGD'),
(52, 26, 'Item A', 'Item A Description', 100, 'pcs', 15.00, 'SGD'),
(53, 26, 'Item B', 'Item B Description', 150, 'pcs', 80.00, 'SGD'),
(54, 27, 'Item A', 'Item A Description', 100, 'pcs', 1.00, 'SGD'),
(55, 27, 'Item B', 'Item B Description', 150, 'pcs', 8.00, 'SGD'),
(56, 28, 'Item A', 'Item A Description', 100, 'pcs', 1.00, 'GBP'),
(57, 28, 'Item B', 'Item B Description', 150, 'pcs', 10.00, 'GBP'),
(58, 29, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(59, 29, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(60, 30, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(61, 30, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(62, 31, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(63, 31, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(80, 40, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(81, 40, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(82, 41, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(83, 41, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(84, 42, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(85, 42, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(86, 43, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(87, 43, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(88, 44, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(89, 44, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(90, 45, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(91, 45, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(92, 46, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(93, 46, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(94, 47, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(95, 47, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(96, 48, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(97, 48, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(98, 49, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(99, 49, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(100, 50, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(101, 50, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(102, 51, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(103, 51, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(104, 52, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(105, 52, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(106, 53, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(107, 53, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(108, 54, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(109, 54, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(110, 55, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(111, 55, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(112, 56, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(113, 56, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(114, 57, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(115, 57, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(116, 58, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(117, 58, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(118, 59, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(119, 59, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(120, 60, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(121, 60, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(122, 61, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(123, 61, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(124, 62, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(125, 62, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(126, 63, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(127, 63, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(128, 64, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(129, 64, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(130, 65, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(131, 65, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(132, 66, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(133, 66, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(134, 67, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(135, 67, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(136, 68, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(137, 68, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(138, 69, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(139, 69, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(140, 70, 'Coke Zero', '', 100, 'pcs', 10.00, 'SGD'),
(141, 70, 'Coke Original', '', 150, 'pcs', 10.00, 'SGD'),
(142, 71, 'Item A', 'Item A Description', 100, 'pcs', 15.00, 'SGD'),
(143, 71, 'Item B', 'Item B Description', 150, 'pcs', 8.00, 'SGD'),
(144, 72, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(145, 72, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(146, 73, 'Lambo', 'Item A Description', 10, 'pcs', 150.00, 'USD'),
(147, 73, 'Ferrari', 'Item B Description', 15, 'pcs', 80.00, 'USD'),
(148, 74, 'A', '', 1, 'pcs', 100000.00, 'JPY'),
(149, 74, 'B', '', 10, 'pcs', 80000.00, 'JPY'),
(150, 75, 'a', '', 10, 'pcs', 80.00, 'SGD'),
(151, 75, 'b', '', 20, 'pcs', 1000.00, 'SGD'),
(152, 76, '17 Air', '', 1, 'pcs', 1200.00, 'SGD'),
(153, 76, '17 pro max', '', 1, 'pcs', 1999.00, 'SGD');

INSERT INTO "public"."approval_matrix" ("id", "for_cost_centre", "role", "min_cost", "max_cost") VALUES
(1, 'ALL', 'Department Head', 0.00, 50000.00),
(2, 'ALL', 'Division Director', 50000.00, 200000.00),
(3, 'ALL + MMD', 'CFO', 200000.00, 500000.00),
(4, 'ALL + MMD', 'CEO', 500000.00, 999999999.00),
(5, 'MMD001', 'MMD Head', 0.00, 50000.00),
(6, 'MMD002', 'MMD Head', 0.00, 50000.00),
(7, 'MMD001', 'MMD Director', 50000.00, 200000.00),
(8, 'MMD002', 'MMD Director', 50000.00, 200000.00);

INSERT INTO "public"."requisition_approval_flow" ("requisition_id", "approval_matrix_id", "approval_status", "requisition_approval_sequence", "approved_at", "approver_id", "approver_comments", "approver_role") VALUES
(6, NULL, 'Approved', 1, '2025-09-14 22:58:59.669546', 3, 'Test approver comments', 'Finance Officer'),
(6, 1, 'Approved', 2, '2025-09-15 00:15:19.446501', 9, 'I''m the head', 'Department Head'),
(6, 2, 'Approved', 3, '2025-09-15 00:41:23.745461', 10, 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora pariatur reprehenderit harum itaque voluptatum officiis dolore vero molestias odit nostrum laborum possimus, aliquam quo fuga libero soluta tempore velit. Adipisci!', 'Division Director'),
(6, 3, 'Approved', 4, '2025-09-15 02:27:40.010275', 2, 'Sure, why not', 'CFO'),
(6, 4, 'Approved', 5, '2025-09-15 02:28:03.970154', 1, 'Ok', 'CEO'),
(6, NULL, 'Approved', 6, '2025-09-16 00:35:11.746269', 11, 'changed to include trees in the mountain', 'MMD'),
(6, NULL, 'Queued', 7, NULL, 12, NULL, 'MMD Head'),
(6, NULL, 'Queued', 8, NULL, 13, NULL, 'MMD Director'),
(7, NULL, 'Rejected', 1, '2025-09-15 03:12:45.250122', 3, 'Noo', 'Finance Officer'),
(7, 1, 'Not Applicable', 2, NULL, 9, NULL, 'Department Head'),
(7, 2, 'Not Applicable', 3, NULL, 10, NULL, 'Division Director'),
(7, 3, 'Not Applicable', 4, NULL, 2, NULL, 'CFO'),
(7, 4, 'Not Applicable', 5, NULL, 1, NULL, 'CEO'),
(7, NULL, 'Not Applicable', 6, NULL, NULL, NULL, 'MMD'),
(7, NULL, 'Not Applicable', 7, NULL, NULL, NULL, 'MMD Head'),
(7, NULL, 'Not Applicable', 8, NULL, NULL, NULL, 'MMD Director'),
(8, NULL, 'Approved', 1, '2025-09-15 00:53:06.838373', 3, 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam aut esse culpa saepe officia debitis eligendi impedit delectus sapiente qui excepturi sunt, praesentium natus perspiciatis corrupti molestias, quae incidunt recusandae!', 'Finance Officer'),
(8, 1, 'Rejected', 2, '2025-09-15 00:58:51.441866', 9, 'NA', 'Department Head'),
(8, 2, 'Not Applicable', 3, NULL, 10, NULL, 'Division Director'),
(8, 3, 'Not Applicable', 4, NULL, 2, NULL, 'CFO'),
(8, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD'),
(8, NULL, 'Not Applicable', 6, NULL, NULL, NULL, 'MMD Head'),
(8, NULL, 'Not Applicable', 7, NULL, NULL, NULL, 'MMD Director'),
(9, NULL, 'Rejected', 1, '2025-09-15 01:13:23.446264', 15, 'ljadshf', 'Finance Officer'),
(9, 1, 'Not Applicable', 2, NULL, 16, NULL, 'Department Head'),
(9, 2, 'Not Applicable', 3, NULL, 17, NULL, 'Division Director'),
(9, 3, 'Not Applicable', 4, NULL, 2, NULL, 'CFO'),
(9, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD'),
(9, NULL, 'Not Applicable', 6, NULL, NULL, NULL, 'MMD Head'),
(9, NULL, 'Not Applicable', 7, NULL, NULL, NULL, 'MMD Director'),
(10, NULL, 'Dropped', 1, NULL, 3, NULL, 'Finance Officer'),
(10, 1, 'Dropped', 2, NULL, 9, NULL, 'Department Head'),
(10, 2, 'Dropped', 3, NULL, 10, NULL, 'Division Director'),
(10, 3, 'Dropped', 4, NULL, 2, NULL, 'CFO'),
(10, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD'),
(10, NULL, 'Dropped', 6, NULL, NULL, NULL, 'MMD Head'),
(10, NULL, 'Dropped', 7, NULL, NULL, NULL, 'MMD Director'),
(11, NULL, 'Approved', 1, '2025-09-15 15:01:09.777046', 3, 'ok', 'Finance Officer'),
(11, 1, 'Approved', 2, '2025-09-15 15:03:26.479306', 9, 'ok', 'Department Head'),
(11, 2, 'Approved', 3, '2025-09-15 15:03:43.853737', 10, 'ok', 'Division Director'),
(11, 3, 'Approved', 4, '2025-09-15 15:04:11.249691', 2, 'I got money', 'CFO'),
(11, NULL, 'Approved', 5, '2025-09-15 15:38:28.324916', 11, 'already sourced for supplier', 'MMD'),
(11, NULL, 'Rejected', 6, '2025-09-15 16:01:48.770254', 12, 'wrong amount', 'MMD Head'),
(11, NULL, 'Not Applicable', 7, NULL, 13, NULL, 'MMD Director'),
(12, NULL, 'Approved', 1, '2025-09-15 22:30:44.038429', 3, 'ok', 'Finance Officer'),
(12, 1, 'Approved', 2, '2025-09-17 02:47:04.284013', 9, '', 'Department Head'),
(12, 2, 'Queued', 3, NULL, 10, NULL, 'Division Director'),
(12, 3, 'Queued', 4, NULL, 2, NULL, 'CFO'),
(12, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD'),
(12, NULL, 'Queued', 6, NULL, NULL, NULL, 'MMD Head'),
(12, NULL, 'Queued', 7, NULL, NULL, NULL, 'MMD Director'),
(13, NULL, 'Approved', 1, '2025-09-17 02:39:56.455595', 3, 'ok', 'Finance Officer'),
(13, 1, 'Approved', 2, '2025-09-17 02:42:50.355799', 9, 'sure', 'Department Head'),
(13, 2, 'Queued', 3, NULL, 10, NULL, 'Division Director'),
(13, 3, 'Queued', 4, NULL, 2, NULL, 'CFO'),
(13, 4, 'Queued', 5, NULL, 1, NULL, 'CEO'),
(13, NULL, 'Queued', 6, NULL, NULL, NULL, 'MMD'),
(13, NULL, 'Queued', 7, NULL, NULL, NULL, 'MMD Head'),
(13, NULL, 'Queued', 8, NULL, NULL, NULL, 'MMD Director'),
(14, NULL, 'Approved', 1, '2025-09-15 15:50:31.582305', 3, 'ok', 'Finance Officer'),
(14, 1, 'Approved', 2, '2025-09-15 15:51:29.94084', 9, 'ok', 'Department Head'),
(14, NULL, 'Approved', 3, '2025-09-15 15:55:34.008165', 11, 'ok', 'MMD'),
(14, NULL, 'Approved', 4, '2025-09-15 21:47:26.460852', 12, 'modified', 'MMD Head'),
(14, NULL, 'Approved', 5, '2025-09-15 22:49:40.077834', 13, 'create PO', 'MMD Director'),
(15, NULL, 'Approved', 1, '2025-09-15 22:30:50.284725', 3, 'ds', 'Finance Officer'),
(15, 1, 'Approved', 2, '2025-09-17 02:41:07.434424', 9, '', 'Department Head'),
(15, NULL, 'Rejected', 3, '2025-09-17 02:50:53.274103', 11, '', 'MMD'),
(15, NULL, 'Not Applicable', 4, NULL, 12, NULL, 'MMD Head'),
(15, NULL, 'Not Applicable', 5, NULL, 13, NULL, 'MMD Director'),
(16, NULL, 'Approved', 1, '2025-09-16 16:15:41.47881', 3, 'ok', 'Finance Officer'),
(16, 1, 'Approved', 2, '2025-09-16 16:24:57.688428', 9, 'sure why not', 'Department Head'),
(16, 2, 'Dropped', 3, NULL, 10, NULL, 'Division Director'),
(16, 3, 'Dropped', 4, NULL, 2, NULL, 'CFO'),
(16, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD'),
(16, NULL, 'Dropped', 6, NULL, NULL, NULL, 'MMD Head'),
(16, NULL, 'Dropped', 7, NULL, NULL, NULL, 'MMD Director'),
(17, NULL, 'Approved', 1, '2025-09-16 16:26:16.571397', 3, 'the account code and gl code are correct', 'Finance Officer'),
(17, 1, 'Rejected', 2, '2025-09-17 02:40:55.19994', 9, 'title not informative', 'Department Head'),
(17, 2, 'Not Applicable', 3, NULL, 10, NULL, 'Division Director'),
(17, 3, 'Not Applicable', 4, NULL, 2, NULL, 'CFO'),
(17, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD'),
(17, NULL, 'Not Applicable', 6, NULL, NULL, NULL, 'MMD Head'),
(17, NULL, 'Not Applicable', 7, NULL, NULL, NULL, 'MMD Director'),
(20, NULL, 'Approved', 1, '2025-09-17 02:40:06.060551', 3, 'ok', 'Finance Officer'),
(20, 1, 'Approved', 2, '2025-09-17 02:41:16.085532', 9, '', 'Department Head'),
(20, NULL, 'Approved', 3, '2025-09-17 02:54:57.79826', 18, 'sure all the hots now', 'MMD'),
(20, NULL, 'Rejected', 4, '2025-09-17 03:04:05.811302', 12, 'company will not pay for sporting equipment', 'MMD Head'),
(20, NULL, 'Not Applicable', 5, NULL, 13, NULL, 'MMD Director'),
(21, NULL, 'Approved', 1, '2025-09-17 01:36:56.25866', 3, 'Changed to GL6000 (Facilities)', 'Finance Officer'),
(21, 1, 'Approved', 2, '2025-09-17 01:38:19.806436', 9, 'Very atas tastes!!!', 'Department Head'),
(21, 2, 'Approved', 3, '2025-09-17 01:39:48.334188', 10, 'the quick brown fox jumps over the lazy dog', 'Division Director'),
(21, 3, 'Approved', 4, '2025-09-17 01:40:43.215658', 2, 'did everyone really think that the company is very rich? that said.. go ahead with this purchase', 'CFO'),
(21, 4, 'Approved', 5, '2025-09-17 01:41:20.459636', 1, 'just for face, let''s buy the most famous paintings ', 'CEO'),
(21, NULL, 'Approved', 6, '2025-09-17 01:45:25.142322', 11, 'Managed to buy at cheaper rates from PrintWorks -- hopefully it''s real and not a print', 'MMD'),
(21, NULL, 'Approved', 7, '2025-09-17 01:53:35.762769', 12, 'Just informed by mmd that delivery fee has gone up! Updated accordingly..', 'MMD Head'),
(21, NULL, 'Approved', 8, '2025-09-17 01:59:44.801763', 13, 'Looks good - please inform warehouse to be careful with the goods on delivery', 'MMD Director'),
(22, NULL, 'Approved', 1, '2025-09-17 02:45:14.462962', 3, '', 'Finance Officer'),
(22, 1, 'Approved', 2, '2025-09-17 02:45:40.091332', 9, 'yes', 'Department Head'),
(22, NULL, 'Rejected', 3, '2025-09-19 01:14:07.435562', 11, 'reject - check po attachments', 'MMD'),
(22, NULL, 'Not Applicable', 4, NULL, 12, NULL, 'MMD Head'),
(22, NULL, 'Not Applicable', 5, NULL, 13, NULL, 'MMD Director'),
(23, NULL, 'Approved', 1, '2025-09-17 02:46:42.27353', 3, '', 'Finance Officer'),
(23, 1, 'Approved', 2, '2025-09-17 02:47:00.205305', 9, '', 'Department Head'),
(23, NULL, 'Rejected', 3, '2025-09-17 02:53:35.685503', 11, 'rejected summarily', 'MMD'),
(23, NULL, 'Not Applicable', 4, NULL, 12, NULL, 'MMD Head'),
(23, NULL, 'Not Applicable', 5, NULL, 13, NULL, 'MMD Director'),
(24, NULL, 'Approved', 1, '2025-09-17 10:58:42.473814', 3, 'checked all accounts are correct ', 'Finance Officer'),
(24, 1, 'Approved', 2, '2025-09-17 10:59:10.745858', 9, '', 'Department Head'),
(24, 2, 'Approved', 3, '2025-09-17 10:59:22.683127', 10, '', 'Division Director'),
(24, 3, 'Approved', 4, '2025-09-17 10:59:34.25031', 2, '', 'CFO'),
(24, 4, 'Approved', 5, '2025-09-17 10:59:45.98401', 1, '', 'CEO'),
(24, NULL, 'Approved', 6, '2025-09-17 11:04:53.180801', 11, 'sourced for suppliers', 'MMD'),
(24, NULL, 'Approved', 7, '2025-09-17 11:05:17.510297', 12, 'looks ok', 'MMD Head'),
(24, NULL, 'Approved', 8, '2025-09-17 11:06:00.049824', 13, 'unsaid', 'MMD Director'),
(25, NULL, 'Rejected', 1, '2025-09-17 13:10:59.01024', 3, '', 'Finance Officer'),
(25, 1, 'Not Applicable', 2, NULL, 9, NULL, 'Department Head'),
(25, 2, 'Not Applicable', 3, NULL, 10, NULL, 'Division Director'),
(25, 3, 'Not Applicable', 4, NULL, 2, NULL, 'CFO'),
(25, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD'),
(25, NULL, 'Not Applicable', 6, NULL, NULL, NULL, 'MMD Head'),
(25, NULL, 'Not Applicable', 7, NULL, NULL, NULL, 'MMD Director'),
(26, NULL, 'Rejected', 1, '2025-09-17 13:21:39.502183', 3, '', 'Finance Officer'),
(26, 1, 'Not Applicable', 2, NULL, 9, NULL, 'Department Head'),
(26, NULL, 'Not Applicable', 3, NULL, NULL, NULL, 'MMD'),
(26, NULL, 'Not Applicable', 4, NULL, NULL, NULL, 'MMD Head'),
(26, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD Director'),
(27, NULL, 'Rejected', 1, '2025-09-17 13:11:36.542432', 3, '', 'Finance Officer'),
(27, 1, 'Not Applicable', 2, NULL, 9, NULL, 'Department Head'),
(27, NULL, 'Not Applicable', 3, NULL, NULL, NULL, 'MMD'),
(27, NULL, 'Not Applicable', 4, NULL, NULL, NULL, 'MMD Head'),
(27, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD Director'),
(28, NULL, 'Rejected', 1, '2025-09-17 13:08:50.462796', 3, '', 'Finance Officer'),
(28, 1, 'Not Applicable', 2, NULL, 9, NULL, 'Department Head'),
(28, NULL, 'Not Applicable', 3, NULL, NULL, NULL, 'MMD'),
(28, NULL, 'Not Applicable', 4, NULL, NULL, NULL, 'MMD Head'),
(28, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD Director'),
(29, NULL, 'Dropped', 1, NULL, 3, NULL, 'Finance Officer'),
(29, 1, 'Dropped', 2, NULL, 9, NULL, 'Department Head'),
(29, NULL, 'Dropped', 3, NULL, NULL, NULL, 'MMD'),
(29, NULL, 'Dropped', 4, NULL, NULL, NULL, 'MMD Head'),
(29, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD Director'),
(30, NULL, 'Dropped', 1, NULL, 3, NULL, 'Finance Officer'),
(30, 1, 'Dropped', 2, NULL, 9, NULL, 'Department Head'),
(30, NULL, 'Dropped', 3, NULL, NULL, NULL, 'MMD'),
(30, NULL, 'Dropped', 4, NULL, NULL, NULL, 'MMD Head'),
(30, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD Director'),
(31, NULL, 'Dropped', 1, NULL, 3, NULL, 'Finance Officer'),
(31, 1, 'Dropped', 2, NULL, 9, NULL, 'Department Head'),
(31, NULL, 'Dropped', 3, NULL, NULL, NULL, 'MMD'),
(31, NULL, 'Dropped', 4, NULL, NULL, NULL, 'MMD Head'),
(31, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD Director'),
(40, NULL, 'Rejected', 1, '2025-09-19 00:50:18.476452', 15, '', 'Finance Officer'),
(40, 1, 'Not Applicable', 2, NULL, 16, NULL, 'Department Head'),
(40, NULL, 'Not Applicable', 3, NULL, NULL, NULL, 'MMD'),
(40, NULL, 'Not Applicable', 4, NULL, NULL, NULL, 'MMD Head'),
(40, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD Director'),
(41, NULL, 'Approved', 1, '2025-09-19 00:53:49.351703', 15, '', 'Finance Officer'),
(41, 1, 'Rejected', 2, '2025-09-19 01:01:14.61717', 16, 'finhead reject', 'Department Head'),
(41, NULL, 'Not Applicable', 3, NULL, NULL, NULL, 'MMD'),
(41, NULL, 'Not Applicable', 4, NULL, NULL, NULL, 'MMD Head'),
(41, NULL, 'Not Applicable', 5, NULL, NULL, NULL, 'MMD Director'),
(42, NULL, 'Approved', 1, '2025-09-19 00:53:59.116776', 15, '', 'Finance Officer'),
(42, 1, 'Approved', 2, '2025-09-19 01:02:14.666461', 16, 'test mmd reject', 'Department Head'),
(42, NULL, 'Approved', 3, '2025-09-19 01:17:30.0882', 11, '+c item +quot+po', 'MMD'),
(42, NULL, 'Approved', 4, '2025-09-19 01:22:28.263806', 12, 'dir 2 reject', 'MMD Head'),
(42, NULL, 'Rejected', 5, '2025-09-19 01:22:51.53753', 13, 'all seems right', 'MMD Director'),
(43, NULL, 'Approved', 1, '2025-09-19 00:54:12.217641', 15, 'test mmdhead approve', 'Finance Officer'),
(43, 1, 'Approved', 2, '2025-09-19 01:02:57.075978', 16, 'ok', 'Department Head'),
(43, NULL, 'Dropped', 3, NULL, 11, NULL, 'MMD'),
(43, NULL, 'Dropped', 4, NULL, 12, NULL, 'MMD Head'),
(43, NULL, 'Dropped', 5, NULL, 13, NULL, 'MMD Director'),
(44, NULL, 'Approved', 1, '2025-09-19 00:54:24.087253', 15, 'test mmdhead reject', 'Finance Officer'),
(44, 1, 'Approved', 2, '2025-09-19 01:02:36.121478', 16, 'ok', 'Department Head'),
(44, NULL, 'Queued', 3, NULL, 11, NULL, 'MMD'),
(44, NULL, 'Queued', 4, NULL, 12, NULL, 'MMD Head'),
(44, NULL, 'Queued', 5, NULL, 13, NULL, 'MMD Director'),
(45, NULL, 'Approved', 1, '2025-09-19 00:54:48.605563', 15, 'test mmddir reject', 'Finance Officer'),
(45, 1, 'Approved', 2, '2025-09-19 01:02:41.945668', 16, 'ok', 'Department Head'),
(45, NULL, 'Queued', 3, NULL, 11, NULL, 'MMD'),
(45, NULL, 'Queued', 4, NULL, 12, NULL, 'MMD Head'),
(45, NULL, 'Queued', 5, NULL, 13, NULL, 'MMD Director'),
(46, NULL, 'Approved', 1, '2025-09-19 00:54:35.41739', 15, 'test mmddir approve', 'Finance Officer'),
(46, 1, 'Dropped', 2, NULL, 16, NULL, 'Department Head'),
(46, NULL, 'Dropped', 3, NULL, NULL, NULL, 'MMD'),
(46, NULL, 'Dropped', 4, NULL, NULL, NULL, 'MMD Head'),
(46, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD Director'),
(47, NULL, 'Approved', 1, '2025-09-19 04:01:25.128749', 15, '', 'Finance Officer'),
(47, 1, 'Dropped', 2, NULL, 16, NULL, 'Department Head'),
(47, NULL, 'Dropped', 3, NULL, NULL, NULL, 'MMD'),
(47, NULL, 'Dropped', 4, NULL, NULL, NULL, 'MMD Head'),
(47, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD Director'),
(48, NULL, 'Approved', 1, '2025-09-19 04:01:31.834485', 15, '', 'Finance Officer'),
(48, 1, 'Dropped', 2, NULL, 16, NULL, 'Department Head'),
(48, NULL, 'Dropped', 3, NULL, NULL, NULL, 'MMD'),
(48, NULL, 'Dropped', 4, NULL, NULL, NULL, 'MMD Head'),
(48, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD Director'),
(49, NULL, 'Approved', 1, '2025-09-19 04:01:36.873851', 15, '', 'Finance Officer'),
(49, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(49, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(49, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(49, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(50, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(50, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(50, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(50, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(50, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(51, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(51, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(51, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(51, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(51, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(52, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(52, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(52, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(52, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(52, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(53, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(53, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(53, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(53, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(53, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(54, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(54, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(54, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(54, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(54, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(55, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(55, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(55, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(55, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(55, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(56, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(56, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(56, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(56, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(56, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(57, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(57, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(57, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(57, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(57, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(58, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(58, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(58, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(58, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(58, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(59, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(59, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(59, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(59, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(59, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(60, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(60, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(60, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(60, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(60, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(61, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(61, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(61, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(61, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(61, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(62, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(62, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(62, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(62, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(62, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(63, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(63, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(63, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(63, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(63, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(64, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(64, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(64, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(64, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(64, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(65, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(65, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(65, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(65, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(65, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(66, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(66, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(66, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(66, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(66, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(67, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(67, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(67, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(67, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(67, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(68, NULL, 'Queued', 1, NULL, 15, NULL, 'Finance Officer'),
(68, 1, 'Queued', 2, NULL, 16, NULL, 'Department Head'),
(68, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(68, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(68, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(69, NULL, 'Approved', 1, '2025-09-19 00:53:18.081376', 15, 'proceed', 'Finance Officer'),
(69, 1, 'Approved', 2, '2025-09-19 01:03:03.599838', 16, 'ok', 'Department Head'),
(69, NULL, 'Queued', 3, NULL, 11, NULL, 'MMD'),
(69, NULL, 'Queued', 4, NULL, 12, NULL, 'MMD Head'),
(69, NULL, 'Queued', 5, NULL, 13, NULL, 'MMD Director'),
(70, NULL, 'Queued', 1, NULL, 3, NULL, 'Finance Officer'),
(70, 1, 'Queued', 2, NULL, 9, NULL, 'Department Head'),
(70, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(70, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(70, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(71, NULL, 'Approved', 1, '2025-09-18 13:19:27.797249', 3, 'fin ok', 'Finance Officer'),
(71, 1, 'Approved', 2, '2025-09-18 13:19:50.122606', 9, 'ok', 'Department Head'),
(71, NULL, 'Approved', 3, '2025-09-18 14:49:08.552218', 11, 'sourced for supplier and issued PO for approval', 'MMD'),
(71, NULL, 'Approved', 4, '2025-09-18 17:30:30.464676', 12, 'replace with quote1', 'MMD Head'),
(71, NULL, 'Approved', 5, '2025-09-18 17:34:11.002965', 13, 'quot1 > quot2 && po xlsx > po pdf', 'MMD Director'),
(72, NULL, 'Approved', 1, '2025-09-19 00:51:01.464931', 15, 'account good to go', 'Finance Officer'),
(72, 1, 'Approved', 2, '2025-09-19 01:01:57.350709', 16, 'test upload and payment', 'Department Head'),
(72, NULL, 'Approved', 3, '2025-09-19 01:21:42.400931', 11, '+c+d+quot2', 'MMD'),
(72, NULL, 'Approved', 4, '2025-09-19 01:23:55.072941', 12, 'okkk', 'MMD Head'),
(72, NULL, 'Queued', 5, NULL, 13, NULL, 'MMD Director'),
(73, NULL, 'Approved', 1, '2025-09-19 00:47:22.558166', 3, 'account is correct', 'Finance Officer'),
(73, 1, 'Queued', 2, NULL, 9, NULL, 'Department Head'),
(73, NULL, 'Queued', 3, NULL, NULL, NULL, 'MMD'),
(73, NULL, 'Queued', 4, NULL, NULL, NULL, 'MMD Head'),
(73, NULL, 'Queued', 5, NULL, NULL, NULL, 'MMD Director'),
(74, NULL, 'Approved', 1, '2025-09-19 04:06:38.845097', 3, 'checked', 'Finance Officer'),
(74, 1, 'Approved', 2, '2025-09-19 04:07:16.563665', 9, 'ok', 'Department Head'),
(74, NULL, 'Approved', 3, '2025-09-19 04:10:32.241813', 11, 'sourced for supplier and drafted po for approval', 'MMD'),
(74, NULL, 'Approved', 4, '2025-09-19 04:12:32.202659', 12, 'amended remove xlsx inc biz template', 'MMD Head'),
(74, NULL, 'Approved', 5, '2025-09-19 04:15:13.78681', 13, 'approved', 'MMD Director'),
(75, NULL, 'Dropped', 1, NULL, 3, NULL, 'Finance Officer'),
(75, 1, 'Dropped', 2, NULL, 9, NULL, 'Department Head'),
(75, NULL, 'Dropped', 3, NULL, NULL, NULL, 'MMD'),
(75, NULL, 'Dropped', 4, NULL, NULL, NULL, 'MMD Head'),
(75, NULL, 'Dropped', 5, NULL, NULL, NULL, 'MMD Director'),
(76, NULL, 'Approved', 1, '2025-09-19 11:01:16.495264', 3, 'ok checked the account', 'Finance Officer'),
(76, 1, 'Approved', 2, '2025-09-19 11:01:47.64154', 9, 'ok', 'Department Head'),
(76, NULL, 'Approved', 3, '2025-09-19 11:03:55.726681', 11, 'Sourced for supplier', 'MMD'),
(76, NULL, 'Approved', 4, '2025-09-19 11:06:17.405113', 12, 'ok', 'MMD Head'),
(76, NULL, 'Approved', 5, '2025-09-19 11:06:43.301239', 13, 'ok', 'MMD Director');

INSERT INTO "public"."users" ("id", "name", "email", "role", "cost_centre", "designation", "contact_number", "login_id", "division_name") VALUES
(1, 'Boss', 'app6dev@gmail.com', 'CEO', 'EXE001', 'Chief Executive Officer', '81111111', 'boss', 'Executive'),
(2, 'CSY', 'app6dev@gmail.com', 'CFO', 'EXE001', 'Chief Financial Officer', '81111112', 'csy', 'Executive'),
(3, 'Fin', 'app6dev@gmail.com', 'Finance Officer', 'FIN001', 'Junior Finance Officer', '81111113', 'fin', 'Finance'),
(4, 'Superman', 'app6dev@gmail.com', 'System Admin', 'IT001', 'System Engineer', '88888888', 'super', 'Information Technology'),
(5, 'ops', 'app6dev@gmail.com', 'Staff', 'OPS002', 'Ops Officer', '82221111', 'ops', 'Operations'),
(9, 'opshead', 'app6dev@gmail.com', 'Department Head', 'OPS002', 'Head of Facilities', '82229999', 'opshead', 'Operations'),
(10, 'opsdir', 'app6dev@gmail.com', 'Division Director', 'OPS001', 'Director of Operations', '82220000', 'opsdir', 'Operations'),
(11, 'mmd', 'app6dev@gmail.com', 'MMD', 'MMD001', 'Procurement Officer', '87771111', 'mmd', 'Materials Management'),
(12, 'mmdhead', 'app6dev@gmail.com', 'MMD Head', 'MMD001', 'Head of Procurement', '87779999', 'mmdhead', 'Materials Management'),
(13, 'mmddir', 'app6dev@gmail.com', 'MMD Director', 'MMD002', 'Director of MMD', '87770000', 'mmddir', 'Materials Management'),
(14, 'hr', 'app6dev@gmail.com', 'Staff', 'HR001', 'HR Officer', '80001111', 'hr', 'Human Resources'),
(15, 'fin2', 'app6dev@gmail.com', 'Finance Officer', 'FIN001', 'Finance Officer', '81114444', 'fin2', 'Finance'),
(16, 'finhead', 'app6dev@gmail.com', 'Department Head', 'FIN001', 'Head of Finance', '81119999', 'finhead', 'Finance'),
(17, 'findir', 'app6dev@gmail.com', 'Division Director', 'FIN001', 'Director of Finance', '81110000', 'findir', 'Finance'),
(18, 'mmd2', 'app6dev@gmail.com', 'MMD', 'MMD001', 'MMD Officer', '81212123', 'mmd2', 'Materials Management');

INSERT INTO "public"."requisition_attachments" ("id", "requisition_id", "type", "link", "name") VALUES
(2, 69, 'Others', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/business-templates_basic-business-templates_quotation-template.xlsx', 'business-templates_basic-business-templates_quotation-template.xlsx'),
(3, 69, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/quotation1.pdf', 'quotation1.pdf'),
(4, 70, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/quotations/70_2025-09-18-044355_1_quotation1.pdf', 'quotation1.pdf'),
(5, 70, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/quotations/70_2025-09-18-044356_2_quotation2.pdf', 'quotation2.pdf'),
(6, 70, 'Others', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/quotations/70_2025-09-18-044356_3_business-templates_basic-business-templates_quotation-template.xlsx', 'business-templates_basic-business-templates_quotation-template.xlsx'),
(7, 71, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/71_Quotation_2025-09-18-045533_1_quotation1.pdf', 'quotation1.pdf'),
(8, 71, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/71_Quotation_2025-09-18-045534_2_quotation2.pdf', 'quotation2.pdf'),
(9, 72, 'Specs', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/72_Specs_2025-09-18-110916_1_business-templates_basic-business-templates_quotation-template.xlsx', 'business-templates_basic-business-templates_quotation-template.xlsx'),
(10, 72, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/72_Quotation_2025-09-18-110917_2_quotation2.pdf', 'quotation2.pdf'),
(11, 73, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/73_Quotation_2025-09-18-175114_1_quotation1.pdf', 'quotation1.pdf'),
(12, 74, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/74_Quotation_2025-09-19-034931_1_quotation1.pdf', 'quotation1.pdf'),
(13, 76, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/76_Quotation_2025-09-19-110038_1_quotation1.pdf', 'quotation1.pdf');

INSERT INTO "public"."mmd_attachments" ("id", "purchase_order_id", "type", "link", "name") VALUES
(1, 2, 'Invoice', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/2_Invoice_2025-09-18-235800_1_invoice1.pdf', 'invoice1.pdf'),
(2, 2, 'Delivery Note', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/2_Delivery Note_2025-09-18-235801_2_do1.pdf', 'do1.pdf'),
(3, 2, 'Goods Received', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/2_Goods Received_2025-09-18-235801_3_gr1.pdf', 'gr1.pdf'),
(4, 4, 'Invoice', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/4_Invoice_2025-09-19-012701_1_invoice2.pdf', 'invoice2.pdf'),
(5, 4, 'Delivery Note', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/4_Delivery Note_2025-09-19-012702_2_do1.pdf', 'do1.pdf'),
(6, 4, 'Goods Received', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/4_Goods Received_2025-09-19-012703_3_gr2.pdf', 'gr2.pdf'),
(7, 4, 'Invoice', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/4_Invoice_2025-09-19-012702_1_invoice2.pdf', 'invoice2.pdf'),
(8, 4, 'Delivery Note', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/4_Delivery Note_2025-09-19-012703_2_do1.pdf', 'do1.pdf'),
(9, 4, 'Goods Received', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/4_Goods Received_2025-09-19-012704_3_gr2.pdf', 'gr2.pdf'),
(10, 11, 'Invoice', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/11_Invoice_2025-09-19-041824_1_invoice1.pdf', 'invoice1.pdf'),
(11, 11, 'Delivery Note', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/11_Delivery Note_2025-09-19-041825_2_do1.pdf', 'do1.pdf'),
(12, 11, 'Goods Received', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/11_Goods Received_2025-09-19-041825_3_gr2.pdf', 'gr2.pdf'),
(13, 12, 'Invoice', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/12_Invoice_2025-09-19-110928_1_invoice1.pdf', 'invoice1.pdf'),
(14, 12, 'Delivery Note', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/12_Delivery Note_2025-09-19-110929_2_do2.pdf', 'do2.pdf'),
(15, 12, 'Goods Received', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/12_Goods Received_2025-09-19-110929_3_gr2.pdf', 'gr2.pdf');

INSERT INTO "public"."finance_attachments" ("id", "purchase_order_id", "type", "link", "name") VALUES
(1, 2, 'Proof of Payment', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/2_Proof of Payment_2025-09-19-003137_1_proof.xls', 'proof.xls'),
(2, 11, 'Proof of Payment', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/11_Proof of Payment_2025-09-19-041919_1_proof.xls', 'proof.xls'),
(3, 12, 'Proof of Payment', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/12_Proof of Payment_2025-09-19-111003_1_proof.xls', 'proof.xls');

INSERT INTO "public"."cost_centres" ("cost_centre", "department_name", "division_name", "finance_officer") VALUES
('EXE001', 'Executive Office', 'Executive', 3),
('FIN001', 'Finance - Accounting', 'Finance', 15),
('HR001', 'Talent Development', 'Human Resources', 3),
('IT001', 'Infrastructure', 'Information Technology', 3),
('IT002', 'Applications', 'Information Technology', 3),
('MKT001', 'Marketing', 'Marketing', 3),
('MMD001', 'Procurement', 'Materials Management', 3),
('MMD002', 'Materials Management - Logistics', 'Materials Management', 3),
('OPS001', 'Operations Management', 'Operations', 3),
('OPS002', 'Facilities Management', 'Operations', 3);

INSERT INTO "public"."purchase_orders" ("id", "requisition_id", "requester_id", "requester_provided_name", "requester_provided_contact_number", "requester_provided_email", "cost_centre", "account_code", "gl_code", "total_amount", "currency", "amount_in_sgd", "comments", "status", "supplier_business_reg_no", "company_name", "billing_address", "supplier_contact_name", "supplier_contact_number", "supplier_contact_email", "created_at", "created_by") VALUES
(1, 11, 5, 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 273808.00, 'JPY', 2489.16, 'kasudhfljandfl;nl;nflansl;dnflasknfl;dsanflnasdl;kflasdknfl', 'Draft', '201845678K', 'MediEquip Pte Ltd', NULL, 'Goofy', '91234567', 'goofy@mediequip.com', '2025-09-15 15:38:28.312457', 11),
(2, 14, 5, 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 270000.00, 'JPY', 2454.55, 'Test comments', 'Completed', '201845678K', 'MediEquip Pte Ltd', '21 Bukit Batok Crescent, Singapore 658065', 'Grey', '91234566', 'grey@example.com', '2025-09-15 15:55:33.983208', 11),
(3, 6, 5, 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL6000', 1450000.00, 'USD', 1986301.37, 'Expand land ownership', 'Draft', '201601234Z', 'Advisory Partners LLP', '1 Raffles Place #25-01, Singapore 048616', 'Simba', '91808989', 'simba@mail.com', '2025-09-16 00:35:11.711635', 1),
(4, 21, 5, 'yl', '81234567', 'yl@mail.com', 'OPS002', 'AC6002', 'GL6000', 521000.00, 'EUR', 777611.94, 'Test comments', 'Delivered', '201733221M', 'PrintWorks Singapore Pte Ltd', '100 Ubi Avenue 3, Singapore 408866', 'Emmy Tan Li Li', '87774567', 'emmy@print.com', '2025-09-17 01:45:25.083683', 1),
(5, 20, 5, 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL2000', 270000.00, 'JPY', 2454.55, 'Test comments', 'Rejected', '201912345A', 'TechSupply Solutions Pte Ltd', '10 Science Park Drive, Singapore 118234', 'Peter', '97658930', 'peter@sports.com', '2025-09-17 02:54:57.781538', 1),
(6, 24, 5, 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL2000', 980.00, 'USD', 1342.47, 'Test comments', 'Approved', '201912345A', 'TechSupply Solutions Pte Ltd', '10 Science Park Drive, Singapore 118234', 'djkahsuf', '81263783', 'john@mail.com', '2025-09-17 11:04:53.160229', 11),
(8, 71, 5, 'Shrek', '81234567', 'shrek@example.com', 'OPS002', 'AC6002', 'GL8000', 2700.00, 'SGD', 2700.00, 'Test comments', 'Approved', '201912345A', 'TechSupply Solutions Pte Ltd', '10 Science Park Drive, Singapore 118234', 'barney', '82403948', 'barney@mail.com', '2025-09-18 14:49:08.529506', 11),
(9, 42, 3, 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL6000', 270190.00, 'JPY', 2456.27, 'Test comments', 'Rejected', '201601234Z', 'Advisory Partners LLP', '1 Raffles Place #25-01, Singapore 048616', 'Dash', '82139043', 'dash@adpartners.com', '2025-09-19 01:17:30.05162', 11),
(10, 72, 3, 'Shrek', '81234567', 'shrek@example.com', 'FIN001', 'AC1001', 'GL3000', 256000.00, 'JPY', 2327.27, 'Test comments', 'Draft', '201845678K', 'MediEquip Pte Ltd', '21 Bukit Batok Crescent, Singapore 658065', 'Rush', '92370138', 'rush@medi.com', '2025-09-19 01:21:42.383398', 11),
(11, 74, 5, 'Shrek', '81234567', 'shrek@mycompany.com', 'OPS002', 'AC6002', 'GL1000', 8400.00, 'SGD', 8400.00, 'No discount for new models', 'Completed', '201523456C', 'LogiTrans Pte Ltd', '50 Jurong Port Road, Singapore 619113', 'Tim', '91238343', 'tim@logi.com', '2025-09-19 04:10:32.22485', 11),
(12, 76, 5, 'Shrek', '81234567', 'shrek@mycompany.com', 'OPS002', 'AC6002', 'GL3000', 3399.00, 'SGD', 3399.00, 'No discount for new models', 'Completed', '201733221M', 'PrintWorks Singapore Pte Ltd', '100 Ubi Avenue 3, Singapore 408866', 'djhsaf', '8927540', 'diushfa@mail.com', '2025-09-19 11:03:55.714772', 11);

INSERT INTO "public"."suppliers" ("business_reg_no", "company_name", "billing_address", "default_contact_number", "default_contact_email", "default_bank_account", "is_active") VALUES
('201523456C', 'LogiTrans Pte Ltd', '50 Jurong Port Road, Singapore 619113', '68991234', 'support@logitrans.sg', '3216549870', 't'),
('201601234Z', 'Advisory Partners LLP', '1 Raffles Place #25-01, Singapore 048616', '62223344', 'contact@advisory.sg', '6543210987', 't'),
('201733221M', 'PrintWorks Singapore Pte Ltd', '100 Ubi Avenue 3, Singapore 408866', '66778899', 'hello@printworks.sg', '9876543210', 't'),
('201845678K', 'MediEquip Pte Ltd', '21 Bukit Batok Crescent, Singapore 658065', '63456789', 'info@mediequip.sg', '4567891230', 't'),
('201912345A', 'TechSupply Solutions Pte Ltd', '10 Science Park Drive, Singapore 118234', '61234567', 'sales@techsupply.com', '1234567890', 't');

INSERT INTO "public"."purchase_order_items" ("id", "purchase_order_id", "name", "description", "quantity", "unit_of_measure", "unit_cost", "currency") VALUES
(1, 1, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(2, 1, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(3, 1, 'High back', 'chairs', 19, 'pcs', 132.00, 'JPY'),
(4, 1, 'bean bags', 'xyzzy', 1, 'pcs', 500.00, 'JPY'),
(5, 1, 'recliner', 'abc', 1, 'pcs', 800.00, 'JPY'),
(12, 2, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(13, 2, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(14, 3, 'Mount Everest', 'slab', 1, 'pcs', 1000000.00, 'USD'),
(15, 3, 'Surrounding lakes', 'body', 2, 'pcs', 150000.00, 'USD'),
(16, 3, 'trees', 'cluster', 10, 'pcs', 10000.00, 'USD'),
(17, 3, 'lions', 'pride', 10, 'pcs', 5000.00, 'USD'),
(26, 4, 'Mona Lisa', 'famous', 1, 'pcs', 400000.00, 'EUR'),
(27, 4, 'Scream', 'famous too', 1, 'pcs', 100000.00, 'EUR'),
(28, 4, 'Unnamed', 'street painting', 2, 'pcs', 500.00, 'EUR'),
(29, 4, 'delivery', 'professional delivery service', 1, 'pcs', 20000.00, 'EUR'),
(30, 5, 'rackets', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(31, 5, 'balls', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(42, 6, 'console', 'Item A Description', 1, 'pcs', 700.00, 'USD'),
(43, 6, 'protector', 'Item B Description', 1, 'pcs', 50.00, 'USD'),
(44, 6, 'game', 'diablo', 1, 'pcs', 100.00, 'USD'),
(45, 6, 'game2', 'pokemon', 1, 'pcs', 60.00, 'USD'),
(46, 6, 'gamw3', '', 1, 'pcs', 70.00, 'USD'),
(77, 8, 'Item A', 'Item A Description', 100, 'pcs', 15.00, 'SGD'),
(78, 8, 'Item B', 'Item B Description', 150, 'pcs', 8.00, 'SGD'),
(86, 9, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(87, 9, 'Item B', 'Item B Description', 150, 'pcs', 800.00, 'JPY'),
(88, 9, '+C', '', 1, 'pcs', 190.00, 'JPY'),
(89, 10, 'Item A', 'Item A Description', 100, 'pcs', 1500.00, 'JPY'),
(90, 10, 'Item B', 'Item B Description', 100, 'pcs', 800.00, 'JPY'),
(91, 10, 'New C', 'C item', 1, 'pcs', 1000.00, 'JPY'),
(92, 10, 'New D', 'D item', 50, 'pcs', 500.00, 'JPY'),
(97, 11, 'A', '', 2, 'pcs', 1000.00, 'SGD'),
(98, 11, 'B', '', 8, 'pcs', 800.00, 'SGD'),
(105, 12, '17 Air', '', 1, 'pcs', 1200.00, 'SGD'),
(106, 12, '17 pro max', '', 1, 'pcs', 1999.00, 'SGD'),
(107, 12, 'airpod', '', 1, 'pcs', 200.00, 'SGD');

INSERT INTO "public"."purchase_order_attachments" ("id", "purchase_order_id", "type", "link", "name") VALUES
(7, 8, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/8_Quotation_2025-09-18-173413_1_quotation2.pdf', 'quotation2.pdf'),
(8, 8, 'PO', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/8_PO_2025-09-18-173413_2_po1.pdf', 'po1.pdf'),
(9, 9, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/9_Quotation_2025-09-19-011730_1_quotation2.pdf', 'quotation2.pdf'),
(11, 10, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/10_Quotation_2025-09-19-012143_1_quotation2.pdf', 'quotation2.pdf'),
(12, 9, 'Others', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/9_Others_2025-09-19-012229_2_goods-received-note.docx', 'goods-received-note.docx'),
(13, 10, 'Specs', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/10_Specs_2025-09-19-012355_2_business-templates_basic-business-templates_quotation-template.xlsx', 'business-templates_basic-business-templates_quotation-template.xlsx'),
(14, 10, 'PO', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/10_PO_2025-09-19-012356_3_po1.pdf', 'po1.pdf'),
(15, 11, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/11_Quotation_2025-09-19-041033_1_quotation2.pdf', 'quotation2.pdf'),
(18, 11, 'Others', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/11_Others_2025-09-19-041233_3_business-templates_basic-business-templates_quotation-template.xlsx', 'business-templates_basic-business-templates_quotation-template.xlsx'),
(19, 11, 'PO', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/11_PO_2025-09-19-041515_3_purchase-order.xlsx', 'purchase-order.xlsx'),
(21, 12, 'Specs', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/12_Specs_2025-09-19-110357_2_business-templates_basic-business-templates_quotation-template.xlsx', 'business-templates_basic-business-templates_quotation-template.xlsx'),
(22, 12, 'Quotation', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/12_Quotation_2025-09-19-110618_2_quotation1.pdf', 'quotation1.pdf'),
(23, 12, 'Others', 'https://project-requi.s3.ap-southeast-2.amazonaws.com/12_Others_2025-09-19-110619_3_goods-received-note.docx', 'goods-received-note.docx');

INSERT INTO "public"."roles" ("role", "max_users") VALUES
('CEO', 1),
('CFO', 1),
('Department Head', 30),
('Division Director', 5),
('Finance Officer', 20),
('IT Officer', 10),
('MMD', 10),
('MMD Director', 1),
('MMD Head', 2),
('Staff', 100),
('System Admin', 3);

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
