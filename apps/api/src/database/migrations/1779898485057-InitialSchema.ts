import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1779898485057 implements MigrationInterface {
  name = 'InitialSchema1779898485057';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'INVENTORY_MANAGER', 'SALES_MANAGER', 'PROJECT_MANAGER', 'EMPLOYEE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'PENDING_INVITE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'EMPLOYEE', "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDING_VERIFICATION', "forcePasswordChange" boolean NOT NULL DEFAULT false, "branchId" uuid, "phone" character varying(20), "avatarUrl" character varying(500), "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationTokenHash" character varying(255), "emailVerificationExpires" TIMESTAMP WITH TIME ZONE, "refreshTokenHash" character varying(255), "twoFactorSecret" character varying(255), "isTwoFactorEnabled" boolean NOT NULL DEFAULT false, "twoFactorBackupCodes" text, "resetPasswordTokenHash" character varying(255), "resetPasswordExpires" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON "users" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27025bcfbedd86c058614b81f7" ON "users" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_preferences" ("userId" uuid NOT NULL, "key" character varying(100) NOT NULL, "value" jsonb NOT NULL, CONSTRAINT "PK_b797ed25423260439f817708dcd" PRIMARY KEY ("userId", "key"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b797ed25423260439f817708dc" ON "user_preferences" ("userId", "key") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_dashboard_widgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "widgetId" character varying(100) NOT NULL, "order" integer NOT NULL DEFAULT '0', "isVisible" boolean NOT NULL DEFAULT true, "settings" jsonb, "gridSpan" integer NOT NULL DEFAULT '24', CONSTRAINT "PK_a26991ff62070074c6bdb725fb0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b8c0947463a9cde138c914b382" ON "user_dashboard_widgets" ("userId", "widgetId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "code" character varying(20) NOT NULL, "address" character varying(255), "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_9c06cbb83feb2f0be6263bd47ee" UNIQUE ("code"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fda619979f40a6a44fc9baf02c" ON "branches" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd56c5d9ce71725ccbd6967831" ON "branches" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "working_calendars" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "branchId" uuid, "workingDays" text NOT NULL, "halfDays" text, "shiftOverrides" jsonb, "isActive" boolean NOT NULL DEFAULT true, "isDefault" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_d317a29e720e4fe208440de42a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d6e1404c3127f25afa24a006c" ON "working_calendars" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9278a067137c700040b7823049" ON "working_calendars" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "url" character varying(500) NOT NULL, "secret" character varying(255) NOT NULL, "events" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "headers" jsonb, CONSTRAINT "PK_b6d2d3606e01c28d476122185b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c3f75953455671406b1eca079" ON "webhook_configs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d89afd6b7cb37efa82b6f7e181" ON "webhook_configs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "webhookConfigId" uuid NOT NULL, "event" character varying(100) NOT NULL, "payload" jsonb NOT NULL, "responseBody" jsonb, "statusCode" integer, "attempt" integer NOT NULL DEFAULT '1', "isSuccess" boolean NOT NULL DEFAULT false, "error" text, CONSTRAINT "PK_535dd409947fb6d8fc6dfc0112a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd2bc3de0e4a0329a4ef30600b" ON "webhook_deliveries" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b9dce7ee955ee08740a8d48e8e" ON "webhook_deliveries" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6847e0fbfa8c5b91eab52b321e" ON "webhook_deliveries" ("webhookConfigId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "legalName" character varying(255), "tradeName" character varying(255), "registrationNumber" character varying(100), "schemaNamespace" character varying(63) NOT NULL, "domain" character varying(255) NOT NULL, "logoUrl" character varying(255), "address" text, "taxRegistrationNumber" character varying(50), "phoneNumber" character varying(20), "email" character varying(100), "website" character varying(100), "currency" character varying(20) NOT NULL DEFAULT 'USD', "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "primaryColor" character varying(7) NOT NULL DEFAULT '#00b96b', "isActive" boolean NOT NULL DEFAULT true, "ipAllowlist" text, "isSamlEnabled" boolean NOT NULL DEFAULT false, "samlEntryPoint" character varying(255), "samlIssuer" character varying(255), "samlCert" text, "dataResidency" character varying(10) NOT NULL DEFAULT 'US', "auditLogRetentionDays" integer NOT NULL DEFAULT '730', "mfaEnforced" boolean NOT NULL DEFAULT false, "sessionTimeoutMinutes" integer NOT NULL DEFAULT '60', "maxConcurrentSessions" integer NOT NULL DEFAULT '3', "passwordPolicy" jsonb, "smtpConfig" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name"), CONSTRAINT "UQ_d8e72943c705c6414199395b849" UNIQUE ("schemaNamespace"), CONSTRAINT "UQ_da4054294eaae43ec7f85b6a3a1" UNIQUE ("domain"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant_modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "moduleKey" character varying(100) NOT NULL, "isEnabled" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b0d534b6c523b8b1d5e64aa23c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant_custom_domains" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "hostname" character varying(255) NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "verifiedAt" TIMESTAMP WITH TIME ZONE, "verificationToken" character varying(100), "isSslEnabled" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_95f264eb1f0ad62bef534bcb296" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9216a96e8b646f2d51d57559f5" ON "tenant_custom_domains" ("hostname") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."system_notifications_type_enum" AS ENUM('SYSTEM', 'HR', 'FINANCE', 'PROJECT', 'SALES', 'ASSET')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."system_notifications_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "system_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "type" "public"."system_notifications_type_enum" NOT NULL DEFAULT 'SYSTEM', "priority" "public"."system_notifications_priority_enum" NOT NULL DEFAULT 'MEDIUM', "isRead" boolean NOT NULL DEFAULT false, "readAt" TIMESTAMP WITH TIME ZONE, "metadata" jsonb, "actionUrl" character varying(255), CONSTRAINT "PK_2251866d2c48c1ff710e9fd444d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ce0ae77fbe0482f997d3bc7a89" ON "system_notifications" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_53b89c6ec6f21b4ab567d56175" ON "system_notifications" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4ea87d7d65b977b462fe4d81b" ON "system_notifications" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "login_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid NOT NULL, "ipAddress" character varying(45), "userAgent" text, "country" character varying(100), "city" character varying(100), "deviceFingerprint" character varying(255), CONSTRAINT "PK_5cd6102474db62bc181590b9902" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8a71a3a6816848920545d3b3c" ON "login_events" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c92c02daa422fdd25852847cde" ON "login_events" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1fd154de0075f094be611bed07" ON "login_events" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "system_announcements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "startsAt" TIMESTAMP NOT NULL, "endsAt" TIMESTAMP, "targetRoles" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_6cee838ddfb9eacd26af68db531" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3db0953bd2bb3494e7a5d8698b" ON "system_announcements" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_095817fcc336f08bae94476b42" ON "system_announcements" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "date" date NOT NULL, "branchId" uuid, "isRecurring" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c54c400d1c627f5dc3bbb8c2b0" ON "holidays" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_180a93f667b5ee438f2784cacb" ON "holidays" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_field_values" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "definitionId" uuid NOT NULL, "entityName" character varying(100) NOT NULL, "entityId" uuid NOT NULL, "valueString" text, "valueNumber" double precision, "valueBoolean" boolean, "valueDate" date, CONSTRAINT "PK_54ac5f4b6a1d6e65212ebdc222d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_689c22676450e37e5d633bbeb8" ON "custom_field_values" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a1df7655a5d4bdbe9843a55ef2" ON "custom_field_values" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e889e8e3828925b3c3f953fc59" ON "custom_field_values" ("definitionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ec47822494fa0dc81ca3a3d26" ON "custom_field_values" ("entityName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ce714c1458a0309e6f5f474f5" ON "custom_field_values" ("entityId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_definitions_type_enum" AS ENUM('VARCHAR', 'BOOLEAN', 'DATE', 'NUMBER', 'DROPDOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "custom_field_definitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "entityName" character varying(100) NOT NULL, "name" character varying(100) NOT NULL, "key" character varying(100) NOT NULL, "type" "public"."custom_field_definitions_type_enum" NOT NULL, "options" text, "isRequired" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_91f4cf6416f7aeb02c217005cb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e1ce1bf0009d1fa09310cf55c" ON "custom_field_definitions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfb6fc9b53d61579181753facf" ON "custom_field_definitions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "consent_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid NOT NULL, "consentType" character varying(100) NOT NULL, "granted" boolean NOT NULL, "ipAddress" character varying(45), "userAgent" text, CONSTRAINT "PK_33b042da1d1d1745a3f909fee82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2fb987955ae6c298a85edc8200" ON "consent_logs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_00921f877afad929f7a61accff" ON "consent_logs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de9216bb1b30b45bf99cc378ba" ON "consent_logs" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9ca36217dd77a164903cec05e" ON "consent_logs" ("consentType") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auto_number_sequences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "documentType" character varying(50) NOT NULL, "prefix" character varying(20), "suffix" character varying(20), "padding" integer NOT NULL DEFAULT '4', "nextValue" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b9a07b94d7ac48a5aca52682b7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6e3e1efacd742f8e5e4ff6342c" ON "auto_number_sequences" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9924f5ff8e2041054c93c7574b" ON "auto_number_sequences" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ae8b7cced6df997e6921ea2e8" ON "auto_number_sequences" ("documentType") `,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid, "action" character varying(100) NOT NULL, "module" character varying(50) NOT NULL, "description" text NOT NULL, "entityType" character varying(100), "entityId" uuid, "oldValue" jsonb, "newValue" jsonb, "metadata" jsonb, "ipAddress" character varying(45), "userAgent" text, "correlationId" uuid, "durationMs" integer, "signature" text, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f18d459490bb48923b1f40bdb" ON "audit_logs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_898d14750b88319b89b1ab66cd" ON "audit_logs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cfa83f61e4d27a87fcae1e025a" ON "audit_logs" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aca9ec48e47f56efca7d45898d" ON "audit_logs" ("module") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f23279fad63453147a8efb46cf" ON "audit_logs" ("entityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25eac74c764366df85314a08e6" ON "audit_logs" ("correlationId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_workflows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "entityType" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "description" text, CONSTRAINT "PK_f326145fd927565de30b360264b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f446af65cf6e79eba3a7b5358d" ON "approval_workflows" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_433d665ac7b14b0c724f2af6aa" ON "approval_workflows" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."approval_steps_approvertype_enum" AS ENUM('ROLE', 'SPECIFIC_USER', 'MANAGER_OF_CREATOR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "workflowId" uuid NOT NULL, "stepOrder" integer NOT NULL, "approverType" "public"."approval_steps_approvertype_enum" NOT NULL, "approverValue" character varying(100), "amountThreshold" double precision, CONSTRAINT "PK_31089858f2c75f4648107ae5280" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_499f43a6394b32d1ad29bde311" ON "approval_steps" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f65ee3845db76fba9f3b56093" ON "approval_steps" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61e90eb0fc5abc6092a99e468c" ON "approval_steps" ("workflowId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "keyPrefix" character varying(64) NOT NULL, "keyHash" character varying(255) NOT NULL, "scopes" text, "expiresAt" TIMESTAMP, "lastUsedAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_3ee8ea3e49f8f437c17219dad66" UNIQUE ("keyPrefix"), CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ac18429c8d27858d79432e0dd" ON "api_keys" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad466567933bb883b4c3aec6a2" ON "api_keys" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ticket_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticketId" uuid NOT NULL, "senderId" uuid, "isInternal" boolean NOT NULL DEFAULT false, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_37beb692dedf7eccb4e519ccec1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "title" character varying NOT NULL, "description" text, "status" character varying NOT NULL DEFAULT 'OPEN', "priority" character varying NOT NULL DEFAULT 'P3', "category" character varying, "requesterId" uuid NOT NULL, "assigneeId" uuid, "resolvedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ticket_slas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "priority" character varying NOT NULL, "responseTimeMinutes" integer NOT NULL, "resolutionTimeMinutes" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_541a651a87888151a13f7c3ffd6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "kb_articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "category" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'DRAFT', "isInternal" boolean NOT NULL DEFAULT false, "isPublic" boolean NOT NULL DEFAULT false, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ffb01b096d72350aa97d1d0cb14" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "industry" character varying(100), "website" character varying(255), "annualRevenue" numeric(18,2), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c1cce1e0d9cc2557038a7f639d" ON "accounts" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98951e85fef4028232197b1532" ON "accounts" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "accountId" uuid, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255), "phone" character varying(20), "jobTitle" character varying(100), "isPrimary" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71ec7d68cfafa5f3d93c959b80" ON "contacts" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90e6f5efbcdbeb40f13c962fef" ON "contacts" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."deals_stage_enum" AS ENUM('PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."deals_status_enum" AS ENUM('OPEN', 'WON', 'LOST')`,
    );
    await queryRunner.query(
      `CREATE TABLE "deals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(200) NOT NULL, "customerName" character varying(150), "value" numeric(14,2) NOT NULL DEFAULT '0', "stage" "public"."deals_stage_enum" NOT NULL DEFAULT 'PROSPECTING', "status" "public"."deals_status_enum" NOT NULL DEFAULT 'OPEN', "probability" integer NOT NULL DEFAULT '0', "expectedCloseDate" date, "assignedTo" uuid, "notes" text, "accountId" uuid, "contactId" uuid, CONSTRAINT "PK_8c66f03b250f613ff8615940b4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d40aeaababdbc39be4820cd1f5" ON "deals" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d4825a9c92ddaa898a33eee0c" ON "deals" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."quotations_status_enum" AS ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "quotations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "quotationNumber" character varying(50) NOT NULL, "accountId" uuid, "contactId" uuid, "dealId" uuid, "version" integer NOT NULL DEFAULT '1', "status" "public"."quotations_status_enum" NOT NULL DEFAULT 'DRAFT', "issueDate" TIMESTAMP WITH TIME ZONE NOT NULL, "validUntil" TIMESTAMP WITH TIME ZONE NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', CONSTRAINT "UQ_1abd99974f3059c04df9104a764" UNIQUE ("quotationNumber"), CONSTRAINT "PK_6c00eb8ba181f28c21ffba7ecb1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88a5e9c0b63561bfe2a555dee7" ON "quotations" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_865884db45363ea8996ef37dc4" ON "quotations" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "quotation_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "quotationId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "quantity" numeric(12,2) NOT NULL, "unitPrice" numeric(12,2) NOT NULL, "discountPercent" numeric(5,2) NOT NULL DEFAULT '0', "taxPercent" numeric(5,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_facdcaf4d7c7974c5d9adb63c23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e71085700a5ee6325d608cbcb" ON "quotation_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0115becafaa46b2137baf68aab" ON "quotation_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sales_orders_status_enum" AS ENUM('DRAFT', 'CONFIRMED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'INVOICED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sales_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "soNumber" character varying(50) NOT NULL, "quotationId" uuid, "accountId" uuid NOT NULL, "status" "public"."sales_orders_status_enum" NOT NULL DEFAULT 'DRAFT', "orderDate" TIMESTAMP WITH TIME ZONE NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', CONSTRAINT "UQ_cc16f3d6657ca5790269f7a3673" UNIQUE ("soNumber"), CONSTRAINT "PK_5328297e067ca929fbe7cf989dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77e3868b735c09c41f48951170" ON "sales_orders" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f103cc3bf77af962cd91ab136" ON "sales_orders" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sales_order_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "salesOrderId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "quantity" numeric(12,2) NOT NULL, "unitPrice" numeric(12,2) NOT NULL, "discountPercent" numeric(5,2) NOT NULL DEFAULT '0', "taxPercent" numeric(5,2) NOT NULL DEFAULT '0', "deliveredQuantity" numeric(12,2) NOT NULL DEFAULT '0', "invoicedQuantity" numeric(12,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_91a9fd0ffdb8572374cf89df4da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe460d031e961e9e3801ed0ed9" ON "sales_order_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4c0fa0f9c66336246fea67d47" ON "sales_order_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pricelists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "isActive" boolean NOT NULL DEFAULT true, "validFrom" TIMESTAMP WITH TIME ZONE, "validTo" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f6086a54a739eb1b8cd6cf352f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_092826fc336a96e64ae88edf67" ON "pricelists" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27b9820d1ddf1db12263322204" ON "pricelists" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pricelist_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "pricelistId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "overridePrice" numeric(12,2), "discountPercent" numeric(5,2), CONSTRAINT "PK_99e33f5fbff8c40d378e7e968f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77507341767f09008121e368cd" ON "pricelist_items" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8de66052a251a49afa3fda213d" ON "pricelist_items" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leads_status_enum" AS ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "company" character varying(150), "email" character varying(255), "phone" character varying(20), "source" character varying(100), "status" "public"."leads_status_enum" NOT NULL DEFAULT 'NEW', "estimatedValue" numeric(14,2), "assignedTo" uuid, "notes" text, "score" integer NOT NULL DEFAULT '0', "sourceDetails" jsonb, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2440046dd05066e882bb68a780" ON "leads" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0ed38c8f82903c6b83c7922f5" ON "leads" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."delivery_orders_status_enum" AS ENUM('DRAFT', 'SHIPPED', 'DELIVERED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "delivery_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "doNumber" character varying(50) NOT NULL, "salesOrderId" uuid NOT NULL, "status" "public"."delivery_orders_status_enum" NOT NULL DEFAULT 'DRAFT', "deliveryDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_533757e5d4420ac6abfc11547b4" UNIQUE ("doNumber"), CONSTRAINT "PK_29e637736a0b5f36946edec3650" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b958c31853c1981250a9ea21a" ON "delivery_orders" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d4720822a8b381fd6d0ef5a61" ON "delivery_orders" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "delivery_order_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "deliveryOrderId" uuid NOT NULL, "soLineId" uuid NOT NULL, "productId" uuid NOT NULL, "quantity" numeric(12,2) NOT NULL, CONSTRAINT "PK_68a0446cbfa360328c2e06eb55d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2738562f9a9b3d82cba3ca59c5" ON "delivery_order_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_437f8bf0f82751d94de452a748" ON "delivery_order_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_logs_entitytype_enum" AS ENUM('LEAD', 'CONTACT', 'DEAL', 'ACCOUNT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."activity_logs_type_enum" AS ENUM('CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK')`,
    );
    await queryRunner.query(
      `CREATE TABLE "activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "entityType" "public"."activity_logs_entitytype_enum" NOT NULL, "entityId" uuid NOT NULL, "type" "public"."activity_logs_type_enum" NOT NULL, "subject" character varying(200) NOT NULL, "description" text, "activityDate" TIMESTAMP WITH TIME ZONE NOT NULL, "performedById" uuid NOT NULL, "metadata" jsonb, CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a31d59aa71dfdbfa616615863" ON "activity_logs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7115e4f1e1d2105335d9b9a6a3" ON "activity_logs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "report_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" text, "module" character varying(50) NOT NULL, "category" character varying(50), "entityName" character varying(100) NOT NULL, "config" jsonb NOT NULL, "createdByUserId" uuid NOT NULL, "isPublic" boolean NOT NULL DEFAULT false, "isShared" boolean NOT NULL DEFAULT false, "rolesAllowed" text, CONSTRAINT "PK_f85e16e6beea41a2b3a3350b84e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_320cd5b1ab5da54b13b8007192" ON "report_templates" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a8e0c3147366c89d1176e7f2a" ON "report_templates" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "report_schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "templateId" uuid NOT NULL, "cronExpression" character varying(100) NOT NULL, "recipients" text NOT NULL, "format" character varying(20) NOT NULL DEFAULT 'PDF', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_603f9cdaaf4c1193d7399c1e79c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c986cfd5db47ed85be1e4828b" ON "report_schedules" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c655e458011fd281b4c5de669a" ON "report_schedules" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a17063e48b705d8fa677bdd849" ON "report_schedules" ("templateId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pinned_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid NOT NULL, "templateId" uuid NOT NULL, CONSTRAINT "PK_7f74585740c1e667fbc68d54c8a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e41c68e3ffb7adc803eb812ea" ON "pinned_reports" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_134c58b4effb3ab4bee36d4ef6" ON "pinned_reports" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b6454119157bcbbce618c2e093" ON "pinned_reports" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cbb2b8ead8aafe4bd39e0d2b5f" ON "pinned_reports" ("templateId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "designations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(100) NOT NULL, "level" integer NOT NULL DEFAULT '1', "description" text, "minSalary" numeric(12,2), "maxSalary" numeric(12,2), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_0b1bfb4e00d37970d8873de885f" UNIQUE ("title"), CONSTRAINT "PK_a0f024b99b1491a03fc421858ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_43d6a115dd09868d51494f7545" ON "designations" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_44a7da6197dad533a14c4c4c47" ON "designations" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "grades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(50) NOT NULL, "level" integer NOT NULL DEFAULT '1', "minSalary" numeric(12,2) NOT NULL DEFAULT '0', "maxSalary" numeric(12,2) NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e71c6cb25c8ed8d87058295023b" UNIQUE ("name"), CONSTRAINT "PK_4740fb6f5df2505a48649f1687b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ada9b9aca4f2ba02b6a8a90dd" ON "grades" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bec62da550338b8d60e9c8a072" ON "grades" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."performance_reviews_type_enum" AS ENUM('OKR', 'THREE_SIXTY', 'PIP')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."performance_reviews_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'ABANDONED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "performance_reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "type" "public"."performance_reviews_type_enum" NOT NULL DEFAULT 'OKR', "objective" character varying(500) NOT NULL, "period" character varying(20) NOT NULL, "status" "public"."performance_reviews_status_enum" NOT NULL DEFAULT 'ACTIVE', "progress" numeric(5,2) NOT NULL DEFAULT '0', "selfRating" numeric(3,2), "peerRating" numeric(3,2), "managerRating" numeric(3,2), "documentationUrl" character varying(500), CONSTRAINT "PK_46f39f620497eb3de4fe6dafdef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b9a0441863f21815d352c42b77" ON "performance_reviews" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_927535602e41d05c27d2480de9" ON "performance_reviews" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "key_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "performanceReviewId" uuid NOT NULL, "description" character varying(500) NOT NULL, "targetValue" numeric(12,2) NOT NULL, "currentValue" numeric(12,2) NOT NULL DEFAULT '0', "weight" numeric(5,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_43ca92a80903403806ecf974392" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2cb364072d8ba704eeee38cc36" ON "key_results" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_34aef196f64196ef337981a768" ON "key_results" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."salary_history_reason_enum" AS ENUM('ANNUAL_REVISION', 'PROMOTION', 'PERFORMANCE_BONUS', 'INITIAL_OFFER', 'CORRECTION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "previousSalary" numeric(12,2) NOT NULL, "newSalary" numeric(12,2) NOT NULL, "effectiveDate" date NOT NULL, "reason" "public"."salary_history_reason_enum" NOT NULL DEFAULT 'ANNUAL_REVISION', "comments" character varying(500), "approvedById" uuid, "isProcessedInPayroll" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_796fc91fc02d8e1b35a08c3de32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0ef7f5060fc7c9f8eec0fa460f" ON "salary_history" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58f07ee38f7163e637be553646" ON "salary_history" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "training_courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "description" text, "category" character varying(100) NOT NULL, "provider" character varying(255), "durationHours" integer, "cost" numeric(10,2) NOT NULL DEFAULT '0', "link" character varying(500), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_13bbeecb2ed8a1f45be3c02d68e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e02bec61f51859b88d42744145" ON "training_courses" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9192bddaf85e13eb854f5f3946" ON "training_courses" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."trainings_status_enum" AS ENUM('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "trainings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "courseId" uuid, "title" character varying(255) NOT NULL, "description" text, "category" character varying(100), "durationHours" integer, "provider" character varying(255), "completionDate" date, "expiryDate" date, "status" "public"."trainings_status_enum" NOT NULL DEFAULT 'ENROLLED', "certificateUrl" character varying(500), CONSTRAINT "PK_b67237502b175163e47dc85018d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03534838c8b2a401abe3611016" ON "trainings" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd80e1f4c5cc9301d1a7a65434" ON "trainings" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "skill_catalog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "category" character varying(100) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_1a2e155daca1357d313d5bf27d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a94ef7659b02da50bb09e64e3d" ON "skill_catalog" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2488e9151e31a8be8aee2fe16c" ON "skill_catalog" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "catalogId" uuid, "skillName" character varying(100) NOT NULL, "proficiency" integer NOT NULL DEFAULT '1', "lastAssessed" date, "assessedBy" character varying(255), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f870d09eaf096c4aac16464342" ON "skills" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9dea84eea18d3343f6873d892c" ON "skills" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employment_history_event_enum" AS ENUM('HIRED', 'REHIRED', 'PROMOTED', 'TRANSFERRED', 'DESIGNATION_CHANGE', 'SALARY_REVISION', 'PROBATION_COMPLETED', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'EXITED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employment_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "event" "public"."employment_history_event_enum" NOT NULL, "effectiveDate" date NOT NULL, "departmentId" uuid, "designationId" uuid, "comments" character varying(500), CONSTRAINT "PK_27b0c31619fc4a20f21a6d776a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_01608a2a7c5d120b85568a30bb" ON "employment_history" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7030ed2c09624fc10881a52eda" ON "employment_history" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shifts_type_enum" AS ENUM('MORNING', 'EVENING', 'NIGHT', 'ROTATING')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "type" "public"."shifts_type_enum" NOT NULL DEFAULT 'MORNING', "gracePeriodMinutes" integer NOT NULL DEFAULT '15', "halfDayCutoffTime" TIME, "earlyDepartureAllowance" integer NOT NULL DEFAULT '0', "breakTimeMinutes" integer NOT NULL DEFAULT '60', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90413bab4120ede23bb4716877" ON "shifts" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_653511fcb39d218b7854fda07b" ON "shifts" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_employmenttype_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'PROBATION')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employees_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED', 'RETIRED', 'PROBATION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" character varying(20) NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20), "gender" "public"."employees_gender_enum", "dateOfBirth" date, "joinDate" date NOT NULL, "endDate" date, "employmentType" "public"."employees_employmenttype_enum" NOT NULL DEFAULT 'FULL_TIME', "status" "public"."employees_status_enum" NOT NULL DEFAULT 'ACTIVE', "salary" character varying(255) NOT NULL DEFAULT '0', "nationalId" character varying(255), "taxIdentificationNumber" character varying(255), "probationEndDate" date, "address" character varying(255), "city" character varying(100), "country" character varying(100), "avatarUrl" character varying(500), "contractUrl" character varying(500), "contractExpiryDate" date, "emergencyContactName" character varying(100), "emergencyContactPhone" character varying(20), "emergencyContactRelation" character varying(100), "bankName" character varying(100), "bankBranch" character varying(100), "accountNumber" character varying(255), "routingNumber" character varying(255), "isSalaryOnHold" boolean NOT NULL DEFAULT false, "preferredCurrency" character varying(10), "departmentId" uuid, "branchId" uuid, "designationId" uuid, "gradeId" uuid, "managerId" uuid, "shiftId" uuid, "userId" uuid, CONSTRAINT "UQ_fa00ce161b51b02fdf992ea9528" UNIQUE ("employeeId"), CONSTRAINT "UQ_765bc1ac8967533a04c74a9f6af" UNIQUE ("email"), CONSTRAINT "UQ_737991e10350d9626f592894cef" UNIQUE ("userId"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_588d18aeef0504067e40c68278" ON "employees" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_570fb0c72ffd2f871f4c9c2b45" ON "employees" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_765bc1ac8967533a04c74a9f6a" ON "employees" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(20) NOT NULL, "description" text, "headId" uuid, "costCenter" character varying(50), "glAccountId" uuid, "isActive" boolean NOT NULL DEFAULT true, "parentId" uuid, CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "UQ_91fddbe23e927e1e525c152baa3" UNIQUE ("code"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_146fd7019eea73f8ee7bbb52d4" ON "departments" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e01980924b4eff539fab6b328d" ON "departments" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "candidates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20), "resumeUrl" character varying(500), "source" character varying(100), "referredById" uuid, "referralBonus" numeric(10,2) NOT NULL DEFAULT '0', "skills" text array, CONSTRAINT "UQ_c0de76a18c2a505ceb016746822" UNIQUE ("email"), CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f05c4cdcdc57d7d3cb0ef129d3" ON "candidates" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8c78ca63bf53015b496ea93606" ON "candidates" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."interviews_status_enum" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "applicationId" uuid NOT NULL, "interviewerIds" uuid array NOT NULL, "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endTime" TIMESTAMP WITH TIME ZONE NOT NULL, "location" character varying(255), "stage" character varying(50), "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'SCHEDULED', "feedback" text, "rating" integer, "scorecard" jsonb, CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9fe747f64e2102d4e751b2af71" ON "interviews" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d992b2ccab4060a96680553e9" ON "interviews" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offer_letters_status_enum" AS ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "offer_letters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "applicationId" uuid NOT NULL, "baseSalary" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "joiningDate" date NOT NULL, "expiryDate" date NOT NULL, "status" "public"."offer_letters_status_enum" NOT NULL DEFAULT 'DRAFT', "signedUrl" character varying(500), CONSTRAINT "PK_27d985b2cd0be25161537d11cff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c9835adc65f9cb17b41b4eeab" ON "offer_letters" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17377f751da5480864381d56c1" ON "offer_letters" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."applications_status_enum" AS ENUM('APPLIED', 'SCREENED', 'PHONE_SCREEN', 'INTERVIEW_1', 'INTERVIEW_2', 'TECHNICAL_TEST', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "jobId" uuid NOT NULL, "candidateId" uuid NOT NULL, "status" "public"."applications_status_enum" NOT NULL DEFAULT 'APPLIED', "appliedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "notes" text, "timeline" jsonb, CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06b5376fd696c7bffaaa6109fc" ON "applications" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6d341fb81d849455ed1bf4cb0" ON "applications" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_requisitions_employmenttype_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_requisitions_status_enum" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'OPEN', 'PAUSED', 'CLOSED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_requisitions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "description" text NOT NULL, "departmentId" uuid NOT NULL, "designationId" uuid NOT NULL, "location" character varying(255) NOT NULL, "employmentType" "public"."job_requisitions_employmenttype_enum" NOT NULL, "vacancies" integer NOT NULL DEFAULT '1', "minSalary" numeric(12,2), "maxSalary" numeric(12,2), "currency" character varying(10) NOT NULL DEFAULT 'USD', "status" "public"."job_requisitions_status_enum" NOT NULL DEFAULT 'DRAFT', "approvalChain" jsonb, "applicationFormConfig" jsonb, CONSTRAINT "PK_2c2781824c8900825c9c88e9592" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a57e9dc6a87e59ff40717ca2bb" ON "job_requisitions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9de9befd2fd92077e68be94bec" ON "job_requisitions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."onboarding_templates_employmenttype_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "onboarding_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" text, "employmentType" "public"."onboarding_templates_employmenttype_enum" NOT NULL DEFAULT 'FULL_TIME', "tasks" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3d92c823abe29a6a0ad7ac25632" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d37f740a9bffa98e1fa6092136" ON "onboarding_templates" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1bd644475502a17c42538f2d51" ON "onboarding_templates" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."onboarding_checklists_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "onboarding_checklists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "candidateId" uuid NOT NULL, "templateId" uuid, "tasks" jsonb NOT NULL DEFAULT '[]', "documentMetadata" jsonb, "progress" integer NOT NULL DEFAULT '0', "status" "public"."onboarding_checklists_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "buddyId" uuid, "assignedAssetIds" uuid array NOT NULL DEFAULT '{}', "startDate" TIMESTAMP, CONSTRAINT "PK_a49c2a1d9f583923d2cab273023" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d2bcca3d7deb5d8cde7f3f181" ON "onboarding_checklists" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c3fc8c7b8f26377f293d948eb" ON "onboarding_checklists" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."timesheets_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "timesheets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid NOT NULL, "managerId" uuid, "periodStartDate" TIMESTAMP WITH TIME ZONE NOT NULL, "periodEndDate" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."timesheets_status_enum" NOT NULL DEFAULT 'DRAFT', "totalHours" numeric(10,2) NOT NULL DEFAULT '0', "rejectionReason" text, CONSTRAINT "PK_1dc280b68c9353ecce41a34be71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ddac109473cc2631c5752d0a05" ON "timesheets" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82c239772341bb896cd00f9edd" ON "timesheets" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "milestones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "projectId" uuid NOT NULL, "title" character varying(255) NOT NULL, "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL, "completionPercentage" numeric(5,2) NOT NULL DEFAULT '0', "predecessorId" uuid, CONSTRAINT "PK_0bdbfe399c777a6a8520ff902d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_842f056598c175ea4ef4f8ef2a" ON "milestones" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65c3b3118a5d0622bbe9caec8f" ON "milestones" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."projects_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "client" character varying(150), "type" character varying(100), "description" text, "status" "public"."projects_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "startDate" date, "endDate" date, "progress" integer NOT NULL DEFAULT '0', "budgetCost" numeric(14,2), "budgetTime" numeric(14,2), "currency" character varying(10) NOT NULL DEFAULT 'USD', "managerId" uuid, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7393a03ef67e2ea91b81faa95d" ON "projects" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_212a881c3793c0716030315e9e" ON "projects" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'BLOCKED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "description" text, "projectId" uuid NOT NULL, "assignees" jsonb, "isBillable" boolean NOT NULL DEFAULT true, "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'MEDIUM', "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "dueDate" date, "estimatedHours" integer, "loggedHours" integer NOT NULL DEFAULT '0', "parentId" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93edccfc42408754c4b5957105" ON "tasks" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20d090a7b83189b4cddb3e3d0e" ON "tasks" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "time_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "taskId" uuid NOT NULL, "userId" uuid NOT NULL, "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endTime" TIMESTAMP WITH TIME ZONE, "durationHours" numeric(10,2), "isBillable" boolean NOT NULL DEFAULT true, "notes" text, "timesheetId" uuid, CONSTRAINT "PK_8657e6aaa7035da9fc7309f385a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d9bdde8d29a6fd880ac59c1ae" ON "time_logs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3537e1be00780488c17f1e9b85" ON "time_logs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "description" text, "structure" jsonb NOT NULL, CONSTRAINT "PK_8ad4477f22e9b6e0880f1053449" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_84931c86d4788733bfc797caf3" ON "project_templates" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b746f5099d59bee9e702552d0a" ON "project_templates" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_risks_probability_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_risks_impact_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'SEVERE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_risks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "projectId" uuid NOT NULL, "description" character varying(500) NOT NULL, "probability" "public"."project_risks_probability_enum" NOT NULL, "impact" "public"."project_risks_impact_enum" NOT NULL, "mitigationPlan" text, "ownerId" uuid, CONSTRAINT "PK_6a3d2c8ce5a1d7e807acb7a320e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_873d5ab2ea2525c9b5d0588b4c" ON "project_risks" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c493bfe11259b1bedbd33ceade" ON "project_risks" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."change_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "change_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "projectId" uuid NOT NULL, "title" character varying(200) NOT NULL, "description" text NOT NULL, "impactAnalysis" text, "status" "public"."change_requests_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_e3f28255a6e818820f18f6d5956" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_772bdc15815215f6de07acb7ef" ON "change_requests" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92928c32c4decb05673e345d4f" ON "change_requests" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendors_kycstatus_enum" AS ENUM('PENDING', 'VERIFIED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendors_category_enum" AS ENUM('PREFERRED', 'BLACKLISTED', 'APPROVED', 'STANDARD')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendors_approvalstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "code" character varying(50) NOT NULL, "contactPerson" character varying(100), "email" character varying(100), "phone" character varying(20), "address" text, "currency" character varying(10) NOT NULL DEFAULT 'USD', "paymentTerms" character varying(200), "creditLimit" numeric(12,2) NOT NULL DEFAULT '0', "kycStatus" "public"."vendors_kycstatus_enum" NOT NULL DEFAULT 'PENDING', "taxId" character varying(50), "category" "public"."vendors_category_enum" NOT NULL DEFAULT 'STANDARD', "approvalStatus" "public"."vendors_approvalstatus_enum" NOT NULL DEFAULT 'PENDING', "bankDetails" jsonb, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_1127015587ca66797a569381717" UNIQUE ("code"), CONSTRAINT "PK_9c956c9797edfae5c6ddacc4e6e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b362795545b91a886939d70bea" ON "vendors" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ea83897560422b86c2035c518d" ON "vendors" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_evaluations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "vendorId" uuid NOT NULL, "evaluatorId" uuid NOT NULL, "evaluationDate" TIMESTAMP WITH TIME ZONE NOT NULL, "deliveryScore" integer NOT NULL, "qualityScore" integer NOT NULL, "pricingScore" integer NOT NULL, "responsivenessScore" integer NOT NULL, "notes" text, CONSTRAINT "PK_98c4152571558d105fdcbbc5015" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_594509ecef7e59bb099064bab5" ON "vendor_evaluations" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0135c067b07612af838a214432" ON "vendor_evaluations" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rfqs_status_enum" AS ENUM('DRAFT', 'SENT', 'RECEIVED', 'CLOSED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rfqs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "rfqNumber" character varying(50) NOT NULL, "status" "public"."rfqs_status_enum" NOT NULL DEFAULT 'DRAFT', "deadline" TIMESTAMP WITH TIME ZONE NOT NULL, "notes" text, CONSTRAINT "UQ_1f87b36a05a4c5d113944e67a6c" UNIQUE ("rfqNumber"), CONSTRAINT "PK_c8b7481584218bdee534e5fc436" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31b0e677d1904b7b9a05e13096" ON "rfqs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_692518395c8a81d6f0c8b80f48" ON "rfqs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_quotes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "rfqId" uuid NOT NULL, "vendorId" uuid NOT NULL, "quoteNumber" character varying(50) NOT NULL, "quoteDate" TIMESTAMP WITH TIME ZONE NOT NULL, "validUntil" TIMESTAMP WITH TIME ZONE, "currency" character varying(10) NOT NULL DEFAULT 'USD', "totalAmount" numeric(12,2) NOT NULL, "lines" jsonb NOT NULL, CONSTRAINT "PK_8a9817ee492a9add98fa1956c86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_236caa44b8850e80897299c242" ON "vendor_quotes" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7356cedb29360573544b67414e" ON "vendor_quotes" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "productId" uuid NOT NULL, "sku" character varying(50) NOT NULL, "name" character varying(200) NOT NULL, "attributeValues" jsonb, "priceAdjustment" numeric(12,2) NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_553196ea54b383f352401962af" ON "product_variants" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3f9e26be7d50edd427c10c066" ON "product_variants" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "uom_conversions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "uomGroupId" uuid NOT NULL, "fromUom" character varying(20) NOT NULL, "toUom" character varying(20) NOT NULL, "conversionFactor" numeric(12,4) NOT NULL, CONSTRAINT "PK_46a2fed297f3ccdda8ba1c2ea28" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0db848b27dce0f6e1cfb631149" ON "uom_conversions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a649b4a97fc5d4dd61ebf89f2" ON "uom_conversions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "uom_groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_8c6dfbe9d98c00b3648cb3e5f20" UNIQUE ("name"), CONSTRAINT "PK_21e7d90e06d4a311d705b9953db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_733a70ae1715444ea650e8dbe9" ON "uom_groups" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c28263b2cfd3c40f088fba4a61" ON "uom_groups" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_valuationmethod_enum" AS ENUM('FIFO', 'LIFO', 'WEIGHTED_AVERAGE', 'FEFO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "sku" character varying(50) NOT NULL, "name" character varying(200) NOT NULL, "barcode" character varying(100), "description" text, "category" character varying(100), "uom" character varying(20) NOT NULL DEFAULT 'PCS', "basePrice" numeric(12,2) NOT NULL DEFAULT '0', "reorderPoint" integer NOT NULL DEFAULT '0', "minStockLevel" integer NOT NULL DEFAULT '0', "maxStockLevel" integer NOT NULL DEFAULT '0', "allowNegativeStock" boolean NOT NULL DEFAULT false, "taxClassId" uuid, "status" "public"."products_status_enum" NOT NULL DEFAULT 'ACTIVE', "valuationMethod" "public"."products_valuationmethod_enum" NOT NULL DEFAULT 'FIFO', "imageUrl" character varying(500), "uomGroupId" uuid, CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c365ebf78f0e8a6d9e4827ea7" ON "products" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fab7980dee7f667919aa5e635" ON "products" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_orders_status_enum" AS ENUM('DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "purchase_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "poNumber" character varying(50) NOT NULL, "vendorId" uuid NOT NULL, "status" "public"."purchase_orders_status_enum" NOT NULL DEFAULT 'DRAFT', "orderDate" TIMESTAMP WITH TIME ZONE NOT NULL, "expectedDeliveryDate" TIMESTAMP WITH TIME ZONE, "currency" character varying(10) NOT NULL DEFAULT 'USD', "subTotal" numeric(12,2) NOT NULL, "taxTotal" numeric(12,2) NOT NULL DEFAULT '0', "discountTotal" numeric(12,2) NOT NULL DEFAULT '0', "grandTotal" numeric(12,2) NOT NULL, "paymentTerms" character varying(200), "shippingAddress" text, "notes" text, "cancellationReason" character varying(255), "version" integer NOT NULL DEFAULT '1', "history" jsonb, CONSTRAINT "UQ_2e0fc7a6605393a9bd691cdcebe" UNIQUE ("poNumber"), CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_237678c98436e0abb48b3060c8" ON "purchase_orders" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1230ebe7ada6874d51ae7cc7e9" ON "purchase_orders" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "purchase_order_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "purchaseOrderId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "quantity" numeric(12,2) NOT NULL, "unitCost" numeric(12,2) NOT NULL, "taxAmount" numeric(12,2) NOT NULL DEFAULT '0', "discountAmount" numeric(12,2) NOT NULL DEFAULT '0', "totalAmount" numeric(12,2) NOT NULL, "receivedQuantity" numeric(12,2) NOT NULL DEFAULT '0', "cancelledQuantity" numeric(12,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_34a2082d2abb10c5d8713bc19b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c07c8a298555beb9a5064d53da" ON "purchase_order_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0baf7a7704bdcfe35a6fe05558" ON "purchase_order_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."grns_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "grns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "grnNumber" character varying(50) NOT NULL, "poId" uuid NOT NULL, "receivedDate" TIMESTAMP WITH TIME ZONE NOT NULL, "receivedById" uuid NOT NULL, "status" "public"."grns_status_enum" NOT NULL DEFAULT 'PENDING', "notes" text, CONSTRAINT "UQ_b5c65485dd1d48eaac595b1c58a" UNIQUE ("grnNumber"), CONSTRAINT "PK_eef22b363aa66336dca8a5ce961" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d7e1aca3b12d4aaf8624b11da" ON "grns" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da5e636533dd5e2ac0b8071aeb" ON "grns" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "grn_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "grnId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "poLineId" uuid NOT NULL, "receivedQuantity" numeric(12,2) NOT NULL, "acceptedQuantity" numeric(12,2) NOT NULL DEFAULT '0', "rejectedQuantity" numeric(12,2) NOT NULL DEFAULT '0', "unitCost" numeric(12,2), "batchNumber" character varying(100), "expiryDate" TIMESTAMP WITH TIME ZONE, "warehouseId" uuid NOT NULL, "binId" uuid, CONSTRAINT "PK_9716c2ffa1be55de5558fccd5a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25489b3b44a530d3eb05e25573" ON "grn_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0efc076ac74a997630196b8b6b" ON "grn_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_bills_status_enum" AS ENUM('DRAFT', 'PENDING_PAYMENT', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_bills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "vendorId" uuid NOT NULL, "poId" uuid NOT NULL, "grnId" uuid, "billNumber" character varying(100) NOT NULL, "billDate" TIMESTAMP WITH TIME ZONE NOT NULL, "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "totalAmount" numeric(12,2) NOT NULL, "status" "public"."vendor_bills_status_enum" NOT NULL DEFAULT 'DRAFT', CONSTRAINT "PK_7955dfefe45ac3ccb21dbb09318" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ce0fd3868fcb4f4296a3435e3e" ON "vendor_bills" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f9489e32690edb08c2bf7cc074" ON "vendor_bills" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_requests_status_enum" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CONVERTED_TO_RFQ', 'CONVERTED_TO_PO', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "purchase_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "prNumber" character varying(50) NOT NULL, "departmentId" uuid NOT NULL, "requestedById" uuid NOT NULL, "status" "public"."purchase_requests_status_enum" NOT NULL DEFAULT 'DRAFT', "totalEstimatedCost" numeric(12,2) NOT NULL DEFAULT '0', "notes" text, CONSTRAINT "UQ_29dbf2268db3c637004746e3cb5" UNIQUE ("prNumber"), CONSTRAINT "PK_f3c5a8ff7bd4338f4c860925c8f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd9d53fb1686e85de185f247c7" ON "purchase_requests" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6b7927b20b0a86c385a0ca1dc6" ON "purchase_requests" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "purchase_request_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "purchaseRequestId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "quantity" numeric(12,2) NOT NULL, "estimatedUnitCost" numeric(12,2), "requiredDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_4ff9bbf89a697089f83b8922777" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e8279642c07dc55c737d95057" ON "purchase_request_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c64a35cce3a3a5e0fbf9f9c8c5" ON "purchase_request_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "debit_notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "vendorId" uuid NOT NULL, "grnId" uuid, "poId" uuid, "amount" numeric(12,2) NOT NULL, "reason" text NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e1f73e65add1542776ce7087fae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65ea41ec57af9303a0b59b5715" ON "debit_notes" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd76b3e97d644800d554f44a61" ON "debit_notes" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_matrices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "departmentId" uuid, "minAmount" numeric(12,2) NOT NULL DEFAULT '0', "maxAmount" numeric(12,2), "requiredRole" character varying(50) NOT NULL, CONSTRAINT "PK_2f345a65326a43208b0e48b700e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_772ee6e70f320ca44803e673b4" ON "approval_matrices" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd100f4aa220f7b6acb2f30a94" ON "approval_matrices" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pos_sessions_status_enum" AS ENUM('OPEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pos_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "cashierId" uuid NOT NULL, "openedAt" TIMESTAMP NOT NULL, "closedAt" TIMESTAMP, "openingFloat" numeric(12,2) NOT NULL, "closingCash" numeric(12,2), "status" "public"."pos_sessions_status_enum" NOT NULL DEFAULT 'OPEN', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ea6a8d8a95103f03518a0f72c45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_configurations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "fiscalYear" character varying(10) NOT NULL, "taxExemptThreshold" numeric(12,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_2e6f95685da5d439ae3a583d270" UNIQUE ("fiscalYear"), CONSTRAINT "PK_bb509e47d5b1be419b248299b09" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_696d1233169ba26d82898b874a" ON "tax_configurations" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_df85f97c8b2d54f42dddd3f7a0" ON "tax_configurations" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_brackets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "taxConfigurationId" uuid NOT NULL, "upperLimit" numeric(12,2), "rate" numeric(5,2) NOT NULL, CONSTRAINT "PK_3dd19903d74de7bcf1361eb0d5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f2c1816a1f0f59f2be11221df6" ON "tax_brackets" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9dcd2f3e541400516b9fde9324" ON "tax_brackets" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_structures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255), "isDefault" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_1800f745fd1ebe08981cd422acd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fed7166a2462f813fc0ddc77f3" ON "salary_structures" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9b5f08b63acec4707f95ace076" ON "salary_structures" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."salary_structure_components_type_enum" AS ENUM('EARNING', 'DEDUCTION', 'STATUTORY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."salary_structure_components_amounttype_enum" AS ENUM('FIXED', 'PERCENTAGE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_structure_components" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "salaryStructureId" uuid NOT NULL, "name" character varying(100) NOT NULL, "type" "public"."salary_structure_components_type_enum" NOT NULL, "amountType" "public"."salary_structure_components_amounttype_enum" NOT NULL, "value" numeric(12,2) NOT NULL, "isTaxable" boolean NOT NULL DEFAULT true, "dependsOn" character varying(50), CONSTRAINT "PK_85e966de274177e2f1984340562" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_356b50f7fa9976bd44c7596079" ON "salary_structure_components" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5e027c382da6175c4d6634283d" ON "salary_structure_components" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_salary_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "salaryStructureId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_225f5e5255288ec53e58992b86c" UNIQUE ("employeeId"), CONSTRAINT "PK_518ac2e5967fa9e05e8f0335baf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3caa2e877e4a7f80a8baa1a33c" ON "employee_salary_assignments" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dabad418a48107967ef6437555" ON "employee_salary_assignments" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pos_orders_paymentmethod_enum" AS ENUM('CASH', 'CARD', 'MOBILE', 'SPLIT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pos_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "sessionId" uuid NOT NULL, "totalAmount" numeric(12,2) NOT NULL, "paymentMethod" "public"."pos_orders_paymentmethod_enum" NOT NULL, "amountTendered" numeric(12,2) NOT NULL, "changeDue" numeric(12,2) NOT NULL, "items" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fe63b2bc474b2dc257089d09485" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payroll_runs_status_enum" AS ENUM('DRAFT', 'REVIEW', 'APPROVED', 'PROCESSING', 'PROCESSED', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payroll_runs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "runId" character varying(30) NOT NULL, "period" character varying(20) NOT NULL, "payDate" date, "employeeCount" integer NOT NULL DEFAULT '0', "totalGross" numeric(14,2) NOT NULL DEFAULT '0', "totalDeductions" numeric(14,2) NOT NULL DEFAULT '0', "totalNet" numeric(14,2) NOT NULL DEFAULT '0', "status" "public"."payroll_runs_status_enum" NOT NULL DEFAULT 'DRAFT', "processedAt" TIMESTAMP, "processedById" uuid, CONSTRAINT "UQ_f6408873913b658363441c998eb" UNIQUE ("runId"), CONSTRAINT "PK_6049f42c972640c0eb99ba8035e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90dca85e9c4fbf1363e6732386" ON "payroll_runs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_26c55b8bb2199316450555859d" ON "payroll_runs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "payslips" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "payrollRunId" uuid NOT NULL, "employeeId" uuid NOT NULL, "grossPay" numeric(12,2) NOT NULL DEFAULT '0', "netPay" numeric(12,2) NOT NULL DEFAULT '0', "totalDeductions" numeric(12,2) NOT NULL DEFAULT '0', "employerPfContribution" numeric(12,2) NOT NULL DEFAULT '0', "payoutCurrency" character varying(10), "exchangeRate" numeric(10,6) NOT NULL DEFAULT '1', "items" jsonb NOT NULL DEFAULT '[]', "pdfUrl" character varying(255), "isPublished" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_2b1cd07059daf60cc440c9976e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_40956e26bd6c726a7109991745" ON "payslips" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3085b67f89380813f9e0e369cd" ON "payslips" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "payroll_audits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "payrollRunId" uuid NOT NULL, "actorId" uuid, "action" character varying(100) NOT NULL, "beforeValue" jsonb, "afterValue" jsonb, CONSTRAINT "PK_2da238c5addb20a1dce06ebf374" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_897223477c94fd2c79e5859bd1" ON "payroll_audits" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_882f55c0201c1858311150cd0c" ON "payroll_audits" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_loans_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAID_OFF', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_loans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "loanType" character varying(100) NOT NULL, "principalAmount" numeric(12,2) NOT NULL, "interestRate" numeric(12,2) NOT NULL DEFAULT '0', "tenureMonths" integer NOT NULL, "monthlyDeduction" numeric(12,2) NOT NULL, "totalRepaid" numeric(12,2) NOT NULL DEFAULT '0', "startDate" date NOT NULL, "status" "public"."employee_loans_status_enum" NOT NULL DEFAULT 'PENDING', "reason" text, "approvedById" uuid, CONSTRAINT "PK_2ae1f961fd7a82b0e86a4613014" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d77e56bd972d4d1ea8b8e3a688" ON "employee_loans" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9eeaf9f904996862da25e67c2" ON "employee_loans" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "loan_repayments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "loanId" uuid NOT NULL, "payrollRunId" uuid, "amount" numeric(12,2) NOT NULL, "repaymentDate" date NOT NULL, "status" character varying(50) NOT NULL, CONSTRAINT "PK_a37968e2dcfb72f910f5480cc16" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d1c0db21210c823ccda427672" ON "loan_repayments" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_747b67876a3c6af38b121d7e18" ON "loan_repayments" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employee_bonuses_type_enum" AS ENUM('FESTIVAL', 'PERFORMANCE', 'COMMISSION', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employee_bonuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "type" "public"."employee_bonuses_type_enum" NOT NULL DEFAULT 'OTHER', "payrollPeriod" character varying(20) NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, "remarks" text, CONSTRAINT "PK_e6ce056c512e1fcaefc99765874" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3350edd72ca348b7b5dbce3e7" ON "employee_bonuses" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47208daabdabefe8c18e6d083a" ON "employee_bonuses" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."advance_salary_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'DEDUCTED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "advance_salary_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "requestedDate" date NOT NULL, "deductionPeriod" character varying(20) NOT NULL, "status" "public"."advance_salary_requests_status_enum" NOT NULL DEFAULT 'PENDING', "reason" text, "approvedById" uuid, "disbursedAt" TIMESTAMP, CONSTRAINT "PK_743c9ff6bd5274ca9b54c2b7788" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e367a14658fd4e5c507423a6e" ON "advance_salary_requests" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b06f7177cb3b1dcb748fa1481c" ON "advance_salary_requests" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('ALERT', 'INFO', 'SUCCESS', 'WARNING')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "user_id" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'INFO', "title" character varying NOT NULL, "message" text NOT NULL, "action_url" character varying, "is_read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d93ddd7e1b890535ecafbb334e" ON "notifications" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_519d212c491ea2aff5ad82ac3d" ON "notifications" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f12148ce379462ebbb4d06cc13" ON "notifications" ("is_read") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preferences_type_enum" AS ENUM('ALERT', 'INFO', 'SUCCESS', 'WARNING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preferences_channel_enum" AS ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "user_id" uuid NOT NULL, "type" "public"."notification_preferences_type_enum" NOT NULL, "channel" "public"."notification_preferences_channel_enum" NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e907e614e2cc6216ac076eb75e" ON "notification_preferences" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a7e15c143ae2aa2aefec3417b" ON "notification_preferences" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64c90edc7310c6be7c10c96f67" ON "notification_preferences" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "workcenters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "name" character varying(100) NOT NULL, "machineCostPerHour" numeric(12,2) NOT NULL DEFAULT '0', "laborCostPerHour" numeric(12,2) NOT NULL DEFAULT '0', "overheadCostPerHour" numeric(12,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_28e62ffacc78f1f5a1601525a66" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bom_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bomId" uuid NOT NULL, "componentProductId" uuid NOT NULL, "quantity" numeric(10,4) NOT NULL, "unitOfMeasure" character varying(20) NOT NULL, CONSTRAINT "PK_f88a851d4f3c46533a354229e15" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "boms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "finishedProductId" uuid NOT NULL, "version" character varying(50) NOT NULL DEFAULT 'v1.0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59659fde3f22d3869fee0f78822" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."work_orders_status_enum" AS ENUM('DRAFT', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "bomId" uuid NOT NULL, "workcenterId" uuid, "status" "public"."work_orders_status_enum" NOT NULL DEFAULT 'DRAFT', "plannedQuantity" numeric(12,4) NOT NULL, "completedQuantity" numeric(12,4) NOT NULL DEFAULT '0', "scrapQuantity" numeric(12,4) NOT NULL DEFAULT '0', "dueDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_29f6c1884082ee6f535aed93660" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "production_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "workOrderId" uuid NOT NULL, "loggedById" uuid NOT NULL, "completedQuantity" numeric(12,4) NOT NULL DEFAULT '0', "scrapQuantity" numeric(12,4) NOT NULL DEFAULT '0', "scrapReason" character varying(255), "laborHours" numeric(10,2) NOT NULL DEFAULT '0', "machineHours" numeric(10,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_044919928a4713ecb09f7e8de52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "compensatory_leaves" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "daysGranted" numeric(5,2) NOT NULL, "daysUsed" numeric(5,2) NOT NULL DEFAULT '0', "expiryDate" date NOT NULL, "reason" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e38c6acec6a90325cb3f3eb84d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3768f83f9db02034ae045ce541" ON "compensatory_leaves" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cce7ad7f9ebb439e20543ffb21" ON "compensatory_leaves" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_requests_leavetype_enum" AS ENUM('ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'COMPENSATORY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_requests_status_enum" AS ENUM('PENDING', 'APPROVED_BY_MANAGER', 'APPROVED', 'REJECTED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "leaveType" "public"."leave_requests_leavetype_enum" NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "totalDays" numeric(4,1) NOT NULL, "reason" character varying(500) NOT NULL, "status" "public"."leave_requests_status_enum" NOT NULL DEFAULT 'PENDING', "approvedById" uuid, "comments" character varying(255), CONSTRAINT "PK_d3abcf9a16cef1450129e06fa9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c0727a131644d680e44c3d2aa" ON "leave_requests" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f5c284ffe934329d276f30a05" ON "leave_requests" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."leave_balances_leavetype_enum" AS ENUM('ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'COMPENSATORY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "leaveType" "public"."leave_balances_leavetype_enum" NOT NULL, "totalDays" numeric(4,1) NOT NULL DEFAULT '0', "usedDays" numeric(4,1) NOT NULL DEFAULT '0', "carriedForwardDays" numeric(4,1) NOT NULL DEFAULT '0', "expiryDate" date, "fiscalYear" character varying(10) NOT NULL, CONSTRAINT "PK_a1d90dff48fb2bfd23a7163d077" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76bef7ed9ea69530e387826f43" ON "leave_balances" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b9c09192742ceae43c93cfb88" ON "leave_balances" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "rackId" uuid NOT NULL, "code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "capacity" numeric(12,2), "isQuarantine" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_d482036ffdac74713eaea719338" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5645ffd44f3bf2277e587ae766" ON "bins" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9b45beb0fe3fb4a652a7371676" ON "bins" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "racks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "zoneId" uuid NOT NULL, "code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_eb470eda591351fe794d12f9389" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6ce3ed68d0f8804b8023a19db" ON "racks" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad64511239bf69bde5617a5d8f" ON "racks" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "zones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "warehouseId" uuid NOT NULL, "code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "PK_880484a43ca311707b05895bd4a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fcae1bddaa5875b4f0e07ae64a" ON "zones" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d057e3cb6c6cded11f97d8286" ON "zones" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(20) NOT NULL, "address" character varying(255), "city" character varying(100), "country" character varying(100), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_be9dd3cc2931f11f7440f2eeb19" UNIQUE ("name"), CONSTRAINT "UQ_d8b96d60ff9a288f5ed862280d9" UNIQUE ("code"), CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09106b8068aeaf74fa33666df8" ON "warehouses" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5727f1792ab72ca1376ee80030" ON "warehouses" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "batchNumber" character varying(50) NOT NULL, "expiryDate" TIMESTAMP WITH TIME ZONE, "manufactureDate" TIMESTAMP WITH TIME ZONE, "receivedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "initialQuantity" numeric(12,2) NOT NULL, "remainingQuantity" numeric(12,2) NOT NULL, "unitCost" numeric(12,2) NOT NULL, "isConsignment" boolean NOT NULL DEFAULT false, "vendorId" uuid, CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a31c93f696dc66dc9a851673cd" ON "batches" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd8500755c0cca86238626b9e9" ON "batches" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_transfer_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "stockTransferId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "batchId" uuid NOT NULL, "quantity" numeric(12,2) NOT NULL, CONSTRAINT "PK_8acee6121ab8a5135dc84495588" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6bbf0b8664e146bfd40c81c0df" ON "stock_transfer_items" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c67c0805e173b021e856296410" ON "stock_transfer_items" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_transfers_status_enum" AS ENUM('DRAFT', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "fromWarehouseId" uuid NOT NULL, "toWarehouseId" uuid NOT NULL, "status" "public"."stock_transfers_status_enum" NOT NULL DEFAULT 'DRAFT', "reference" character varying(100), "date" TIMESTAMP NOT NULL, CONSTRAINT "PK_ef738a3a4a578c7f1802c1bb50a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65e78a521cbef64720491f3a0d" ON "stock_transfers" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_955395e1a49b1407122a6c6a0f" ON "stock_transfers" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT', 'RETURN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "warehouseId" uuid NOT NULL, "binId" uuid, "batchId" uuid, "type" "public"."stock_movements_type_enum" NOT NULL, "quantity" numeric(12,2) NOT NULL, "reference" character varying(100), "reasonCode" character varying(50), "unitCost" numeric(12,2), "totalCost" numeric(12,2), CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_30dd9acc22dcb6ae51d7d34f16" ON "stock_movements" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccd8bb010f89e0b9c69ae6eadc" ON "stock_movements" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_count_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "stockCountId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "binId" uuid, "batchId" uuid, "expectedQuantity" numeric(12,2) NOT NULL, "actualQuantity" numeric(12,2) NOT NULL, "difference" numeric(12,2), "notes" text, CONSTRAINT "PK_742cd8289e4c1459cfa1ad06e4e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de447d97603e477d2a86002dd4" ON "stock_count_items" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ba1d378da6d2793db7dce7c74" ON "stock_count_items" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stock_counts_status_enum" AS ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stock_counts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "warehouseId" uuid NOT NULL, "status" "public"."stock_counts_status_enum" NOT NULL DEFAULT 'DRAFT', "startedAt" TIMESTAMP WITH TIME ZONE, "completedAt" TIMESTAMP WITH TIME ZONE, "notes" text, CONSTRAINT "PK_75fe54546dc8247c6a33a1707c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7aa52aa028154bd731639af9f" ON "stock_counts" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e90cc53c09bd5501427daa176f" ON "stock_counts" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."serial_numbers_status_enum" AS ENUM('IN_STOCK', 'ISSUED', 'RETURNED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "serial_numbers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "batchId" uuid, "serial" character varying(100) NOT NULL, "status" "public"."serial_numbers_status_enum" NOT NULL DEFAULT 'IN_STOCK', CONSTRAINT "UQ_03e7c40fa473496f85264af2a52" UNIQUE ("serial"), CONSTRAINT "PK_649bdfdac92053bb72828d244d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e2d1d95e2885de51851ec8f4e" ON "serial_numbers" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac9aad34b652b4cbf5224e690f" ON "serial_numbers" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "goods_return_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "goodsReturnId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "batchId" uuid NOT NULL, "quantity" numeric(12,2) NOT NULL, "reasonCode" character varying(50), CONSTRAINT "PK_1ccd3d5c925598eba10368a4f4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b11509631a1a2d8d9346911694" ON "goods_return_items" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a220dea6b746c1ba085e3196da" ON "goods_return_items" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."goods_returns_status_enum" AS ENUM('DRAFT', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "goods_returns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "warehouseId" uuid NOT NULL, "vendorId" uuid, "reference" character varying(100), "status" "public"."goods_returns_status_enum" NOT NULL DEFAULT 'DRAFT', "date" TIMESTAMP NOT NULL, "notes" text, CONSTRAINT "PK_1cdd6ae7a39e30293e76fd0efe3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_15bd8bf926004653951004154c" ON "goods_returns" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_201b019f4acf31cbc6f5e4c17e" ON "goods_returns" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "goods_receipt_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "goodsReceiptId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "binId" uuid, "batchNumber" character varying(100) NOT NULL, "quantity" numeric(12,2) NOT NULL, "unitCost" numeric(12,2) NOT NULL, "expiryDate" TIMESTAMP, CONSTRAINT "PK_3773489ac01faa49777eed0a14f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5164f330018a8eed6ca3300cab" ON "goods_receipt_items" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f45081c833744c54c9cd07ac2" ON "goods_receipt_items" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."goods_receipts_status_enum" AS ENUM('DRAFT', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "goods_receipts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "warehouseId" uuid NOT NULL, "reference" character varying(100), "status" "public"."goods_receipts_status_enum" NOT NULL DEFAULT 'DRAFT', "date" TIMESTAMP NOT NULL, "notes" text, CONSTRAINT "PK_f8cac411be0211f923e1be8534f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e8e9593e8a5df1114a25621d24" ON "goods_receipts" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5cdf1e3ba850c33f26685891fa" ON "goods_receipts" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "goods_issue_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "goodsIssueId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "quantity" numeric(12,2) NOT NULL, "reasonCode" character varying(50), CONSTRAINT "PK_9b2df550ea4030ace3cbd24f358" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9284a04728c8bdc0cb760518b3" ON "goods_issue_items" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aac4f4555aba1cdddbff930a4d" ON "goods_issue_items" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."goods_issues_status_enum" AS ENUM('DRAFT', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "goods_issues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "warehouseId" uuid NOT NULL, "reference" character varying(100), "status" "public"."goods_issues_status_enum" NOT NULL DEFAULT 'DRAFT', "date" TIMESTAMP NOT NULL, "reasonCode" character varying(50), "notes" text, CONSTRAINT "PK_83f83fabbc871ab1e2cbf0f02a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b73e21c563e949925b9592170" ON "goods_issues" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52382f1e7844f384bad0a8367d" ON "goods_issues" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_endpoints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "url" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "events" text NOT NULL, "secret" character varying(255), "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_054c4cfb95223732f5939d2d546" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_54847f2dacee9618585993f147" ON "webhook_endpoints" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c6f761e1c162c67ae3b863d877" ON "webhook_endpoints" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_delivery_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "endpointId" uuid NOT NULL, "event" character varying(255) NOT NULL, "payload" jsonb NOT NULL, "statusCode" integer, "responseBody" text, "success" boolean NOT NULL, "attempt" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_0e3b1d3f1b9b79d4a7ad0b92b84" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_621e74008288050a6c8112d972" ON "webhook_delivery_logs" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f9ae600537318189127a7af52" ON "webhook_delivery_logs" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f1268251d7668b17ebb94ca8c" ON "webhook_delivery_logs" ("endpointId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transfer_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transfer_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "oldDepartmentId" uuid NOT NULL, "newDepartmentId" uuid NOT NULL, "oldBranchId" uuid NOT NULL, "newBranchId" uuid NOT NULL, "effectiveDate" date NOT NULL, "status" "public"."transfer_requests_status_enum" NOT NULL DEFAULT 'PENDING', "reason" text, "requestedById" uuid, "approvedById" uuid, "approvedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f97530bf47e4af43166089627ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a9424c9d3e78b144eaa986877" ON "transfer_requests" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65b404240970520c0cedd492c3" ON "transfer_requests" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."succession_plans_readiness_enum" AS ENUM('READY_NOW', 'READY_IN_1_YEAR', 'READY_IN_2_YEARS', 'READY_IN_WITH_DEVELOPMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "succession_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "designationId" uuid NOT NULL, "successorId" uuid NOT NULL, "readiness" "public"."succession_plans_readiness_enum" NOT NULL DEFAULT 'READY_IN_1_YEAR', "developmentPlan" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_714d70e6267c2e3fbd9ce78287f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_718ceca522c7e57cd6e0ca71be" ON "succession_plans" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ca1d939fa071ddebfaaa9a213d" ON "succession_plans" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."terminations_type_enum" AS ENUM('LAYOFF', 'PERFORMANCE', 'MISCONDUCT', 'RETIREMENT', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TABLE "terminations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "terminationDate" date NOT NULL, "lastWorkingDay" date NOT NULL, "type" "public"."terminations_type_enum" NOT NULL, "reason" text NOT NULL, "isEligibleForRehire" boolean NOT NULL DEFAULT false, "finalSettlementProcessed" boolean NOT NULL DEFAULT false, "terminatedById" uuid, CONSTRAINT "PK_fbcd33fb27fe64566fa4f9281d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2eacb57711891d6bba88eed9c5" ON "terminations" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cc7317789d8500fcdc4beee623" ON "terminations" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."salary_revisions_status_enum" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'APPLIED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_revisions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "currentSalary" numeric(12,2) NOT NULL, "proposedSalary" numeric(12,2) NOT NULL, "currentDesignationId" uuid, "proposedDesignationId" uuid, "currentGradeId" uuid, "proposedGradeId" uuid, "effectiveDate" date NOT NULL, "status" "public"."salary_revisions_status_enum" NOT NULL DEFAULT 'DRAFT', "reason" text, "comments" text, "requestedById" uuid, "approvedById" uuid, "approvedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_56b80c606d602bec1010ebf9c9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_499295747fb72467c68861d252" ON "salary_revisions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21af60ca9da1c46e526cc05290" ON "salary_revisions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."review_feedback_type_enum" AS ENUM('PEER', 'SUBORDINATE', 'MANAGER', 'SELF')`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "performanceReviewId" uuid NOT NULL, "reviewerId" uuid NOT NULL, "type" "public"."review_feedback_type_enum" NOT NULL, "rating" integer NOT NULL, "comment" text NOT NULL, "isAnonymized" boolean NOT NULL DEFAULT false, "submittedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_90f88861e3de37f1b8e6615434f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7b6dd8ca26b7f9da6cf9fbebc9" ON "review_feedback" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_830a162444035680d61410fb7a" ON "review_feedback" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."profile_change_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_change_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "changes" jsonb NOT NULL, "status" "public"."profile_change_requests_status_enum" NOT NULL DEFAULT 'PENDING', "rejectionReason" text, "approvedById" uuid, "approvedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_3bd64a0a33aaa5c526259a9fb43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7f7a5b6e29cd2ae824c8f293b" ON "profile_change_requests" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2df7e070f34de19afb09b4e68b" ON "profile_change_requests" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."resignations_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "resignations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "submissionDate" date NOT NULL, "requestedLastWorkingDay" date NOT NULL, "approvedLastWorkingDay" date, "reason" text NOT NULL, "status" "public"."resignations_status_enum" NOT NULL DEFAULT 'PENDING', "adminComments" text, "approvedById" uuid, "approvedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_36e7319e4e0d982d122245ff56d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_526e93b2017a0bd5bdfd917979" ON "resignations" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4da1bd76f49d1ecc3193cdf591" ON "resignations" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."probation_records_status_enum" AS ENUM('PENDING', 'EXTENDED', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "probation_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "originalEndDate" date NOT NULL, "currentEndDate" date NOT NULL, "status" "public"."probation_records_status_enum" NOT NULL DEFAULT 'PENDING', "extensionCount" integer NOT NULL DEFAULT '0', "reviewComments" text, "reviewedById" uuid, "reviewedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ad076bd34091d4f102cbeee2526" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d1af1054ebe6dedc8bb56dfe1" ON "probation_records" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e7c0278bcf2bd0e77f70131b55" ON "probation_records" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pip_action_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "performanceReviewId" uuid NOT NULL, "targetArea" character varying(500) NOT NULL, "expectedOutcome" text NOT NULL, "reviewDate" date NOT NULL, "progressNotes" text, "isAchieved" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_ba1bd8752ca518331139e765f4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a255e8aac14f425a49ef59a54c" ON "pip_action_plans" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d36d5671e43fa272f88e46012a" ON "pip_action_plans" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "okr_checkins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "keyResultId" uuid NOT NULL, "value" numeric(12,2) NOT NULL, "comment" text, "checkInDate" date NOT NULL, "checkedById" uuid NOT NULL, CONSTRAINT "PK_bbbcf6166548b7bd9b014eb09fa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f002bab5c71122536e5d1eb9a" ON "okr_checkins" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0b23083035e29038c606e52e13" ON "okr_checkins" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "handbooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "content" text NOT NULL, "version" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, "requireAcknowledgment" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_9582bcafdb10d05b44264084302" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4bf82b213fb3df368be5574b19" ON "handbooks" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5657a6627ea258f7370184f4cc" ON "handbooks" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "handbook_acknowledgments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "handbookId" uuid NOT NULL, "employeeId" uuid NOT NULL, "acknowledgedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ipAddress" character varying(255), "userAgent" character varying(500), CONSTRAINT "PK_c32bb31a0c9a6207ba9b6245011" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6b86ca14c471548c4ce7abe74f" ON "handbook_acknowledgments" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_186773ac9cc0099dfaef35761e" ON "handbook_acknowledgments" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "exit_interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "interviewDate" date NOT NULL, "responses" jsonb NOT NULL, "interviewerId" uuid, CONSTRAINT "REL_697c5b6c6cdec3dc5a32866806" UNIQUE ("employeeId"), CONSTRAINT "PK_e774d167d3edd091a8c4187639c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc3b7fe42a2ed6a3019282f7ef" ON "exit_interviews" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1aa2d9915cf130a8b9a5826e9e" ON "exit_interviews" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "enps_surveys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "title" character varying(100) NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_94b72b804c9b2e860e17c72acd7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98ec45b828797a51c2691ac7ff" ON "enps_surveys" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85c5a7ea25a4526cda9888a698" ON "enps_surveys" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "enps_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "surveyId" uuid NOT NULL, "score" integer NOT NULL, "comment" text, "departmentId" uuid, "submittedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7a4644f971b54d1005c3a8d8789" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2763048ccb5e83db297529a6ad" ON "enps_responses" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_faa3f24037f47a5628a1e236e3" ON "enps_responses" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vehicles_fueltype_enum" AS ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "registrationNumber" character varying(50) NOT NULL, "make" character varying(50) NOT NULL, "model" character varying(50) NOT NULL, "fuelType" "public"."vehicles_fueltype_enum" NOT NULL, "capacityKg" numeric(10,2) NOT NULL DEFAULT '0', "insuranceExpiry" TIMESTAMP, "roadTaxExpiry" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clearance_checklists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "itemName" character varying(255) NOT NULL, "isCleared" boolean NOT NULL DEFAULT false, "clearedAt" date, "clearedById" uuid, "remarks" text, CONSTRAINT "PK_ce90f4f5e6e98c4eb5edb8ee4df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18be8ec39b9944634a4937cb30" ON "clearance_checklists" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0b142d9ab266ee76ab9200a90" ON "clearance_checklists" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "fuel_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "vehicleId" uuid NOT NULL, "odometer" numeric(10,2) NOT NULL, "fuelQuantity" numeric(10,2) NOT NULL, "cost" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_efe05f298e5aaa65a00c877756e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "trip_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "vehicleId" uuid NOT NULL, "driverId" uuid NOT NULL, "origin" character varying(255) NOT NULL, "destination" character varying(255) NOT NULL, "distanceKm" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cafb61357477dfa85e7c62792de" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "rate" numeric(5,2) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_41164a748f3dafa373c7e508ca2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9675366aed16a56e6c9322805f" ON "tax_rates" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a609e2d39bc2edb90198595116" ON "tax_rates" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "petty_cash_funds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "balance" numeric(14,2) NOT NULL DEFAULT '0', "currency" character varying(3) NOT NULL DEFAULT 'USD', CONSTRAINT "PK_51ed2daba57482cd36a26857e58" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_33efa5e44c1adf8b0555e7863c" ON "petty_cash_funds" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c63e11bd9d6dc1d8ff6ccbf6d9" ON "petty_cash_funds" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."petty_cash_transactions_type_enum" AS ENUM('OPENING_BALANCE', 'DISBURSEMENT', 'REPLENISHMENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "petty_cash_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "fundId" uuid NOT NULL, "transactionDate" date NOT NULL, "type" "public"."petty_cash_transactions_type_enum" NOT NULL, "description" character varying(255) NOT NULL, "amount" numeric(14,2) NOT NULL, "runningBalance" numeric(14,2) NOT NULL, "reference" character varying(100), CONSTRAINT "PK_b5bd7a92c01fd8d043e53f7e016" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a24bb53614cf26348612d5a421" ON "petty_cash_transactions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ce666aa141246f686b484e0dd" ON "petty_cash_transactions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recurring_journals_frequency_enum" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recurring_journals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" text, "frequency" "public"."recurring_journals_frequency_enum" NOT NULL, "startDate" date NOT NULL, "nextRunDate" date, "endDate" date, "isActive" boolean NOT NULL DEFAULT true, "currency" character varying(3) NOT NULL DEFAULT 'USD', "lines" jsonb NOT NULL, "lastRunAt" TIMESTAMP, CONSTRAINT "PK_06ff720996815126f8c4333e6ec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76e456c7762f248299a5578321" ON "recurring_journals" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_54181a6c48b06b6cb4a69eb319" ON "recurring_journals" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recurring_invoices_frequency_enum" AS ENUM('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recurring_invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "customerName" character varying(150) NOT NULL, "customerId" uuid, "customerEmail" character varying(255), "frequency" "public"."recurring_invoices_frequency_enum" NOT NULL, "startDate" date NOT NULL, "nextRunDate" date, "endDate" date, "isActive" boolean NOT NULL DEFAULT true, "lines" jsonb NOT NULL, "notes" text, "lastRunAt" TIMESTAMP, CONSTRAINT "PK_8a156fda29720c5fc4f86c89081" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_679015f670e051f09710a61cd1" ON "recurring_invoices" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9538b410fd9008ff9d6e43bda" ON "recurring_invoices" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."journal_entries_status_enum" AS ENUM('DRAFT', 'PENDING_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'REVERSED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "journal_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "entryNumber" character varying(30) NOT NULL, "entryDate" date NOT NULL, "description" character varying(255), "reference" character varying(100), "status" "public"."journal_entries_status_enum" NOT NULL DEFAULT 'DRAFT', "preparerId" uuid, "reviewerId" uuid, "approverId" uuid, "reviewedAt" TIMESTAMP, "approvedAt" TIMESTAMP, "rejectionReason" text, "currency" character varying(3) NOT NULL DEFAULT 'USD', "exchangeRate" numeric(18,6) NOT NULL DEFAULT '1', "totalDebit" numeric(14,2) NOT NULL DEFAULT '0', "totalCredit" numeric(14,2) NOT NULL DEFAULT '0', CONSTRAINT "UQ_4b3b30432878ce7cc7882e919be" UNIQUE ("entryNumber"), CONSTRAINT "PK_a70368e64230434457c8d007ab3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58fffc97d300e8164ccd16fc06" ON "journal_entries" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1d500cc6aab57d20dea0294946" ON "journal_entries" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "journal_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "journalEntryId" uuid NOT NULL, "accountId" uuid NOT NULL, "accountName" character varying(150), "description" character varying(255), "debit" numeric(14,2) NOT NULL DEFAULT '0', "credit" numeric(14,2) NOT NULL DEFAULT '0', "originalDebit" numeric(14,2) NOT NULL DEFAULT '0', "originalCredit" numeric(14,2) NOT NULL DEFAULT '0', "costCenterId" uuid, "isReconciled" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_70cba2da4588cee8921f73ef136" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_07bbdad69a6b3f4982d0663fe7" ON "journal_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9e2d015f25426b46a5341fa86a" ON "journal_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_status_enum" AS ENUM('DRAFT', 'PROFORMA', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED', 'VOID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "invoiceNumber" character varying(30) NOT NULL, "customerId" uuid, "customerName" character varying(150) NOT NULL, "customerEmail" character varying(255), "issueDate" date NOT NULL, "dueDate" date NOT NULL, "subtotal" numeric(14,2) NOT NULL DEFAULT '0', "taxAmount" numeric(14,2) NOT NULL DEFAULT '0', "totalAmount" numeric(14,2) NOT NULL DEFAULT '0', "paidAmount" numeric(14,2) NOT NULL DEFAULT '0', "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'DRAFT', "isProforma" boolean NOT NULL DEFAULT false, "isTaxInvoice" boolean NOT NULL DEFAULT true, "notes" text, CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d" UNIQUE ("invoiceNumber"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_440f531f452dcc4389d201b9d4" ON "invoices" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_701ba9039b36234c51b66a23b5" ON "invoices" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "invoice_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "invoiceId" uuid NOT NULL, "description" character varying(255) NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "unitPrice" numeric(12,2) NOT NULL, "lineTotal" numeric(12,2) NOT NULL, "taxRateId" uuid, CONSTRAINT "PK_3d18eb48142b916f581f0c21a65" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_afed06c7cc182ba8cb633d6478" ON "invoice_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48c20d142c1b60b62e135308b5" ON "invoice_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "currency_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "baseCurrency" character varying(3) NOT NULL, "targetCurrency" character varying(3) NOT NULL, "rate" numeric(18,6) NOT NULL, "rateDate" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_43636e55d92705f102d2a6e75a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c0a384460e53da0afbc527a759" ON "currency_rates" ("baseCurrency", "targetCurrency", "rateDate") `,
    );
    await queryRunner.query(
      `CREATE TABLE "credit_notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "noteNumber" character varying(30) NOT NULL, "issueDate" date NOT NULL, "invoiceId" uuid NOT NULL, "amount" numeric(14,2) NOT NULL, "reason" text, "isApplied" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_15b5c4055054179fc43e38527b1" UNIQUE ("noteNumber"), CONSTRAINT "PK_4933888a20b5469e119ad74b9e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_07fabaca2cbf06c08c6c877d03" ON "credit_notes" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e66ac1c874970121cb142e04ce" ON "credit_notes" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."expense_claims_status_enum" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense_claims" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "employeeName" character varying(150) NOT NULL, "claimDate" date NOT NULL, "description" character varying(255) NOT NULL, "amount" numeric(14,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'USD', "receiptUrl" character varying(255), "status" "public"."expense_claims_status_enum" NOT NULL DEFAULT 'DRAFT', "approverId" uuid, "approvedAt" TIMESTAMP, "rejectionReason" text, "reimburseViaPayroll" boolean NOT NULL DEFAULT false, "paymentJournalEntryId" uuid, CONSTRAINT "PK_df3bf7ea3a3a31e39525a322ef6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4fe4a18955d5c8aa11452c82cb" ON "expense_claims" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd4ea05b125561f47a073aa14e" ON "expense_claims" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "cost_centers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(20) NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_65430a1f13f0bd89fb211401373" UNIQUE ("code"), CONSTRAINT "PK_e70f55c677c255c1f81f0ed1ccb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_900fe77c3821aef9480b1045dc" ON "cost_centers" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2bf211525e98efa479585e0fdc" ON "cost_centers" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "accountName" character varying(150) NOT NULL, "accountNumber" character varying(50) NOT NULL, "bankName" character varying(100) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'USD', "balance" numeric(14,2) NOT NULL DEFAULT '0', "iban" character varying(50), "swiftCode" character varying(20), "isActive" boolean NOT NULL DEFAULT true, "glAccountId" uuid, CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ebbdbbe47befba418da6ee901c" ON "bank_accounts" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88fc65874e101b9828b0f64989" ON "bank_accounts" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bank_transactions_status_enum" AS ENUM('UNRECONCILED', 'RECONCILED', 'VOID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bank_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "date" date NOT NULL, "description" character varying(255) NOT NULL, "amount" numeric(14,2) NOT NULL, "reference" character varying(100), "status" "public"."bank_transactions_status_enum" NOT NULL DEFAULT 'UNRECONCILED', "matchedJournalEntryId" uuid, "bankAccountId" uuid NOT NULL, CONSTRAINT "PK_123cc87304eefb2c497b4acdd10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_706e625e5464d6ef023cfd6500" ON "bank_transactions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae58dc0b41c80ad956fcb21182" ON "bank_transactions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chart_of_accounts_type_enum" AS ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chart_of_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "code" character varying(20) NOT NULL, "name" character varying(150) NOT NULL, "type" "public"."chart_of_accounts_type_enum" NOT NULL, "description" text, "parentId" uuid, "currency" character varying(10) NOT NULL DEFAULT 'USD', "balance" numeric(14,2) NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e739f9fb242a95d501aedde46c8" UNIQUE ("code"), CONSTRAINT "PK_467c08a2efc78393c647da32bac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc82c9b1ae99234c8b1e3be2a6" ON "chart_of_accounts" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93ec090b284f1a0b89785fcb65" ON "chart_of_accounts" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "budgets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "accountId" uuid NOT NULL, "period" character varying(7) NOT NULL, "amount" numeric(14,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9057940c4364457372df6b57ed" ON "budgets" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a1d2eb5972d6ad38041ae1cd55" ON "budgets" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bills_status_enum" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "billNumber" character varying(30) NOT NULL, "vendorName" character varying(150) NOT NULL, "vendorId" uuid, "issueDate" date NOT NULL, "dueDate" date NOT NULL, "subtotal" numeric(14,2) NOT NULL DEFAULT '0', "taxAmount" numeric(14,2) NOT NULL DEFAULT '0', "totalAmount" numeric(14,2) NOT NULL DEFAULT '0', "paidAmount" numeric(14,2) NOT NULL DEFAULT '0', "status" "public"."bills_status_enum" NOT NULL DEFAULT 'DRAFT', "currency" character varying(10) NOT NULL DEFAULT 'USD', "notes" text, CONSTRAINT "UQ_82ab2a5bb3cead5a31887d7bbde" UNIQUE ("billNumber"), CONSTRAINT "PK_a56215dfcb525755ec832cc80b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b26a4887deed791809fc4f5851" ON "bills" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ab815ae0848cd7785d224c4b7" ON "bills" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "bill_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "billId" uuid NOT NULL, "description" character varying(255) NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "unitPrice" numeric(12,2) NOT NULL, "lineTotal" numeric(12,2) NOT NULL, "accountId" uuid, CONSTRAINT "PK_0490d423ac8c1bf4aeddf7ac391" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_375b59e4ed40458ac1bcf24be9" ON "bill_lines" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c48e666185b068d1a201bdc4c8" ON "bill_lines" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."accounting_periods_status_enum" AS ENUM('OPEN', 'CLOSED', 'SOFT_LOCKED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounting_periods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(50) NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "status" "public"."accounting_periods_status_enum" NOT NULL DEFAULT 'OPEN', "isYearEnd" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_a574217de733282cf1ea1c1970f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4724622ba0625eec688ec9e50" ON "accounting_periods" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e7c8a5ccf7e2dd046c16d04bbf" ON "accounting_periods" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "document_folders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "parentId" uuid, "ownerId" uuid NOT NULL, CONSTRAINT "PK_0307e252e6c13b4ff3ade731523" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_14c8824d6093c2907392b0f73e" ON "document_folders" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_473c0b4336c5d9fa6f76f793c7" ON "document_folders" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6278df42b5ac49dd4d1e07248f" ON "document_folders" ("parentId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "document_versions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "documentId" uuid NOT NULL, "versionNumber" integer NOT NULL, "fileKey" character varying(500) NOT NULL, "mimeType" character varying(100) NOT NULL, "fileSize" bigint NOT NULL, "createdByUserId" uuid NOT NULL, "changeNotes" text, CONSTRAINT "PK_baf26dab035c6d6fc433f9dc6a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7dd57ce45ece40350a0d13997" ON "document_versions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b03b17df5b0c7b2657cc088ec" ON "document_versions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "type" character varying(50), "folderId" uuid, "ownerId" uuid NOT NULL, "latestVersionNumber" integer NOT NULL DEFAULT '1', "accessControl" character varying(50) NOT NULL DEFAULT 'PUBLIC', "expiryDate" TIMESTAMP, "signatures" jsonb, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5109a94ccfd3f39bf4a7a1e1fa" ON "documents" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_968df1869955e5f4f8fcf4b6a1" ON "documents" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf0a9fa48053d1f93da40713cc" ON "documents" ("folderId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "jurisdiction" character varying(10) NOT NULL, "taxName" character varying(100) NOT NULL, "ratePercentage" numeric(5,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_29b500604ee0ac9e162de1bfa6d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_filing_exports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "jurisdiction" character varying(10) NOT NULL, "period" character varying(50) NOT NULL, "payload" jsonb NOT NULL, "format" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6085d719bd01c79b4fef2b8fcd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_channels_type_enum" AS ENUM('DIRECT', 'GROUP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_channels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying, "type" "public"."chat_channels_type_enum" NOT NULL DEFAULT 'DIRECT', "participants" jsonb NOT NULL, CONSTRAINT "PK_efecd102855fb96e1428306ec6f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fdec14a661dd345dae5ffc587" ON "chat_channels" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f61a618bb6b1131af1dc56ba0a" ON "chat_channels" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "channel_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "content" text NOT NULL, "mentions" jsonb, CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e818d30c3c802e361e8bc6206" ON "chat_messages" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b80ecd72bc38bc692a0cc18238" ON "chat_messages" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_31c45c915d0e437e80a63b1774" ON "chat_messages" ("channel_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9e5fc47ecb06d4d7b84633b171" ON "chat_messages" ("sender_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "description" text, "monthlyPrice" numeric(10,2) NOT NULL DEFAULT '0', "annualPrice" numeric(10,2) NOT NULL DEFAULT '0', "currency" character varying(3) NOT NULL DEFAULT 'USD', "stripeProductId" character varying(255), "features" jsonb NOT NULL DEFAULT '{}', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "planId" uuid NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'trialing', "stripeCustomerId" character varying(255), "stripeSubscriptionId" character varying(255), "trialEndsAt" TIMESTAMP, "currentPeriodStart" TIMESTAMP, "currentPeriodEnd" TIMESTAMP, "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_3c22dd60cf0850aa8ad2e300f1" UNIQUE ("tenantId"), CONSTRAINT "PK_9455f2b3b10365e81538a079da3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "workflow_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'ACTIVE', "name" character varying NOT NULL, "triggerEvent" character varying NOT NULL, "conditionLogic" jsonb, "actionType" character varying NOT NULL, "actionPayload" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5b645c11994279ad47dc41291d8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid NOT NULL, "refreshTokenHash" character varying(255) NOT NULL, "userAgent" character varying(255), "ipAddress" character varying(50), "deviceType" character varying(100), "familyId" character varying(64), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "lastActiveAt" TIMESTAMP WITH TIME ZONE, "isTwoFactorAuthenticated" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_80f606357d45ea2034532c902c" ON "user_sessions" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be32da751c6ec479acf19efcf5" ON "user_sessions" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55fa4db8406ed66bc704432842" ON "user_sessions" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b58a8f1e3bbaeab702f56ab8d" ON "user_sessions" ("familyId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(255), "permissions" text NOT NULL, "isSystem" boolean NOT NULL DEFAULT false, "parentRoleId" uuid, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e59a01f4fe46ebbece575d9a0f" ON "roles" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_60becd9578c65d9821e8db55ef" ON "roles" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_648e3f5447f725579d7d4ffdfb" ON "roles" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "userId" uuid NOT NULL, "roleId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_25d28bd932097a9e90495ede7b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9c14741084d57ac0ec0cb52af" ON "memberships" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc45487e499df9b27eb7a4c44e" ON "memberships" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_46f10de4c17b8fd18fa76d1c08" ON "memberships" ("userId", "tenant_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "shiftId" uuid NOT NULL, "startDate" date NOT NULL, "endDate" date, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_7a78d24f38deedd9fe0ea19685c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd1a808b07ead1271c932775f5" ON "shift_assignments" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c596b9503423e1e143602b87e" ON "shift_assignments" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "shift_rotations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "shiftSequence" text NOT NULL, "rotationIntervalDays" integer NOT NULL DEFAULT '7', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_37703553d87fcd28c76cb94bfdb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4def61dcd02b389c3bd9994aaf" ON "shift_rotations" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5cd42f208433f589fc5feae050" ON "shift_rotations" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."regularization_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "regularization_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "date" date NOT NULL, "checkIn" TIMESTAMP WITH TIME ZONE, "checkOut" TIMESTAMP WITH TIME ZONE, "reason" text NOT NULL, "status" "public"."regularization_requests_status_enum" NOT NULL DEFAULT 'PENDING', "approvedById" uuid, "approvedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a21cb61429458320cfa4868998c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_371e2d8a39e7beee53124f8bb4" ON "regularization_requests" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2227475c7de8f4db3b856e4c08" ON "regularization_requests" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attendance_records_method_enum" AS ENUM('MANUAL', 'QR', 'BIOMETRIC', 'GEO_FENCED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attendance_records_status_enum" AS ENUM('PRESENT', 'ABSENT', 'LATE', 'EARLY_EXIT', 'ON_LEAVE', 'HALF_DAY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "attendance_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "employeeId" uuid NOT NULL, "date" date NOT NULL, "checkIn" TIMESTAMP WITH TIME ZONE, "checkOut" TIMESTAMP WITH TIME ZONE, "method" "public"."attendance_records_method_enum" NOT NULL DEFAULT 'MANUAL', "location" jsonb, "status" "public"."attendance_records_status_enum" NOT NULL DEFAULT 'PRESENT', "isOvertime" boolean NOT NULL DEFAULT false, "overtimeMinutes" integer NOT NULL DEFAULT '0', "isOvertimeApproved" boolean NOT NULL DEFAULT false, "overtimeApprovedById" uuid, "remarks" character varying(255), CONSTRAINT "PK_946920332f5bc9efad3f3023b96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da9dd4e1e5a31c92c38a401ea5" ON "attendance_records" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4736a70eee44d666be17296a2" ON "attendance_records" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" text, "depreciationMethod" character varying(50) NOT NULL, "depreciationRate" numeric(5,2) NOT NULL, "usefulLifeMonths" integer NOT NULL, CONSTRAINT "PK_d21442187e7b0237566389805a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0627acc42a45f2b588d3a22795" ON "asset_categories" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b227bf10736bf8101c3a439078" ON "asset_categories" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "assetId" uuid NOT NULL, "employeeId" uuid NOT NULL, "assignmentDate" date NOT NULL, "returnDate" date, "notes" text, CONSTRAINT "PK_20629cd9ab403e64604ce5e36b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1505599191c234b3656e32a7f9" ON "asset_assignments" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_553c1112d03004a3f3babe1810" ON "asset_assignments" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_maintenances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "assetId" uuid NOT NULL, "maintenanceDate" date NOT NULL, "type" character varying(100) NOT NULL, "description" text NOT NULL, "cost" numeric(15,2) NOT NULL, "technician" character varying(100), "nextMaintenanceDate" date, CONSTRAINT "PK_6af14ce16fe98b64069ab12a3d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e660b824be916e448462bcd88a" ON "asset_maintenances" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bbce116650d92aa889aa68163a" ON "asset_maintenances" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."assets_status_enum" AS ENUM('PURCHASED', 'ACTIVE', 'UNDER_MAINTENANCE', 'DISPOSED', 'WRITTEN_OFF')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."assets_depreciationmethod_enum" AS ENUM('SL', 'DB', 'UOP', 'NONE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "assetCode" character varying(50) NOT NULL, "categoryId" uuid NOT NULL, "purchaseDate" date NOT NULL, "purchaseCost" numeric(15,2) NOT NULL, "location" character varying(255), "description" text, "serialNumber" character varying(100), "warrantyExpiry" date, "insuranceExpiry" date, "status" "public"."assets_status_enum" NOT NULL DEFAULT 'PURCHASED', "assignedEmployeeId" uuid, "disposalDate" date, "disposalPrice" numeric(15,2), "disposalReason" text, "depreciationMethod" "public"."assets_depreciationmethod_enum" NOT NULL DEFAULT 'NONE', "usefulLifeMonths" integer, "depreciationRate" numeric(5,2), "salvageValue" numeric(15,2), "netBookValue" numeric(15,2), "qrCodeUrl" text, CONSTRAINT "UQ_000a1e0b494ed91ad742b8274b6" UNIQUE ("assetCode"), CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_35832939b4bc039606a21fc27e" ON "assets" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9869482e2463f384e89235e2f9" ON "assets" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_000a1e0b494ed91ad742b8274b" ON "assets" ("assetCode") `,
    );
    await queryRunner.query(
      `CREATE TABLE "rfq_vendors" ("rfqsId" uuid NOT NULL, "vendorsId" uuid NOT NULL, CONSTRAINT "PK_aa9b86461b941873b945a0be1c3" PRIMARY KEY ("rfqsId", "vendorsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0ae43d53b2e54462fc2fe26b7b" ON "rfq_vendors" ("rfqsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd25d2cd30167e79de2b48f0b0" ON "rfq_vendors" ("vendorsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "departments_closure" ("id_ancestor" uuid NOT NULL, "id_descendant" uuid NOT NULL, CONSTRAINT "PK_3e4ee55a233bef0e3464728cc15" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f23b3abb6caa54454a2a72da59" ON "departments_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_276148abd382d667072d533af4" ON "departments_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks_closure" ("id_ancestor" uuid NOT NULL, "id_descendant" uuid NOT NULL, CONSTRAINT "PK_4d9b798d8679ee1f7a85fe6c187" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76d496f6bbd3024bd7a51b0596" ON "tasks_closure" ("id_ancestor") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3679053570c6066b1aab034116" ON "tasks_closure" ("id_descendant") `,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP COLUMN "unitOfMeasure"`,
    );
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "tenantId"`);
    await queryRunner.query(
      `ALTER TABLE "boms" DROP COLUMN "finishedProductId"`,
    );
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_440f531f452dcc4389d201b9d4"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "tenant_id"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "invoiceNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "customerId"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "customerName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "customerEmail"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "issueDate"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "subtotal"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "taxAmount"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "totalAmount"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "paidAmount"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "isProforma"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "isTaxInvoice"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "notes"`);
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "deviceFingerprint"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "deviceFingerprint" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "unitOfMeasure" character varying(20) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "boms" ADD "tenantId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "finishedProductId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "version" character varying(50) NOT NULL DEFAULT 'v1.0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "tenant_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "componentVariantId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "uom" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "boms" ADD "tenant_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "boms" ADD "productId" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "boms" ADD "variantId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "tenant_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "invoiceNumber" character varying(30) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d" UNIQUE ("invoiceNumber")`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" ADD "customerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "customerName" character varying(150) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "customerEmail" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "issueDate" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "subtotal" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "taxAmount" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "totalAmount" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "paidAmount" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "isProforma" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "isTaxInvoice" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" ADD "notes" text`);
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "tenantId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "amountDue" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "amountPaid" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "amountRemaining" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "currency" character varying(3) NOT NULL DEFAULT 'USD'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "hostedInvoiceUrl" character varying(1024)`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "pdfUrl" character varying(1024)`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "stripeInvoiceId" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "paymentProvider" character varying(50) NOT NULL DEFAULT 'stripe'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "email" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "deviceType" character varying(50)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."login_events_result_enum" AS ENUM('SUCCESS', 'FAILED', 'LOCKED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "result" "public"."login_events_result_enum" NOT NULL DEFAULT 'SUCCESS'`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "failureReason" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ALTER COLUMN "quantity" TYPE numeric(12,4)`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "status" character varying(50) NOT NULL DEFAULT 'draft'`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "dueDate"`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD "dueDate" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "login_events" ALTER COLUMN "userId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "ipAddress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "ipAddress" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "userAgent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "userAgent" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "login_events" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "city" character varying(50)`,
    );
    await queryRunner.query(`ALTER TABLE "login_events" DROP COLUMN "country"`);
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "country" character varying(50)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77c3c1f412aa3e75a77cf2f6ec" ON "bom_items" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_853e9a4227edce0bbb7a54fbb2" ON "bom_items" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb2bdc79ded5753e40f98ade47" ON "boms" ("tenant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_022a2621dcb8e0719d7596db4f" ON "boms" ("tenant_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_440f531f452dcc4389d201b9d4" ON "invoices" ("tenant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_dashboard_widgets" ADD CONSTRAINT "FK_c109d117e020e890425064fd189" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_calendars" ADD CONSTRAINT "FK_340fd6656b7e62c3087370a01ad" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "FK_6847e0fbfa8c5b91eab52b321eb" FOREIGN KEY ("webhookConfigId") REFERENCES "webhook_configs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_modules" ADD CONSTRAINT "FK_54b5bb2fadb6ada4fe57a9e2701" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_custom_domains" ADD CONSTRAINT "FK_34e059686802df8426788ef4c51" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_notifications" ADD CONSTRAINT "FK_e4ea87d7d65b977b462fe4d81ba" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD CONSTRAINT "FK_1fd154de0075f094be611bed079" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "holidays" ADD CONSTRAINT "FK_7bcd0913f21832292fbfc2cc5fe" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_logs" ADD CONSTRAINT "FK_de9216bb1b30b45bf99cc378bac" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_cfa83f61e4d27a87fcae1e025ab" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_steps" ADD CONSTRAINT "FK_61e90eb0fc5abc6092a99e468c9" FOREIGN KEY ("workflowId") REFERENCES "approval_workflows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_messages" ADD CONSTRAINT "FK_b01e2a35417efbe04c10828266f" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_messages" ADD CONSTRAINT "FK_ddea80824c24d270ef2cb4cb0ba" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_d5846dd4a05e2687016f9364c5d" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_ffff1b4554585c0c9b95d062605" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD CONSTRAINT "FK_4f127f7c92139971ec4cbbe0bd5" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_slas" ADD CONSTRAINT "FK_2846638d9193732b802801cda33" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "kb_articles" ADD CONSTRAINT "FK_d32661585d173919bd2ebe25a3a" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "kb_articles" ADD CONSTRAINT "FK_6a2284e667762b218350f9d0464" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD CONSTRAINT "FK_5363bc1655a7339414523a02fd4" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotations" ADD CONSTRAINT "FK_887501e14713d6b541feb72ba1c" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotations" ADD CONSTRAINT "FK_f1384b2fb0f48b6f8d57e20d2cd" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotations" ADD CONSTRAINT "FK_30fa5e15a35cd8709889074c4f3" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotation_lines" ADD CONSTRAINT "FK_3bcebd04377d4c558966f62067c" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD CONSTRAINT "FK_01722fa36be5da34ca66c3d88ff" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" ADD CONSTRAINT "FK_0115a9e047063b8b78326979dd5" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_order_lines" ADD CONSTRAINT "FK_c8335d5de22aaa49db80418e3b7" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricelist_items" ADD CONSTRAINT "FK_7df0f5bf08517096ce62ed0e321" FOREIGN KEY ("pricelistId") REFERENCES "pricelists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_orders" ADD CONSTRAINT "FK_78dda146edfef4e07f5cc987ffa" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_order_lines" ADD CONSTRAINT "FK_d905b3c5cb56d64bdbcc85e7a98" FOREIGN KEY ("deliveryOrderId") REFERENCES "delivery_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_schedules" ADD CONSTRAINT "FK_a17063e48b705d8fa677bdd8497" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pinned_reports" ADD CONSTRAINT "FK_b6454119157bcbbce618c2e0937" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pinned_reports" ADD CONSTRAINT "FK_cbb2b8ead8aafe4bd39e0d2b5fb" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "performance_reviews" ADD CONSTRAINT "FK_89c1585d31979b8f709928bd2bf" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_results" ADD CONSTRAINT "FK_5bfa77e448b5900fd59bd7db2af" FOREIGN KEY ("performanceReviewId") REFERENCES "performance_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_history" ADD CONSTRAINT "FK_97e8145357ebf19a056f0c2e1d1" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" ADD CONSTRAINT "FK_f3557a48337a1de31e92fa8b139" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" ADD CONSTRAINT "FK_c22623563ce6234e5df0fac9cae" FOREIGN KEY ("courseId") REFERENCES "training_courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_3e63260109cfd258cabedb17e63" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_26c8395a5e07cd9ade10f0fd50c" FOREIGN KEY ("catalogId") REFERENCES "skill_catalog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_history" ADD CONSTRAINT "FK_18678c6c48d6381d4e49a2ea0ef" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_history" ADD CONSTRAINT "FK_1eccee82fc9fce30d20fc7ef418" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_history" ADD CONSTRAINT "FK_a93378a0e7880816ed629a7178f" FOREIGN KEY ("designationId") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_0ee1fa8d2cfe91f9dac54f9e2ff" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_8eed4bfc75840eeb9780f017e9e" FOREIGN KEY ("designationId") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_62adbe4a1956a8be9436f8e74ee" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_114e0dcfc1b75a6e39ff7115dab" FOREIGN KEY ("managerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "FK_8d81e3056a198f0ed3010da4cca" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_2c0c254d34be97f6982d3138fc7" FOREIGN KEY ("parentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_ba82c76bf124871821aedc35b7a" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_letters" ADD CONSTRAINT "FK_d0aca0fed9e07d4504766f34eab" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_f6ebb8bc5061068e4dd97df3c77" FOREIGN KEY ("jobId") REFERENCES "job_requisitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_a34254e3f2b3d20f07f8dbd6322" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requisitions" ADD CONSTRAINT "FK_a667151016362c55c0a446c5084" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requisitions" ADD CONSTRAINT "FK_a39d112be9a455e2ff6e8ae233a" FOREIGN KEY ("designationId") REFERENCES "designations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_checklists" ADD CONSTRAINT "FK_389d776b36bd41f3eba63ffad56" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "milestones" ADD CONSTRAINT "FK_662a1f9d865fe49768fa369fd0f" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "milestones" ADD CONSTRAINT "FK_7a41bdfa037d90091ccbff6f4d9" FOREIGN KEY ("predecessorId") REFERENCES "milestones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085" FOREIGN KEY ("parentId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_logs" ADD CONSTRAINT "FK_8709d71991ce15614b1e4a6f43d" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_risks" ADD CONSTRAINT "FK_f8e1e857c806d91d7b5162878e1" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "change_requests" ADD CONSTRAINT "FK_d099a3a9b5e5d4c93746cf52636" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_evaluations" ADD CONSTRAINT "FK_a6faf67c5319d82be64da563d07" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "uom_conversions" ADD CONSTRAINT "FK_84eca0e11364ff12dfdef75e954" FOREIGN KEY ("uomGroupId") REFERENCES "uom_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_25f92b70826ec7214cd84aac124" FOREIGN KEY ("uomGroupId") REFERENCES "uom_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_e04bec5cd5b302470c3ae474e1c" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "FK_64a3df78c26adc62cbcf15aa4a4" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "FK_d96db03df749514dd9b5f36ad2b" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "FK_0725cd52f439e7e6143b9ad3e89" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grns" ADD CONSTRAINT "FK_359b161d0799acfc6ea53b95fcb" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grn_lines" ADD CONSTRAINT "FK_74a37d3f07f749c50343ea4f0b6" FOREIGN KEY ("grnId") REFERENCES "grns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grn_lines" ADD CONSTRAINT "FK_7ed4eb46f35585faffc18b4c549" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grn_lines" ADD CONSTRAINT "FK_ac31c3660c1dcf0517f1d3574c2" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD CONSTRAINT "FK_a8468c713028b8b45a921b9d320" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD CONSTRAINT "FK_ac5ca8ec3a802456bfb50492593" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" ADD CONSTRAINT "FK_130c83c1c96e6032efc950d6458" FOREIGN KEY ("grnId") REFERENCES "grns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_request_lines" ADD CONSTRAINT "FK_5210ca32f60e6a0a93d0e3c5fc2" FOREIGN KEY ("purchaseRequestId") REFERENCES "purchase_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_request_lines" ADD CONSTRAINT "FK_3bd8c74c238bb22c25c133f4830" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_request_lines" ADD CONSTRAINT "FK_c43cec93aaf11c9d13b069da3f8" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "debit_notes" ADD CONSTRAINT "FK_bb024d397425c21a315be77e11d" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "debit_notes" ADD CONSTRAINT "FK_07748243a96bc48a802bf454796" FOREIGN KEY ("grnId") REFERENCES "grns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "debit_notes" ADD CONSTRAINT "FK_2e34d74a3921c9c3add14488be3" FOREIGN KEY ("poId") REFERENCES "purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos_sessions" ADD CONSTRAINT "FK_f00234155896c468de12b33a1a2" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_brackets" ADD CONSTRAINT "FK_826ede1e311ab2bf58d6b433136" FOREIGN KEY ("taxConfigurationId") REFERENCES "tax_configurations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_structure_components" ADD CONSTRAINT "FK_bafb0432d68b78f8a94a664c6ad" FOREIGN KEY ("salaryStructureId") REFERENCES "salary_structures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_salary_assignments" ADD CONSTRAINT "FK_225f5e5255288ec53e58992b86c" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_salary_assignments" ADD CONSTRAINT "FK_7b7f77cf679133febcaa1103505" FOREIGN KEY ("salaryStructureId") REFERENCES "salary_structures"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos_orders" ADD CONSTRAINT "FK_550a08920612b2c29ec6c5f1fb7" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos_orders" ADD CONSTRAINT "FK_5526f658821d92656e3d574c8e1" FOREIGN KEY ("sessionId") REFERENCES "pos_sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payslips" ADD CONSTRAINT "FK_900143f20e6cd2fc0153db2242c" FOREIGN KEY ("payrollRunId") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payslips" ADD CONSTRAINT "FK_3fa0aa64d0a6d751ea49e6cd804" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_loans" ADD CONSTRAINT "FK_756d083b6a70057163b938ec133" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_repayments" ADD CONSTRAINT "FK_a2f0da4f5cd58b196e6db2d58e3" FOREIGN KEY ("loanId") REFERENCES "employee_loans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_bonuses" ADD CONSTRAINT "FK_6cbc1bbb92b2bbf08d4cf2ce59b" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "advance_salary_requests" ADD CONSTRAINT "FK_96c46b1f1357253e50defc3516b" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_64c90edc7310c6be7c10c96f675" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workcenters" ADD CONSTRAINT "FK_21178784932d669bd842ffc5728" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD CONSTRAINT "FK_43b33894ec24ad195df83376d5f" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD CONSTRAINT "FK_17c7df0ebef0385a9ae195378f1" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_5a85350ec657a0822a9c2f3196d" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_25951d6f023e6728c53c71ee6b4" FOREIGN KEY ("bomId") REFERENCES "boms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" ADD CONSTRAINT "FK_4774828fa74afb8dfc179dcd4bc" FOREIGN KEY ("workcenterId") REFERENCES "workcenters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_logs" ADD CONSTRAINT "FK_07e003f77596709ece14bc6ab0c" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_logs" ADD CONSTRAINT "FK_79651ee81bc1e360484f6c25b62" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "compensatory_leaves" ADD CONSTRAINT "FK_161e5d311cb182c64565dfc323b" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_4eda1468756ca831495e308e407" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_1e0df1791c9344d4bdde694be60" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bins" ADD CONSTRAINT "FK_9bbd97c43ad3a6a9e2f6e2400ec" FOREIGN KEY ("rackId") REFERENCES "racks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "racks" ADD CONSTRAINT "FK_6bfc6f7ee66b24adf1614399613" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD CONSTRAINT "FK_cb8d33e25133677784bd758c4db" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD CONSTRAINT "FK_e196ad8d0c5147f6e6c5694838d" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD CONSTRAINT "FK_1c68f14b41da6e5628da705fc26" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_703611513c4b899329a3da7a524" FOREIGN KEY ("stockTransferId") REFERENCES "stock_transfers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_f3d2b9e6f306fc4a292c687a12d" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_8bc642bf502be113e499c92e498" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_c92c45904b65a6ed07d66df5d1c" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_684badd3999923339489222a0b7" FOREIGN KEY ("fromWarehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_22928dc6cdfdc43ef470de801f4" FOREIGN KEY ("toWarehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_a3acb59db67e977be45e382fc56" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_b1e10f38c51868fba8bac1e12c9" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_2d118fa925e343f74b7dfe822ec" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_9f0bd61f665daa3c7d0b3de7179" FOREIGN KEY ("binId") REFERENCES "bins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_77f13cc163fba94b261499f80fd" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" ADD CONSTRAINT "FK_25eb41f655643569f556dbcfa9d" FOREIGN KEY ("stockCountId") REFERENCES "stock_counts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" ADD CONSTRAINT "FK_fb1bf76e9ed0136b9942f821d28" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" ADD CONSTRAINT "FK_d72da0a453e768414dd97659c54" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" ADD CONSTRAINT "FK_3b7a415c0afe009c431447b3ace" FOREIGN KEY ("binId") REFERENCES "bins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" ADD CONSTRAINT "FK_53b5d96e3f984e73b0e06ab5b4d" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_counts" ADD CONSTRAINT "FK_a1c78084e4c5ae4da0df807dd52" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "serial_numbers" ADD CONSTRAINT "FK_b864eadf2e9163a95b5c1b6953e" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "serial_numbers" ADD CONSTRAINT "FK_066abf627e8323e92b3884cc98c" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "serial_numbers" ADD CONSTRAINT "FK_29541c4bc40a3305df6fe6a358e" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" ADD CONSTRAINT "FK_5bcb2d70ba3c8543ec7fa8d9d6e" FOREIGN KEY ("goodsReturnId") REFERENCES "goods_returns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" ADD CONSTRAINT "FK_0e9d9fb79bb30df82dc4fa13b7d" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" ADD CONSTRAINT "FK_be11bee076e7fff2d8160d7a7e9" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" ADD CONSTRAINT "FK_de6467ea1bf556b8a0243f44117" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_returns" ADD CONSTRAINT "FK_d2f3f26d010e3a77da0fea12d93" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "FK_d1c1d80926f6e0eedd7b1473635" FOREIGN KEY ("goodsReceiptId") REFERENCES "goods_receipts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "FK_e9dc7bf6f358e36e53fd7ec6438" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "FK_f17bc9dedff0baf284be182d738" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "FK_abfb87e5498b6594cb4db4c97f0" FOREIGN KEY ("binId") REFERENCES "bins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipts" ADD CONSTRAINT "FK_142420efaa301b518d3b3fe5822" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issue_items" ADD CONSTRAINT "FK_715176d173082fcc68d5cf8dec5" FOREIGN KEY ("goodsIssueId") REFERENCES "goods_issues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issue_items" ADD CONSTRAINT "FK_63f90766e066afe8ac07f6afef8" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issue_items" ADD CONSTRAINT "FK_fc920bb3138ea6e25735b8c3f57" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issues" ADD CONSTRAINT "FK_f197da4bcb55a790f4f220761c5" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD CONSTRAINT "FK_1f80204b37686f1eb6de680e228" FOREIGN KEY ("componentProductId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD CONSTRAINT "FK_15d796718c8a39b202a94d132f7" FOREIGN KEY ("componentVariantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD CONSTRAINT "FK_aa572bae154904a33a982c0a539" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD CONSTRAINT "FK_4514eee9134f52ae51cc862a69c" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_bdc656915841ad70efe4b52b183" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_bc33921a2dfacec1c1d4cc73c8e" FOREIGN KEY ("oldDepartmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_a10b93c7e6fb050ccdf39ba707c" FOREIGN KEY ("newDepartmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_1b3c7539dbe0c4de6e6ed2105da" FOREIGN KEY ("oldBranchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD CONSTRAINT "FK_aad86b11b62fdc756ebddad5ed2" FOREIGN KEY ("newBranchId") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "succession_plans" ADD CONSTRAINT "FK_bc15a5201373550bee2a77332b6" FOREIGN KEY ("designationId") REFERENCES "designations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "succession_plans" ADD CONSTRAINT "FK_57b75e15d8156ddff16cbf8d848" FOREIGN KEY ("successorId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "terminations" ADD CONSTRAINT "FK_5495b0d2fbfab5813e1ab3e9844" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_c3c79e5a9d14a3d61c3acb00326" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_d48e88509b5c392d0a049abc475" FOREIGN KEY ("currentDesignationId") REFERENCES "designations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_4bafb424c60a507741ea50a4dfc" FOREIGN KEY ("proposedDesignationId") REFERENCES "designations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_10b6a3c56e108899a65c42ae8fc" FOREIGN KEY ("currentGradeId") REFERENCES "grades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_a85b1d80f38b2e7e7b552fb0db6" FOREIGN KEY ("proposedGradeId") REFERENCES "grades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_feedback" ADD CONSTRAINT "FK_721f972ca03f1f247432b9c11fc" FOREIGN KEY ("performanceReviewId") REFERENCES "performance_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_feedback" ADD CONSTRAINT "FK_5a58577cba8a2d7a9851df0a9ac" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_change_requests" ADD CONSTRAINT "FK_f07e854319aaae23099ef3dfd72" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_change_requests" ADD CONSTRAINT "FK_0b33afecd828b25f7d5296c073b" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "resignations" ADD CONSTRAINT "FK_78518f8d2f367864875fae1ed09" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "probation_records" ADD CONSTRAINT "FK_0c11526151f2c8ea1a9fbba56ef" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pip_action_plans" ADD CONSTRAINT "FK_2810a597f10cb66d5d1a32bd993" FOREIGN KEY ("performanceReviewId") REFERENCES "performance_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "okr_checkins" ADD CONSTRAINT "FK_5b49b623a7607fb2bdb5579a2a5" FOREIGN KEY ("keyResultId") REFERENCES "key_results"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "handbook_acknowledgments" ADD CONSTRAINT "FK_6f0541fd668293a0c0ef7c4e6b9" FOREIGN KEY ("handbookId") REFERENCES "handbooks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "exit_interviews" ADD CONSTRAINT "FK_697c5b6c6cdec3dc5a32866806b" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "enps_responses" ADD CONSTRAINT "FK_4810e9eab86c1e3aa1609d1863d" FOREIGN KEY ("surveyId") REFERENCES "enps_surveys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "enps_responses" ADD CONSTRAINT "FK_6798efabf53ed1211aeaa7fc4f4" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD CONSTRAINT "FK_8ab940b0a05aed6c3d19d15ecbc" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clearance_checklists" ADD CONSTRAINT "FK_a88b4df15b5e9ae01f6fe014d72" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fuel_logs" ADD CONSTRAINT "FK_cd5ba12914e43f892b057f56c9e" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fuel_logs" ADD CONSTRAINT "FK_be5721763c9967c555e0b034a24" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_logs" ADD CONSTRAINT "FK_218657125f7d1dab7c42a9e8005" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_logs" ADD CONSTRAINT "FK_8b76d8af2d52d34e27f39da75cf" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_lines" ADD CONSTRAINT "FK_3c913ef1f691ce5b2c490116309" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_lines" ADD CONSTRAINT "FK_9f57f31e620fe759b452feb776e" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_notes" ADD CONSTRAINT "FK_a85bd9f4e7e57d49f830f38b05d" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "FK_696136b16d41cbf47ff3db72f75" FOREIGN KEY ("parentId") REFERENCES "chart_of_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "FK_744697fee7edfaa490e40a92684" FOREIGN KEY ("accountId") REFERENCES "chart_of_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bill_lines" ADD CONSTRAINT "FK_971c433d6f2ce1926847dd4b096" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_folders" ADD CONSTRAINT "FK_6278df42b5ac49dd4d1e07248fe" FOREIGN KEY ("parentId") REFERENCES "document_folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_folders" ADD CONSTRAINT "FK_2d86266e371484540aebed96129" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_versions" ADD CONSTRAINT "FK_4ea14bf55da75a8c3997e745a28" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_versions" ADD CONSTRAINT "FK_c27b53ecd7f95ba653fe06dd004" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_cf0a9fa48053d1f93da40713cc1" FOREIGN KEY ("folderId") REFERENCES "document_folders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_4106f2a9b30c9ff2f717894a970" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_31c45c915d0e437e80a63b17749" FOREIGN KEY ("channel_id") REFERENCES "chat_channels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "FK_3c22dd60cf0850aa8ad2e300f12" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "FK_6d64168270374b1c03c74d7fed1" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_89c82485e364081f457b210120d" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_rules" ADD CONSTRAINT "FK_4dbfb9b1101937cc25c3361c149" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_55fa4db8406ed66bc7044328427" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_e248be0dccb26b1863e87828cda" FOREIGN KEY ("parentRoleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD CONSTRAINT "FK_187d573e43b2c2aa3960df20b78" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD CONSTRAINT "FK_a9c14741084d57ac0ec0cb52af3" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD CONSTRAINT "FK_1564421aeb8beb517219b10d1a7" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_assignments" ADD CONSTRAINT "FK_5a3da3ffc7e3502cfeab212b043" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_assignments" ADD CONSTRAINT "FK_647779813dec7e65a4f57bf878f" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "regularization_requests" ADD CONSTRAINT "FK_0d0bda2b5b9e423d4c40130311e" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance_records" ADD CONSTRAINT "FK_2f86d1ade33d4dbc029e216904a" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" ADD CONSTRAINT "FK_94349daf29f445266f3dddc4df9" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" ADD CONSTRAINT "FK_35e8b4e59ccc8303f7872dffdd9" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_maintenances" ADD CONSTRAINT "FK_aea3770ae2c983b5fb4f58f2eed" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD CONSTRAINT "FK_2e847f9d0120b4ca0d7269dda0e" FOREIGN KEY ("categoryId") REFERENCES "asset_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD CONSTRAINT "FK_4e037e8c49994b6628232291d13" FOREIGN KEY ("assignedEmployeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rfq_vendors" ADD CONSTRAINT "FK_0ae43d53b2e54462fc2fe26b7be" FOREIGN KEY ("rfqsId") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "rfq_vendors" ADD CONSTRAINT "FK_fd25d2cd30167e79de2b48f0b08" FOREIGN KEY ("vendorsId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments_closure" ADD CONSTRAINT "FK_f23b3abb6caa54454a2a72da591" FOREIGN KEY ("id_ancestor") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments_closure" ADD CONSTRAINT "FK_276148abd382d667072d533af49" FOREIGN KEY ("id_descendant") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_closure" ADD CONSTRAINT "FK_76d496f6bbd3024bd7a51b0596b" FOREIGN KEY ("id_ancestor") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_closure" ADD CONSTRAINT "FK_3679053570c6066b1aab034116d" FOREIGN KEY ("id_descendant") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_closure" DROP CONSTRAINT "FK_3679053570c6066b1aab034116d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_closure" DROP CONSTRAINT "FK_76d496f6bbd3024bd7a51b0596b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments_closure" DROP CONSTRAINT "FK_276148abd382d667072d533af49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments_closure" DROP CONSTRAINT "FK_f23b3abb6caa54454a2a72da591"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rfq_vendors" DROP CONSTRAINT "FK_fd25d2cd30167e79de2b48f0b08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rfq_vendors" DROP CONSTRAINT "FK_0ae43d53b2e54462fc2fe26b7be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" DROP CONSTRAINT "FK_4e037e8c49994b6628232291d13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "assets" DROP CONSTRAINT "FK_2e847f9d0120b4ca0d7269dda0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_maintenances" DROP CONSTRAINT "FK_aea3770ae2c983b5fb4f58f2eed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" DROP CONSTRAINT "FK_35e8b4e59ccc8303f7872dffdd9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_assignments" DROP CONSTRAINT "FK_94349daf29f445266f3dddc4df9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attendance_records" DROP CONSTRAINT "FK_2f86d1ade33d4dbc029e216904a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "regularization_requests" DROP CONSTRAINT "FK_0d0bda2b5b9e423d4c40130311e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_assignments" DROP CONSTRAINT "FK_647779813dec7e65a4f57bf878f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift_assignments" DROP CONSTRAINT "FK_5a3da3ffc7e3502cfeab212b043"`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" DROP CONSTRAINT "FK_1564421aeb8beb517219b10d1a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" DROP CONSTRAINT "FK_a9c14741084d57ac0ec0cb52af3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "memberships" DROP CONSTRAINT "FK_187d573e43b2c2aa3960df20b78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "FK_e248be0dccb26b1863e87828cda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_55fa4db8406ed66bc7044328427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workflow_rules" DROP CONSTRAINT "FK_4dbfb9b1101937cc25c3361c149"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_89c82485e364081f457b210120d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" DROP CONSTRAINT "FK_6d64168270374b1c03c74d7fed1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" DROP CONSTRAINT "FK_3c22dd60cf0850aa8ad2e300f12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_9e5fc47ecb06d4d7b84633b1718"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_31c45c915d0e437e80a63b17749"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_4106f2a9b30c9ff2f717894a970"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_cf0a9fa48053d1f93da40713cc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_versions" DROP CONSTRAINT "FK_c27b53ecd7f95ba653fe06dd004"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_versions" DROP CONSTRAINT "FK_4ea14bf55da75a8c3997e745a28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_folders" DROP CONSTRAINT "FK_2d86266e371484540aebed96129"`,
    );
    await queryRunner.query(
      `ALTER TABLE "document_folders" DROP CONSTRAINT "FK_6278df42b5ac49dd4d1e07248fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bill_lines" DROP CONSTRAINT "FK_971c433d6f2ce1926847dd4b096"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_744697fee7edfaa490e40a92684"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chart_of_accounts" DROP CONSTRAINT "FK_696136b16d41cbf47ff3db72f75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_notes" DROP CONSTRAINT "FK_a85bd9f4e7e57d49f830f38b05d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoice_lines" DROP CONSTRAINT "FK_9f57f31e620fe759b452feb776e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "journal_lines" DROP CONSTRAINT "FK_3c913ef1f691ce5b2c490116309"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_logs" DROP CONSTRAINT "FK_8b76d8af2d52d34e27f39da75cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trip_logs" DROP CONSTRAINT "FK_218657125f7d1dab7c42a9e8005"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fuel_logs" DROP CONSTRAINT "FK_be5721763c9967c555e0b034a24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fuel_logs" DROP CONSTRAINT "FK_cd5ba12914e43f892b057f56c9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clearance_checklists" DROP CONSTRAINT "FK_a88b4df15b5e9ae01f6fe014d72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicles" DROP CONSTRAINT "FK_8ab940b0a05aed6c3d19d15ecbc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enps_responses" DROP CONSTRAINT "FK_6798efabf53ed1211aeaa7fc4f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "enps_responses" DROP CONSTRAINT "FK_4810e9eab86c1e3aa1609d1863d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exit_interviews" DROP CONSTRAINT "FK_697c5b6c6cdec3dc5a32866806b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "handbook_acknowledgments" DROP CONSTRAINT "FK_6f0541fd668293a0c0ef7c4e6b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "okr_checkins" DROP CONSTRAINT "FK_5b49b623a7607fb2bdb5579a2a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pip_action_plans" DROP CONSTRAINT "FK_2810a597f10cb66d5d1a32bd993"`,
    );
    await queryRunner.query(
      `ALTER TABLE "probation_records" DROP CONSTRAINT "FK_0c11526151f2c8ea1a9fbba56ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resignations" DROP CONSTRAINT "FK_78518f8d2f367864875fae1ed09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_change_requests" DROP CONSTRAINT "FK_0b33afecd828b25f7d5296c073b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_change_requests" DROP CONSTRAINT "FK_f07e854319aaae23099ef3dfd72"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_feedback" DROP CONSTRAINT "FK_5a58577cba8a2d7a9851df0a9ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_feedback" DROP CONSTRAINT "FK_721f972ca03f1f247432b9c11fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_a85b1d80f38b2e7e7b552fb0db6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_10b6a3c56e108899a65c42ae8fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_4bafb424c60a507741ea50a4dfc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_d48e88509b5c392d0a049abc475"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_c3c79e5a9d14a3d61c3acb00326"`,
    );
    await queryRunner.query(
      `ALTER TABLE "terminations" DROP CONSTRAINT "FK_5495b0d2fbfab5813e1ab3e9844"`,
    );
    await queryRunner.query(
      `ALTER TABLE "succession_plans" DROP CONSTRAINT "FK_57b75e15d8156ddff16cbf8d848"`,
    );
    await queryRunner.query(
      `ALTER TABLE "succession_plans" DROP CONSTRAINT "FK_bc15a5201373550bee2a77332b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "FK_aad86b11b62fdc756ebddad5ed2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "FK_1b3c7539dbe0c4de6e6ed2105da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "FK_a10b93c7e6fb050ccdf39ba707c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "FK_bc33921a2dfacec1c1d4cc73c8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP CONSTRAINT "FK_bdc656915841ad70efe4b52b183"`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" DROP CONSTRAINT "FK_4514eee9134f52ae51cc862a69c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" DROP CONSTRAINT "FK_aa572bae154904a33a982c0a539"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP CONSTRAINT "FK_15d796718c8a39b202a94d132f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP CONSTRAINT "FK_1f80204b37686f1eb6de680e228"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issues" DROP CONSTRAINT "FK_f197da4bcb55a790f4f220761c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issue_items" DROP CONSTRAINT "FK_fc920bb3138ea6e25735b8c3f57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issue_items" DROP CONSTRAINT "FK_63f90766e066afe8ac07f6afef8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_issue_items" DROP CONSTRAINT "FK_715176d173082fcc68d5cf8dec5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipts" DROP CONSTRAINT "FK_142420efaa301b518d3b3fe5822"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "FK_abfb87e5498b6594cb4db4c97f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "FK_f17bc9dedff0baf284be182d738"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "FK_e9dc7bf6f358e36e53fd7ec6438"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_receipt_items" DROP CONSTRAINT "FK_d1c1d80926f6e0eedd7b1473635"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_returns" DROP CONSTRAINT "FK_d2f3f26d010e3a77da0fea12d93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" DROP CONSTRAINT "FK_de6467ea1bf556b8a0243f44117"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" DROP CONSTRAINT "FK_be11bee076e7fff2d8160d7a7e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" DROP CONSTRAINT "FK_0e9d9fb79bb30df82dc4fa13b7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "goods_return_items" DROP CONSTRAINT "FK_5bcb2d70ba3c8543ec7fa8d9d6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "serial_numbers" DROP CONSTRAINT "FK_29541c4bc40a3305df6fe6a358e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "serial_numbers" DROP CONSTRAINT "FK_066abf627e8323e92b3884cc98c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "serial_numbers" DROP CONSTRAINT "FK_b864eadf2e9163a95b5c1b6953e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_counts" DROP CONSTRAINT "FK_a1c78084e4c5ae4da0df807dd52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" DROP CONSTRAINT "FK_53b5d96e3f984e73b0e06ab5b4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" DROP CONSTRAINT "FK_3b7a415c0afe009c431447b3ace"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" DROP CONSTRAINT "FK_d72da0a453e768414dd97659c54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" DROP CONSTRAINT "FK_fb1bf76e9ed0136b9942f821d28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_count_items" DROP CONSTRAINT "FK_25eb41f655643569f556dbcfa9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_77f13cc163fba94b261499f80fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_9f0bd61f665daa3c7d0b3de7179"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_2d118fa925e343f74b7dfe822ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_b1e10f38c51868fba8bac1e12c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_a3acb59db67e977be45e382fc56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" DROP CONSTRAINT "FK_22928dc6cdfdc43ef470de801f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfers" DROP CONSTRAINT "FK_684badd3999923339489222a0b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" DROP CONSTRAINT "FK_c92c45904b65a6ed07d66df5d1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" DROP CONSTRAINT "FK_8bc642bf502be113e499c92e498"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" DROP CONSTRAINT "FK_f3d2b9e6f306fc4a292c687a12d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_transfer_items" DROP CONSTRAINT "FK_703611513c4b899329a3da7a524"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" DROP CONSTRAINT "FK_1c68f14b41da6e5628da705fc26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" DROP CONSTRAINT "FK_e196ad8d0c5147f6e6c5694838d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" DROP CONSTRAINT "FK_cb8d33e25133677784bd758c4db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "racks" DROP CONSTRAINT "FK_6bfc6f7ee66b24adf1614399613"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bins" DROP CONSTRAINT "FK_9bbd97c43ad3a6a9e2f6e2400ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_1e0df1791c9344d4bdde694be60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_4eda1468756ca831495e308e407"`,
    );
    await queryRunner.query(
      `ALTER TABLE "compensatory_leaves" DROP CONSTRAINT "FK_161e5d311cb182c64565dfc323b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_logs" DROP CONSTRAINT "FK_79651ee81bc1e360484f6c25b62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_logs" DROP CONSTRAINT "FK_07e003f77596709ece14bc6ab0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT "FK_4774828fa74afb8dfc179dcd4bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT "FK_25951d6f023e6728c53c71ee6b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_orders" DROP CONSTRAINT "FK_5a85350ec657a0822a9c2f3196d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" DROP CONSTRAINT "FK_17c7df0ebef0385a9ae195378f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP CONSTRAINT "FK_43b33894ec24ad195df83376d5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workcenters" DROP CONSTRAINT "FK_21178784932d669bd842ffc5728"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_64c90edc7310c6be7c10c96f675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "advance_salary_requests" DROP CONSTRAINT "FK_96c46b1f1357253e50defc3516b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_bonuses" DROP CONSTRAINT "FK_6cbc1bbb92b2bbf08d4cf2ce59b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_repayments" DROP CONSTRAINT "FK_a2f0da4f5cd58b196e6db2d58e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_loans" DROP CONSTRAINT "FK_756d083b6a70057163b938ec133"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payslips" DROP CONSTRAINT "FK_3fa0aa64d0a6d751ea49e6cd804"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payslips" DROP CONSTRAINT "FK_900143f20e6cd2fc0153db2242c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos_orders" DROP CONSTRAINT "FK_5526f658821d92656e3d574c8e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos_orders" DROP CONSTRAINT "FK_550a08920612b2c29ec6c5f1fb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_salary_assignments" DROP CONSTRAINT "FK_7b7f77cf679133febcaa1103505"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employee_salary_assignments" DROP CONSTRAINT "FK_225f5e5255288ec53e58992b86c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_structure_components" DROP CONSTRAINT "FK_bafb0432d68b78f8a94a664c6ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_brackets" DROP CONSTRAINT "FK_826ede1e311ab2bf58d6b433136"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pos_sessions" DROP CONSTRAINT "FK_f00234155896c468de12b33a1a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "debit_notes" DROP CONSTRAINT "FK_2e34d74a3921c9c3add14488be3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "debit_notes" DROP CONSTRAINT "FK_07748243a96bc48a802bf454796"`,
    );
    await queryRunner.query(
      `ALTER TABLE "debit_notes" DROP CONSTRAINT "FK_bb024d397425c21a315be77e11d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_request_lines" DROP CONSTRAINT "FK_c43cec93aaf11c9d13b069da3f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_request_lines" DROP CONSTRAINT "FK_3bd8c74c238bb22c25c133f4830"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_request_lines" DROP CONSTRAINT "FK_5210ca32f60e6a0a93d0e3c5fc2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP CONSTRAINT "FK_130c83c1c96e6032efc950d6458"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP CONSTRAINT "FK_ac5ca8ec3a802456bfb50492593"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bills" DROP CONSTRAINT "FK_a8468c713028b8b45a921b9d320"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grn_lines" DROP CONSTRAINT "FK_ac31c3660c1dcf0517f1d3574c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grn_lines" DROP CONSTRAINT "FK_7ed4eb46f35585faffc18b4c549"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grn_lines" DROP CONSTRAINT "FK_74a37d3f07f749c50343ea4f0b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grns" DROP CONSTRAINT "FK_359b161d0799acfc6ea53b95fcb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_order_lines" DROP CONSTRAINT "FK_0725cd52f439e7e6143b9ad3e89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_order_lines" DROP CONSTRAINT "FK_d96db03df749514dd9b5f36ad2b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_order_lines" DROP CONSTRAINT "FK_64a3df78c26adc62cbcf15aa4a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_e04bec5cd5b302470c3ae474e1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_25f92b70826ec7214cd84aac124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "uom_conversions" DROP CONSTRAINT "FK_84eca0e11364ff12dfdef75e954"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_evaluations" DROP CONSTRAINT "FK_a6faf67c5319d82be64da563d07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "change_requests" DROP CONSTRAINT "FK_d099a3a9b5e5d4c93746cf52636"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_risks" DROP CONSTRAINT "FK_f8e1e857c806d91d7b5162878e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_logs" DROP CONSTRAINT "FK_8709d71991ce15614b1e4a6f43d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "milestones" DROP CONSTRAINT "FK_7a41bdfa037d90091ccbff6f4d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "milestones" DROP CONSTRAINT "FK_662a1f9d865fe49768fa369fd0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_checklists" DROP CONSTRAINT "FK_389d776b36bd41f3eba63ffad56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requisitions" DROP CONSTRAINT "FK_a39d112be9a455e2ff6e8ae233a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_requisitions" DROP CONSTRAINT "FK_a667151016362c55c0a446c5084"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_a34254e3f2b3d20f07f8dbd6322"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT "FK_f6ebb8bc5061068e4dd97df3c77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_letters" DROP CONSTRAINT "FK_d0aca0fed9e07d4504766f34eab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_ba82c76bf124871821aedc35b7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_2c0c254d34be97f6982d3138fc7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_8d81e3056a198f0ed3010da4cca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_114e0dcfc1b75a6e39ff7115dab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_62adbe4a1956a8be9436f8e74ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_8eed4bfc75840eeb9780f017e9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_0ee1fa8d2cfe91f9dac54f9e2ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "FK_4edfe103ebf2fcb98dbb582554b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_history" DROP CONSTRAINT "FK_a93378a0e7880816ed629a7178f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_history" DROP CONSTRAINT "FK_1eccee82fc9fce30d20fc7ef418"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employment_history" DROP CONSTRAINT "FK_18678c6c48d6381d4e49a2ea0ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_26c8395a5e07cd9ade10f0fd50c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_3e63260109cfd258cabedb17e63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" DROP CONSTRAINT "FK_c22623563ce6234e5df0fac9cae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "trainings" DROP CONSTRAINT "FK_f3557a48337a1de31e92fa8b139"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_history" DROP CONSTRAINT "FK_97e8145357ebf19a056f0c2e1d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "key_results" DROP CONSTRAINT "FK_5bfa77e448b5900fd59bd7db2af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "performance_reviews" DROP CONSTRAINT "FK_89c1585d31979b8f709928bd2bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pinned_reports" DROP CONSTRAINT "FK_cbb2b8ead8aafe4bd39e0d2b5fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pinned_reports" DROP CONSTRAINT "FK_b6454119157bcbbce618c2e0937"`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_schedules" DROP CONSTRAINT "FK_a17063e48b705d8fa677bdd8497"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_order_lines" DROP CONSTRAINT "FK_d905b3c5cb56d64bdbcc85e7a98"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_orders" DROP CONSTRAINT "FK_78dda146edfef4e07f5cc987ffa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricelist_items" DROP CONSTRAINT "FK_7df0f5bf08517096ce62ed0e321"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_order_lines" DROP CONSTRAINT "FK_c8335d5de22aaa49db80418e3b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP CONSTRAINT "FK_0115a9e047063b8b78326979dd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales_orders" DROP CONSTRAINT "FK_01722fa36be5da34ca66c3d88ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotation_lines" DROP CONSTRAINT "FK_3bcebd04377d4c558966f62067c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotations" DROP CONSTRAINT "FK_30fa5e15a35cd8709889074c4f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotations" DROP CONSTRAINT "FK_f1384b2fb0f48b6f8d57e20d2cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotations" DROP CONSTRAINT "FK_887501e14713d6b541feb72ba1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_5363bc1655a7339414523a02fd4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kb_articles" DROP CONSTRAINT "FK_6a2284e667762b218350f9d0464"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kb_articles" DROP CONSTRAINT "FK_d32661585d173919bd2ebe25a3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_slas" DROP CONSTRAINT "FK_2846638d9193732b802801cda33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_4f127f7c92139971ec4cbbe0bd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_ffff1b4554585c0c9b95d062605"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_d5846dd4a05e2687016f9364c5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_messages" DROP CONSTRAINT "FK_ddea80824c24d270ef2cb4cb0ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ticket_messages" DROP CONSTRAINT "FK_b01e2a35417efbe04c10828266f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_steps" DROP CONSTRAINT "FK_61e90eb0fc5abc6092a99e468c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_cfa83f61e4d27a87fcae1e025ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_logs" DROP CONSTRAINT "FK_de9216bb1b30b45bf99cc378bac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "holidays" DROP CONSTRAINT "FK_7bcd0913f21832292fbfc2cc5fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP CONSTRAINT "FK_1fd154de0075f094be611bed079"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_notifications" DROP CONSTRAINT "FK_e4ea87d7d65b977b462fe4d81ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_custom_domains" DROP CONSTRAINT "FK_34e059686802df8426788ef4c51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_modules" DROP CONSTRAINT "FK_54b5bb2fadb6ada4fe57a9e2701"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_deliveries" DROP CONSTRAINT "FK_6847e0fbfa8c5b91eab52b321eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_calendars" DROP CONSTRAINT "FK_340fd6656b7e62c3087370a01ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_dashboard_widgets" DROP CONSTRAINT "FK_c109d117e020e890425064fd189"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_440f531f452dcc4389d201b9d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_022a2621dcb8e0719d7596db4f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eb2bdc79ded5753e40f98ade47"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_853e9a4227edce0bbb7a54fbb2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77c3c1f412aa3e75a77cf2f6ec"`,
    );
    await queryRunner.query(`ALTER TABLE "login_events" DROP COLUMN "country"`);
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "country" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "login_events" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "city" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "userAgent"`,
    );
    await queryRunner.query(`ALTER TABLE "login_events" ADD "userAgent" text`);
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "ipAddress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "ipAddress" character varying(45)`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "dueDate"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "dueDate" date NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'DRAFT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "bom_items" ALTER COLUMN "quantity" TYPE numeric(10,4)`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "failureReason"`,
    );
    await queryRunner.query(`ALTER TABLE "login_events" DROP COLUMN "result"`);
    await queryRunner.query(`DROP TYPE "public"."login_events_result_enum"`);
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "deviceType"`,
    );
    await queryRunner.query(`ALTER TABLE "login_events" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "paymentProvider"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "stripeInvoiceId"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "pdfUrl"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "hostedInvoiceUrl"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "currency"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "amountRemaining"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "amountPaid"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "amountDue"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "tenantId"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "notes"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "isTaxInvoice"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "isProforma"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "paidAmount"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "totalAmount"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "taxAmount"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "subtotal"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "issueDate"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "customerEmail"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "customerName"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "customerId"`);
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "invoiceNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "variantId"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "productId"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "bom_items" DROP COLUMN "uom"`);
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP COLUMN "componentVariantId"`,
    );
    await queryRunner.query(`ALTER TABLE "bom_items" DROP COLUMN "tenant_id"`);
    await queryRunner.query(`ALTER TABLE "bom_items" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "bom_items" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "bom_items" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "version"`);
    await queryRunner.query(
      `ALTER TABLE "boms" DROP COLUMN "finishedProductId"`,
    );
    await queryRunner.query(`ALTER TABLE "boms" DROP COLUMN "tenantId"`);
    await queryRunner.query(
      `ALTER TABLE "bom_items" DROP COLUMN "unitOfMeasure"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" DROP COLUMN "deviceFingerprint"`,
    );
    await queryRunner.query(
      `ALTER TABLE "login_events" ADD "deviceFingerprint" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" ADD "notes" text`);
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "isTaxInvoice" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "isProforma" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "paidAmount" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "totalAmount" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "taxAmount" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "subtotal" numeric(14,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "issueDate" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "customerEmail" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "customerName" character varying(150) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "invoices" ADD "customerId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "invoiceNumber" character varying(30) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d" UNIQUE ("invoiceNumber")`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "tenant_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_440f531f452dcc4389d201b9d4" ON "invoices" ("tenant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "version" character varying(50) NOT NULL DEFAULT 'v1.0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "boms" ADD "finishedProductId" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "boms" ADD "tenantId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "bom_items" ADD "unitOfMeasure" character varying(20) NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3679053570c6066b1aab034116"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76d496f6bbd3024bd7a51b0596"`,
    );
    await queryRunner.query(`DROP TABLE "tasks_closure"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_276148abd382d667072d533af4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f23b3abb6caa54454a2a72da59"`,
    );
    await queryRunner.query(`DROP TABLE "departments_closure"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd25d2cd30167e79de2b48f0b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0ae43d53b2e54462fc2fe26b7b"`,
    );
    await queryRunner.query(`DROP TABLE "rfq_vendors"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_000a1e0b494ed91ad742b8274b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9869482e2463f384e89235e2f9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35832939b4bc039606a21fc27e"`,
    );
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(
      `DROP TYPE "public"."assets_depreciationmethod_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."assets_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bbce116650d92aa889aa68163a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e660b824be916e448462bcd88a"`,
    );
    await queryRunner.query(`DROP TABLE "asset_maintenances"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_553c1112d03004a3f3babe1810"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1505599191c234b3656e32a7f9"`,
    );
    await queryRunner.query(`DROP TABLE "asset_assignments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b227bf10736bf8101c3a439078"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0627acc42a45f2b588d3a22795"`,
    );
    await queryRunner.query(`DROP TABLE "asset_categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4736a70eee44d666be17296a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da9dd4e1e5a31c92c38a401ea5"`,
    );
    await queryRunner.query(`DROP TABLE "attendance_records"`);
    await queryRunner.query(
      `DROP TYPE "public"."attendance_records_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."attendance_records_method_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2227475c7de8f4db3b856e4c08"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_371e2d8a39e7beee53124f8bb4"`,
    );
    await queryRunner.query(`DROP TABLE "regularization_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."regularization_requests_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5cd42f208433f589fc5feae050"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4def61dcd02b389c3bd9994aaf"`,
    );
    await queryRunner.query(`DROP TABLE "shift_rotations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c596b9503423e1e143602b87e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bd1a808b07ead1271c932775f5"`,
    );
    await queryRunner.query(`DROP TABLE "shift_assignments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46f10de4c17b8fd18fa76d1c08"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc45487e499df9b27eb7a4c44e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a9c14741084d57ac0ec0cb52af"`,
    );
    await queryRunner.query(`DROP TABLE "memberships"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_648e3f5447f725579d7d4ffdfb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_60becd9578c65d9821e8db55ef"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e59a01f4fe46ebbece575d9a0f"`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b58a8f1e3bbaeab702f56ab8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55fa4db8406ed66bc704432842"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_be32da751c6ec479acf19efcf5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_80f606357d45ea2034532c902c"`,
    );
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "workflow_rules"`);
    await queryRunner.query(`DROP TABLE "tenant_subscriptions"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9e5fc47ecb06d4d7b84633b171"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_31c45c915d0e437e80a63b1774"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b80ecd72bc38bc692a0cc18238"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2e818d30c3c802e361e8bc6206"`,
    );
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f61a618bb6b1131af1dc56ba0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7fdec14a661dd345dae5ffc587"`,
    );
    await queryRunner.query(`DROP TABLE "chat_channels"`);
    await queryRunner.query(`DROP TYPE "public"."chat_channels_type_enum"`);
    await queryRunner.query(`DROP TABLE "tax_filing_exports"`);
    await queryRunner.query(`DROP TABLE "tax_rules"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cf0a9fa48053d1f93da40713cc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_968df1869955e5f4f8fcf4b6a1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5109a94ccfd3f39bf4a7a1e1fa"`,
    );
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8b03b17df5b0c7b2657cc088ec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7dd57ce45ece40350a0d13997"`,
    );
    await queryRunner.query(`DROP TABLE "document_versions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6278df42b5ac49dd4d1e07248f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_473c0b4336c5d9fa6f76f793c7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_14c8824d6093c2907392b0f73e"`,
    );
    await queryRunner.query(`DROP TABLE "document_folders"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e7c8a5ccf7e2dd046c16d04bbf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4724622ba0625eec688ec9e50"`,
    );
    await queryRunner.query(`DROP TABLE "accounting_periods"`);
    await queryRunner.query(
      `DROP TYPE "public"."accounting_periods_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c48e666185b068d1a201bdc4c8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_375b59e4ed40458ac1bcf24be9"`,
    );
    await queryRunner.query(`DROP TABLE "bill_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ab815ae0848cd7785d224c4b7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b26a4887deed791809fc4f5851"`,
    );
    await queryRunner.query(`DROP TABLE "bills"`);
    await queryRunner.query(`DROP TYPE "public"."bills_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a1d2eb5972d6ad38041ae1cd55"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9057940c4364457372df6b57ed"`,
    );
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_93ec090b284f1a0b89785fcb65"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc82c9b1ae99234c8b1e3be2a6"`,
    );
    await queryRunner.query(`DROP TABLE "chart_of_accounts"`);
    await queryRunner.query(`DROP TYPE "public"."chart_of_accounts_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae58dc0b41c80ad956fcb21182"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_706e625e5464d6ef023cfd6500"`,
    );
    await queryRunner.query(`DROP TABLE "bank_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."bank_transactions_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88fc65874e101b9828b0f64989"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ebbdbbe47befba418da6ee901c"`,
    );
    await queryRunner.query(`DROP TABLE "bank_accounts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2bf211525e98efa479585e0fdc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_900fe77c3821aef9480b1045dc"`,
    );
    await queryRunner.query(`DROP TABLE "cost_centers"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cd4ea05b125561f47a073aa14e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4fe4a18955d5c8aa11452c82cb"`,
    );
    await queryRunner.query(`DROP TABLE "expense_claims"`);
    await queryRunner.query(`DROP TYPE "public"."expense_claims_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e66ac1c874970121cb142e04ce"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_07fabaca2cbf06c08c6c877d03"`,
    );
    await queryRunner.query(`DROP TABLE "credit_notes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c0a384460e53da0afbc527a759"`,
    );
    await queryRunner.query(`DROP TABLE "currency_rates"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_48c20d142c1b60b62e135308b5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_afed06c7cc182ba8cb633d6478"`,
    );
    await queryRunner.query(`DROP TABLE "invoice_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_701ba9039b36234c51b66a23b5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_440f531f452dcc4389d201b9d4"`,
    );
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9e2d015f25426b46a5341fa86a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_07bbdad69a6b3f4982d0663fe7"`,
    );
    await queryRunner.query(`DROP TABLE "journal_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d500cc6aab57d20dea0294946"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58fffc97d300e8164ccd16fc06"`,
    );
    await queryRunner.query(`DROP TABLE "journal_entries"`);
    await queryRunner.query(`DROP TYPE "public"."journal_entries_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9538b410fd9008ff9d6e43bda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_679015f670e051f09710a61cd1"`,
    );
    await queryRunner.query(`DROP TABLE "recurring_invoices"`);
    await queryRunner.query(
      `DROP TYPE "public"."recurring_invoices_frequency_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_54181a6c48b06b6cb4a69eb319"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76e456c7762f248299a5578321"`,
    );
    await queryRunner.query(`DROP TABLE "recurring_journals"`);
    await queryRunner.query(
      `DROP TYPE "public"."recurring_journals_frequency_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ce666aa141246f686b484e0dd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a24bb53614cf26348612d5a421"`,
    );
    await queryRunner.query(`DROP TABLE "petty_cash_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."petty_cash_transactions_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c63e11bd9d6dc1d8ff6ccbf6d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_33efa5e44c1adf8b0555e7863c"`,
    );
    await queryRunner.query(`DROP TABLE "petty_cash_funds"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a609e2d39bc2edb90198595116"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9675366aed16a56e6c9322805f"`,
    );
    await queryRunner.query(`DROP TABLE "tax_rates"`);
    await queryRunner.query(`DROP TABLE "trip_logs"`);
    await queryRunner.query(`DROP TABLE "fuel_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d0b142d9ab266ee76ab9200a90"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18be8ec39b9944634a4937cb30"`,
    );
    await queryRunner.query(`DROP TABLE "clearance_checklists"`);
    await queryRunner.query(`DROP TABLE "vehicles"`);
    await queryRunner.query(`DROP TYPE "public"."vehicles_fueltype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_faa3f24037f47a5628a1e236e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2763048ccb5e83db297529a6ad"`,
    );
    await queryRunner.query(`DROP TABLE "enps_responses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85c5a7ea25a4526cda9888a698"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98ec45b828797a51c2691ac7ff"`,
    );
    await queryRunner.query(`DROP TABLE "enps_surveys"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1aa2d9915cf130a8b9a5826e9e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc3b7fe42a2ed6a3019282f7ef"`,
    );
    await queryRunner.query(`DROP TABLE "exit_interviews"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_186773ac9cc0099dfaef35761e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6b86ca14c471548c4ce7abe74f"`,
    );
    await queryRunner.query(`DROP TABLE "handbook_acknowledgments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5657a6627ea258f7370184f4cc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4bf82b213fb3df368be5574b19"`,
    );
    await queryRunner.query(`DROP TABLE "handbooks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0b23083035e29038c606e52e13"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f002bab5c71122536e5d1eb9a"`,
    );
    await queryRunner.query(`DROP TABLE "okr_checkins"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d36d5671e43fa272f88e46012a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a255e8aac14f425a49ef59a54c"`,
    );
    await queryRunner.query(`DROP TABLE "pip_action_plans"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e7c0278bcf2bd0e77f70131b55"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0d1af1054ebe6dedc8bb56dfe1"`,
    );
    await queryRunner.query(`DROP TABLE "probation_records"`);
    await queryRunner.query(
      `DROP TYPE "public"."probation_records_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4da1bd76f49d1ecc3193cdf591"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_526e93b2017a0bd5bdfd917979"`,
    );
    await queryRunner.query(`DROP TABLE "resignations"`);
    await queryRunner.query(`DROP TYPE "public"."resignations_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2df7e070f34de19afb09b4e68b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7f7a5b6e29cd2ae824c8f293b"`,
    );
    await queryRunner.query(`DROP TABLE "profile_change_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."profile_change_requests_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_830a162444035680d61410fb7a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7b6dd8ca26b7f9da6cf9fbebc9"`,
    );
    await queryRunner.query(`DROP TABLE "review_feedback"`);
    await queryRunner.query(`DROP TYPE "public"."review_feedback_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_21af60ca9da1c46e526cc05290"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_499295747fb72467c68861d252"`,
    );
    await queryRunner.query(`DROP TABLE "salary_revisions"`);
    await queryRunner.query(
      `DROP TYPE "public"."salary_revisions_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc7317789d8500fcdc4beee623"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2eacb57711891d6bba88eed9c5"`,
    );
    await queryRunner.query(`DROP TABLE "terminations"`);
    await queryRunner.query(`DROP TYPE "public"."terminations_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ca1d939fa071ddebfaaa9a213d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_718ceca522c7e57cd6e0ca71be"`,
    );
    await queryRunner.query(`DROP TABLE "succession_plans"`);
    await queryRunner.query(
      `DROP TYPE "public"."succession_plans_readiness_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65b404240970520c0cedd492c3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a9424c9d3e78b144eaa986877"`,
    );
    await queryRunner.query(`DROP TABLE "transfer_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."transfer_requests_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5f1268251d7668b17ebb94ca8c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f9ae600537318189127a7af52"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_621e74008288050a6c8112d972"`,
    );
    await queryRunner.query(`DROP TABLE "webhook_delivery_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c6f761e1c162c67ae3b863d877"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_54847f2dacee9618585993f147"`,
    );
    await queryRunner.query(`DROP TABLE "webhook_endpoints"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52382f1e7844f384bad0a8367d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b73e21c563e949925b9592170"`,
    );
    await queryRunner.query(`DROP TABLE "goods_issues"`);
    await queryRunner.query(`DROP TYPE "public"."goods_issues_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aac4f4555aba1cdddbff930a4d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9284a04728c8bdc0cb760518b3"`,
    );
    await queryRunner.query(`DROP TABLE "goods_issue_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5cdf1e3ba850c33f26685891fa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e8e9593e8a5df1114a25621d24"`,
    );
    await queryRunner.query(`DROP TABLE "goods_receipts"`);
    await queryRunner.query(`DROP TYPE "public"."goods_receipts_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f45081c833744c54c9cd07ac2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5164f330018a8eed6ca3300cab"`,
    );
    await queryRunner.query(`DROP TABLE "goods_receipt_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_201b019f4acf31cbc6f5e4c17e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_15bd8bf926004653951004154c"`,
    );
    await queryRunner.query(`DROP TABLE "goods_returns"`);
    await queryRunner.query(`DROP TYPE "public"."goods_returns_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a220dea6b746c1ba085e3196da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b11509631a1a2d8d9346911694"`,
    );
    await queryRunner.query(`DROP TABLE "goods_return_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac9aad34b652b4cbf5224e690f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e2d1d95e2885de51851ec8f4e"`,
    );
    await queryRunner.query(`DROP TABLE "serial_numbers"`);
    await queryRunner.query(`DROP TYPE "public"."serial_numbers_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e90cc53c09bd5501427daa176f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7aa52aa028154bd731639af9f"`,
    );
    await queryRunner.query(`DROP TABLE "stock_counts"`);
    await queryRunner.query(`DROP TYPE "public"."stock_counts_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9ba1d378da6d2793db7dce7c74"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de447d97603e477d2a86002dd4"`,
    );
    await queryRunner.query(`DROP TABLE "stock_count_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ccd8bb010f89e0b9c69ae6eadc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30dd9acc22dcb6ae51d7d34f16"`,
    );
    await queryRunner.query(`DROP TABLE "stock_movements"`);
    await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_955395e1a49b1407122a6c6a0f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65e78a521cbef64720491f3a0d"`,
    );
    await queryRunner.query(`DROP TABLE "stock_transfers"`);
    await queryRunner.query(`DROP TYPE "public"."stock_transfers_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c67c0805e173b021e856296410"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6bbf0b8664e146bfd40c81c0df"`,
    );
    await queryRunner.query(`DROP TABLE "stock_transfer_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd8500755c0cca86238626b9e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a31c93f696dc66dc9a851673cd"`,
    );
    await queryRunner.query(`DROP TABLE "batches"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5727f1792ab72ca1376ee80030"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09106b8068aeaf74fa33666df8"`,
    );
    await queryRunner.query(`DROP TABLE "warehouses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1d057e3cb6c6cded11f97d8286"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fcae1bddaa5875b4f0e07ae64a"`,
    );
    await queryRunner.query(`DROP TABLE "zones"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad64511239bf69bde5617a5d8f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a6ce3ed68d0f8804b8023a19db"`,
    );
    await queryRunner.query(`DROP TABLE "racks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b45beb0fe3fb4a652a7371676"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5645ffd44f3bf2277e587ae766"`,
    );
    await queryRunner.query(`DROP TABLE "bins"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b9c09192742ceae43c93cfb88"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76bef7ed9ea69530e387826f43"`,
    );
    await queryRunner.query(`DROP TABLE "leave_balances"`);
    await queryRunner.query(
      `DROP TYPE "public"."leave_balances_leavetype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3f5c284ffe934329d276f30a05"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c0727a131644d680e44c3d2aa"`,
    );
    await queryRunner.query(`DROP TABLE "leave_requests"`);
    await queryRunner.query(`DROP TYPE "public"."leave_requests_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."leave_requests_leavetype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cce7ad7f9ebb439e20543ffb21"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3768f83f9db02034ae045ce541"`,
    );
    await queryRunner.query(`DROP TABLE "compensatory_leaves"`);
    await queryRunner.query(`DROP TABLE "production_logs"`);
    await queryRunner.query(`DROP TABLE "work_orders"`);
    await queryRunner.query(`DROP TYPE "public"."work_orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "boms"`);
    await queryRunner.query(`DROP TABLE "bom_items"`);
    await queryRunner.query(`DROP TABLE "workcenters"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64c90edc7310c6be7c10c96f67"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a7e15c143ae2aa2aefec3417b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e907e614e2cc6216ac076eb75e"`,
    );
    await queryRunner.query(`DROP TABLE "notification_preferences"`);
    await queryRunner.query(
      `DROP TYPE "public"."notification_preferences_channel_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notification_preferences_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f12148ce379462ebbb4d06cc13"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_519d212c491ea2aff5ad82ac3d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d93ddd7e1b890535ecafbb334e"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b06f7177cb3b1dcb748fa1481c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e367a14658fd4e5c507423a6e"`,
    );
    await queryRunner.query(`DROP TABLE "advance_salary_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."advance_salary_requests_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_47208daabdabefe8c18e6d083a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3350edd72ca348b7b5dbce3e7"`,
    );
    await queryRunner.query(`DROP TABLE "employee_bonuses"`);
    await queryRunner.query(`DROP TYPE "public"."employee_bonuses_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_747b67876a3c6af38b121d7e18"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6d1c0db21210c823ccda427672"`,
    );
    await queryRunner.query(`DROP TABLE "loan_repayments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9eeaf9f904996862da25e67c2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d77e56bd972d4d1ea8b8e3a688"`,
    );
    await queryRunner.query(`DROP TABLE "employee_loans"`);
    await queryRunner.query(`DROP TYPE "public"."employee_loans_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_882f55c0201c1858311150cd0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_897223477c94fd2c79e5859bd1"`,
    );
    await queryRunner.query(`DROP TABLE "payroll_audits"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3085b67f89380813f9e0e369cd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_40956e26bd6c726a7109991745"`,
    );
    await queryRunner.query(`DROP TABLE "payslips"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_26c55b8bb2199316450555859d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90dca85e9c4fbf1363e6732386"`,
    );
    await queryRunner.query(`DROP TABLE "payroll_runs"`);
    await queryRunner.query(`DROP TYPE "public"."payroll_runs_status_enum"`);
    await queryRunner.query(`DROP TABLE "pos_orders"`);
    await queryRunner.query(
      `DROP TYPE "public"."pos_orders_paymentmethod_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dabad418a48107967ef6437555"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3caa2e877e4a7f80a8baa1a33c"`,
    );
    await queryRunner.query(`DROP TABLE "employee_salary_assignments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5e027c382da6175c4d6634283d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_356b50f7fa9976bd44c7596079"`,
    );
    await queryRunner.query(`DROP TABLE "salary_structure_components"`);
    await queryRunner.query(
      `DROP TYPE "public"."salary_structure_components_amounttype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."salary_structure_components_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b5f08b63acec4707f95ace076"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fed7166a2462f813fc0ddc77f3"`,
    );
    await queryRunner.query(`DROP TABLE "salary_structures"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9dcd2f3e541400516b9fde9324"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f2c1816a1f0f59f2be11221df6"`,
    );
    await queryRunner.query(`DROP TABLE "tax_brackets"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_df85f97c8b2d54f42dddd3f7a0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_696d1233169ba26d82898b874a"`,
    );
    await queryRunner.query(`DROP TABLE "tax_configurations"`);
    await queryRunner.query(`DROP TABLE "pos_sessions"`);
    await queryRunner.query(`DROP TYPE "public"."pos_sessions_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd100f4aa220f7b6acb2f30a94"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_772ee6e70f320ca44803e673b4"`,
    );
    await queryRunner.query(`DROP TABLE "approval_matrices"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd76b3e97d644800d554f44a61"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65ea41ec57af9303a0b59b5715"`,
    );
    await queryRunner.query(`DROP TABLE "debit_notes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c64a35cce3a3a5e0fbf9f9c8c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e8279642c07dc55c737d95057"`,
    );
    await queryRunner.query(`DROP TABLE "purchase_request_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6b7927b20b0a86c385a0ca1dc6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bd9d53fb1686e85de185f247c7"`,
    );
    await queryRunner.query(`DROP TABLE "purchase_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."purchase_requests_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f9489e32690edb08c2bf7cc074"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ce0fd3868fcb4f4296a3435e3e"`,
    );
    await queryRunner.query(`DROP TABLE "vendor_bills"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_bills_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0efc076ac74a997630196b8b6b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25489b3b44a530d3eb05e25573"`,
    );
    await queryRunner.query(`DROP TABLE "grn_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da5e636533dd5e2ac0b8071aeb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d7e1aca3b12d4aaf8624b11da"`,
    );
    await queryRunner.query(`DROP TABLE "grns"`);
    await queryRunner.query(`DROP TYPE "public"."grns_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0baf7a7704bdcfe35a6fe05558"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c07c8a298555beb9a5064d53da"`,
    );
    await queryRunner.query(`DROP TABLE "purchase_order_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1230ebe7ada6874d51ae7cc7e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_237678c98436e0abb48b3060c8"`,
    );
    await queryRunner.query(`DROP TABLE "purchase_orders"`);
    await queryRunner.query(`DROP TYPE "public"."purchase_orders_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6fab7980dee7f667919aa5e635"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9c365ebf78f0e8a6d9e4827ea7"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(
      `DROP TYPE "public"."products_valuationmethod_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c28263b2cfd3c40f088fba4a61"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_733a70ae1715444ea650e8dbe9"`,
    );
    await queryRunner.query(`DROP TABLE "uom_groups"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a649b4a97fc5d4dd61ebf89f2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0db848b27dce0f6e1cfb631149"`,
    );
    await queryRunner.query(`DROP TABLE "uom_conversions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3f9e26be7d50edd427c10c066"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_553196ea54b383f352401962af"`,
    );
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7356cedb29360573544b67414e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_236caa44b8850e80897299c242"`,
    );
    await queryRunner.query(`DROP TABLE "vendor_quotes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_692518395c8a81d6f0c8b80f48"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_31b0e677d1904b7b9a05e13096"`,
    );
    await queryRunner.query(`DROP TABLE "rfqs"`);
    await queryRunner.query(`DROP TYPE "public"."rfqs_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0135c067b07612af838a214432"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_594509ecef7e59bb099064bab5"`,
    );
    await queryRunner.query(`DROP TABLE "vendor_evaluations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ea83897560422b86c2035c518d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b362795545b91a886939d70bea"`,
    );
    await queryRunner.query(`DROP TABLE "vendors"`);
    await queryRunner.query(`DROP TYPE "public"."vendors_approvalstatus_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendors_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendors_kycstatus_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92928c32c4decb05673e345d4f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_772bdc15815215f6de07acb7ef"`,
    );
    await queryRunner.query(`DROP TABLE "change_requests"`);
    await queryRunner.query(`DROP TYPE "public"."change_requests_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c493bfe11259b1bedbd33ceade"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_873d5ab2ea2525c9b5d0588b4c"`,
    );
    await queryRunner.query(`DROP TABLE "project_risks"`);
    await queryRunner.query(`DROP TYPE "public"."project_risks_impact_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."project_risks_probability_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b746f5099d59bee9e702552d0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_84931c86d4788733bfc797caf3"`,
    );
    await queryRunner.query(`DROP TABLE "project_templates"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3537e1be00780488c17f1e9b85"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6d9bdde8d29a6fd880ac59c1ae"`,
    );
    await queryRunner.query(`DROP TABLE "time_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20d090a7b83189b4cddb3e3d0e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_93edccfc42408754c4b5957105"`,
    );
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_212a881c3793c0716030315e9e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7393a03ef67e2ea91b81faa95d"`,
    );
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TYPE "public"."projects_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65c3b3118a5d0622bbe9caec8f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_842f056598c175ea4ef4f8ef2a"`,
    );
    await queryRunner.query(`DROP TABLE "milestones"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82c239772341bb896cd00f9edd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ddac109473cc2631c5752d0a05"`,
    );
    await queryRunner.query(`DROP TABLE "timesheets"`);
    await queryRunner.query(`DROP TYPE "public"."timesheets_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c3fc8c7b8f26377f293d948eb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7d2bcca3d7deb5d8cde7f3f181"`,
    );
    await queryRunner.query(`DROP TABLE "onboarding_checklists"`);
    await queryRunner.query(
      `DROP TYPE "public"."onboarding_checklists_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1bd644475502a17c42538f2d51"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d37f740a9bffa98e1fa6092136"`,
    );
    await queryRunner.query(`DROP TABLE "onboarding_templates"`);
    await queryRunner.query(
      `DROP TYPE "public"."onboarding_templates_employmenttype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9de9befd2fd92077e68be94bec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a57e9dc6a87e59ff40717ca2bb"`,
    );
    await queryRunner.query(`DROP TABLE "job_requisitions"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_requisitions_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_requisitions_employmenttype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e6d341fb81d849455ed1bf4cb0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06b5376fd696c7bffaaa6109fc"`,
    );
    await queryRunner.query(`DROP TABLE "applications"`);
    await queryRunner.query(`DROP TYPE "public"."applications_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17377f751da5480864381d56c1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c9835adc65f9cb17b41b4eeab"`,
    );
    await queryRunner.query(`DROP TABLE "offer_letters"`);
    await queryRunner.query(`DROP TYPE "public"."offer_letters_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0d992b2ccab4060a96680553e9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9fe747f64e2102d4e751b2af71"`,
    );
    await queryRunner.query(`DROP TABLE "interviews"`);
    await queryRunner.query(`DROP TYPE "public"."interviews_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8c78ca63bf53015b496ea93606"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f05c4cdcdc57d7d3cb0ef129d3"`,
    );
    await queryRunner.query(`DROP TABLE "candidates"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e01980924b4eff539fab6b328d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_146fd7019eea73f8ee7bbb52d4"`,
    );
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_765bc1ac8967533a04c74a9f6a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_570fb0c72ffd2f871f4c9c2b45"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_588d18aeef0504067e40c68278"`,
    );
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TYPE "public"."employees_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."employees_employmenttype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."employees_gender_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_653511fcb39d218b7854fda07b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90413bab4120ede23bb4716877"`,
    );
    await queryRunner.query(`DROP TABLE "shifts"`);
    await queryRunner.query(`DROP TYPE "public"."shifts_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7030ed2c09624fc10881a52eda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_01608a2a7c5d120b85568a30bb"`,
    );
    await queryRunner.query(`DROP TABLE "employment_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."employment_history_event_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9dea84eea18d3343f6873d892c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f870d09eaf096c4aac16464342"`,
    );
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2488e9151e31a8be8aee2fe16c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a94ef7659b02da50bb09e64e3d"`,
    );
    await queryRunner.query(`DROP TABLE "skill_catalog"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd80e1f4c5cc9301d1a7a65434"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_03534838c8b2a401abe3611016"`,
    );
    await queryRunner.query(`DROP TABLE "trainings"`);
    await queryRunner.query(`DROP TYPE "public"."trainings_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9192bddaf85e13eb854f5f3946"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e02bec61f51859b88d42744145"`,
    );
    await queryRunner.query(`DROP TABLE "training_courses"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58f07ee38f7163e637be553646"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0ef7f5060fc7c9f8eec0fa460f"`,
    );
    await queryRunner.query(`DROP TABLE "salary_history"`);
    await queryRunner.query(`DROP TYPE "public"."salary_history_reason_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_34aef196f64196ef337981a768"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2cb364072d8ba704eeee38cc36"`,
    );
    await queryRunner.query(`DROP TABLE "key_results"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_927535602e41d05c27d2480de9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b9a0441863f21815d352c42b77"`,
    );
    await queryRunner.query(`DROP TABLE "performance_reviews"`);
    await queryRunner.query(
      `DROP TYPE "public"."performance_reviews_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."performance_reviews_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bec62da550338b8d60e9c8a072"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ada9b9aca4f2ba02b6a8a90dd"`,
    );
    await queryRunner.query(`DROP TABLE "grades"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44a7da6197dad533a14c4c4c47"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_43d6a115dd09868d51494f7545"`,
    );
    await queryRunner.query(`DROP TABLE "designations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cbb2b8ead8aafe4bd39e0d2b5f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b6454119157bcbbce618c2e093"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_134c58b4effb3ab4bee36d4ef6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e41c68e3ffb7adc803eb812ea"`,
    );
    await queryRunner.query(`DROP TABLE "pinned_reports"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a17063e48b705d8fa677bdd849"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c655e458011fd281b4c5de669a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c986cfd5db47ed85be1e4828b"`,
    );
    await queryRunner.query(`DROP TABLE "report_schedules"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5a8e0c3147366c89d1176e7f2a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_320cd5b1ab5da54b13b8007192"`,
    );
    await queryRunner.query(`DROP TABLE "report_templates"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7115e4f1e1d2105335d9b9a6a3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a31d59aa71dfdbfa616615863"`,
    );
    await queryRunner.query(`DROP TABLE "activity_logs"`);
    await queryRunner.query(`DROP TYPE "public"."activity_logs_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."activity_logs_entitytype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_437f8bf0f82751d94de452a748"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2738562f9a9b3d82cba3ca59c5"`,
    );
    await queryRunner.query(`DROP TABLE "delivery_order_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d4720822a8b381fd6d0ef5a61"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b958c31853c1981250a9ea21a"`,
    );
    await queryRunner.query(`DROP TABLE "delivery_orders"`);
    await queryRunner.query(`DROP TYPE "public"."delivery_orders_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d0ed38c8f82903c6b83c7922f5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2440046dd05066e882bb68a780"`,
    );
    await queryRunner.query(`DROP TABLE "leads"`);
    await queryRunner.query(`DROP TYPE "public"."leads_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8de66052a251a49afa3fda213d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77507341767f09008121e368cd"`,
    );
    await queryRunner.query(`DROP TABLE "pricelist_items"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27b9820d1ddf1db12263322204"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_092826fc336a96e64ae88edf67"`,
    );
    await queryRunner.query(`DROP TABLE "pricelists"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4c0fa0f9c66336246fea67d47"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe460d031e961e9e3801ed0ed9"`,
    );
    await queryRunner.query(`DROP TABLE "sales_order_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f103cc3bf77af962cd91ab136"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77e3868b735c09c41f48951170"`,
    );
    await queryRunner.query(`DROP TABLE "sales_orders"`);
    await queryRunner.query(`DROP TYPE "public"."sales_orders_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0115becafaa46b2137baf68aab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e71085700a5ee6325d608cbcb"`,
    );
    await queryRunner.query(`DROP TABLE "quotation_lines"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_865884db45363ea8996ef37dc4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88a5e9c0b63561bfe2a555dee7"`,
    );
    await queryRunner.query(`DROP TABLE "quotations"`);
    await queryRunner.query(`DROP TYPE "public"."quotations_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d4825a9c92ddaa898a33eee0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d40aeaababdbc39be4820cd1f5"`,
    );
    await queryRunner.query(`DROP TABLE "deals"`);
    await queryRunner.query(`DROP TYPE "public"."deals_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."deals_stage_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90e6f5efbcdbeb40f13c962fef"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71ec7d68cfafa5f3d93c959b80"`,
    );
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98951e85fef4028232197b1532"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c1cce1e0d9cc2557038a7f639d"`,
    );
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "kb_articles"`);
    await queryRunner.query(`DROP TABLE "ticket_slas"`);
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TABLE "ticket_messages"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad466567933bb883b4c3aec6a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ac18429c8d27858d79432e0dd"`,
    );
    await queryRunner.query(`DROP TABLE "api_keys"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_61e90eb0fc5abc6092a99e468c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0f65ee3845db76fba9f3b56093"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_499f43a6394b32d1ad29bde311"`,
    );
    await queryRunner.query(`DROP TABLE "approval_steps"`);
    await queryRunner.query(
      `DROP TYPE "public"."approval_steps_approvertype_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_433d665ac7b14b0c724f2af6aa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f446af65cf6e79eba3a7b5358d"`,
    );
    await queryRunner.query(`DROP TABLE "approval_workflows"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25eac74c764366df85314a08e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f23279fad63453147a8efb46cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aca9ec48e47f56efca7d45898d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cfa83f61e4d27a87fcae1e025a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_898d14750b88319b89b1ab66cd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f18d459490bb48923b1f40bdb"`,
    );
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ae8b7cced6df997e6921ea2e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9924f5ff8e2041054c93c7574b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6e3e1efacd742f8e5e4ff6342c"`,
    );
    await queryRunner.query(`DROP TABLE "auto_number_sequences"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a9ca36217dd77a164903cec05e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de9216bb1b30b45bf99cc378ba"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_00921f877afad929f7a61accff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2fb987955ae6c298a85edc8200"`,
    );
    await queryRunner.query(`DROP TABLE "consent_logs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfb6fc9b53d61579181753facf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e1ce1bf0009d1fa09310cf55c"`,
    );
    await queryRunner.query(`DROP TABLE "custom_field_definitions"`);
    await queryRunner.query(
      `DROP TYPE "public"."custom_field_definitions_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ce714c1458a0309e6f5f474f5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ec47822494fa0dc81ca3a3d26"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e889e8e3828925b3c3f953fc59"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a1df7655a5d4bdbe9843a55ef2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_689c22676450e37e5d633bbeb8"`,
    );
    await queryRunner.query(`DROP TABLE "custom_field_values"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_180a93f667b5ee438f2784cacb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c54c400d1c627f5dc3bbb8c2b0"`,
    );
    await queryRunner.query(`DROP TABLE "holidays"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_095817fcc336f08bae94476b42"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3db0953bd2bb3494e7a5d8698b"`,
    );
    await queryRunner.query(`DROP TABLE "system_announcements"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1fd154de0075f094be611bed07"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c92c02daa422fdd25852847cde"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8a71a3a6816848920545d3b3c"`,
    );
    await queryRunner.query(`DROP TABLE "login_events"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4ea87d7d65b977b462fe4d81b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_53b89c6ec6f21b4ab567d56175"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ce0ae77fbe0482f997d3bc7a89"`,
    );
    await queryRunner.query(`DROP TABLE "system_notifications"`);
    await queryRunner.query(
      `DROP TYPE "public"."system_notifications_priority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."system_notifications_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9216a96e8b646f2d51d57559f5"`,
    );
    await queryRunner.query(`DROP TABLE "tenant_custom_domains"`);
    await queryRunner.query(`DROP TABLE "tenant_modules"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6847e0fbfa8c5b91eab52b321e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b9dce7ee955ee08740a8d48e8e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd2bc3de0e4a0329a4ef30600b"`,
    );
    await queryRunner.query(`DROP TABLE "webhook_deliveries"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d89afd6b7cb37efa82b6f7e181"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9c3f75953455671406b1eca079"`,
    );
    await queryRunner.query(`DROP TABLE "webhook_configs"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9278a067137c700040b7823049"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d6e1404c3127f25afa24a006c"`,
    );
    await queryRunner.query(`DROP TABLE "working_calendars"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bd56c5d9ce71725ccbd6967831"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fda619979f40a6a44fc9baf02c"`,
    );
    await queryRunner.query(`DROP TABLE "branches"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8c0947463a9cde138c914b382"`,
    );
    await queryRunner.query(`DROP TABLE "user_dashboard_widgets"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b797ed25423260439f817708dc"`,
    );
    await queryRunner.query(`DROP TABLE "user_preferences"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_27025bcfbedd86c058614b81f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_109638590074998bb72a2f2cf0"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
