CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "fullName" text,
    faculty text,
    "registrationNumber" text,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) NOT NULL,
    "deletionReason" text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "suspendedUntil" timestamp(3),
    "suspensionReason" text
);

ALTER TABLE ONLY public."User"
ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);