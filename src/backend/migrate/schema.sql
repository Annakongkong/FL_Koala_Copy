


CREATE SCHEMA IF NOT EXISTS "pyrunner";

ALTER SCHEMA "pyrunner" OWNER TO "postgres";

COMMENT ON SCHEMA "pyrunner" IS 'standard public schema';

CREATE OR REPLACE FUNCTION "pyrunner"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now(); -- Set updated_at to the current date and time
    RETURN NEW;
END;
$$;

ALTER FUNCTION "pyrunner"."update_modified_column"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "pyrunner"."update_script_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update script_name based on script_id from the joined script table
    NEW.script_name := (SELECT name FROM script WHERE id = NEW.script_id);
    RETURN NEW;
END;
$$;

ALTER FUNCTION "pyrunner"."update_script_name"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "pyrunner"."execution" (
    "id" integer NOT NULL,
    "script_id" integer,
    "user_id" integer,
    "start_time" timestamp without time zone,
    "end_time" timestamp without time zone,
    "output" "text",
    "status" character varying(50),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "task_id" "text",
    "script_name" character varying(255)
);

ALTER TABLE "pyrunner"."execution" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "pyrunner"."execution_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "pyrunner"."execution_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "pyrunner"."execution_id_seq" OWNED BY "pyrunner"."execution"."id";

CREATE TABLE IF NOT EXISTS "pyrunner"."favorite" (
    "id" integer NOT NULL,
    "user_id" integer,
    "script_id" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "pyrunner"."favorite" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "pyrunner"."favorite_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "pyrunner"."favorite_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "pyrunner"."favorite_id_seq" OWNED BY "pyrunner"."favorite"."id";

CREATE TABLE IF NOT EXISTS "pyrunner"."script" (
    "id" integer NOT NULL,
    "user_id" integer,
    "file_path" "text" NOT NULL,
    "status" character varying(50) DEFAULT 'false'::character varying,
    "description" "text",
    "instruction" "text",
    "name" character varying(255),
    "code" "text",
    "label" "text",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "upload_required" boolean DEFAULT false,
    "is_active" boolean DEFAULT false,
    "user_full_name" character varying(255)
);

ALTER TABLE "pyrunner"."script" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "pyrunner"."script_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "pyrunner"."script_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "pyrunner"."script_id_seq" OWNED BY "pyrunner"."script"."id";

CREATE TABLE IF NOT EXISTS "pyrunner"."users" (
    "id" integer NOT NULL,
    "username" character varying(255) DEFAULT ''::character varying NOT NULL,
    "password" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "role_id" integer,
    "last_login" timestamp without time zone,
    "created_by" character varying(255),
    "avatar" "bytea",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "fullname" character varying
);

ALTER TABLE "pyrunner"."users" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "pyrunner"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "pyrunner"."users_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "pyrunner"."users_id_seq" OWNED BY "pyrunner"."users"."id";

ALTER TABLE ONLY "pyrunner"."execution" ALTER COLUMN "id" SET DEFAULT "nextval"('"pyrunner"."execution_id_seq"'::"regclass");

ALTER TABLE ONLY "pyrunner"."favorite" ALTER COLUMN "id" SET DEFAULT "nextval"('"pyrunner"."favorite_id_seq"'::"regclass");

ALTER TABLE ONLY "pyrunner"."script" ALTER COLUMN "id" SET DEFAULT "nextval"('"pyrunner"."script_id_seq"'::"regclass");

ALTER TABLE ONLY "pyrunner"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"pyrunner"."users_id_seq"'::"regclass");

ALTER TABLE ONLY "pyrunner"."execution"
    ADD CONSTRAINT "execution_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "pyrunner"."favorite"
    ADD CONSTRAINT "favorite_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "pyrunner"."script"
    ADD CONSTRAINT "script_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "pyrunner"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");

ALTER TABLE ONLY "pyrunner"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE TRIGGER "trigger_update_script_name" BEFORE INSERT OR UPDATE ON "pyrunner"."execution" FOR EACH ROW EXECUTE FUNCTION "pyrunner"."update_script_name"();

CREATE OR REPLACE TRIGGER "update_execution_modtime" BEFORE UPDATE ON "pyrunner"."execution" FOR EACH ROW EXECUTE FUNCTION "pyrunner"."update_modified_column"();

CREATE OR REPLACE TRIGGER "update_favorite_modtime" BEFORE UPDATE ON "pyrunner"."favorite" FOR EACH ROW EXECUTE FUNCTION "pyrunner"."update_modified_column"();

CREATE OR REPLACE TRIGGER "update_user_modtime" BEFORE UPDATE ON "pyrunner"."users" FOR EACH ROW EXECUTE FUNCTION "pyrunner"."update_modified_column"();

ALTER TABLE ONLY "pyrunner"."execution"
    ADD CONSTRAINT "execution_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "pyrunner"."script"("id");

ALTER TABLE ONLY "pyrunner"."execution"
    ADD CONSTRAINT "fk_script_id" FOREIGN KEY ("script_id") REFERENCES "pyrunner"."script"("id");



ALTER TABLE ONLY "pyrunner"."script"
    ADD CONSTRAINT "fk_script_id" FOREIGN KEY ("user_id") REFERENCES "pyrunner"."users"("id");

GRANT USAGE ON SCHEMA "pyrunner" TO "postgres";


ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "pyrunner" GRANT ALL ON SEQUENCES  TO "postgres";


RESET ALL;
