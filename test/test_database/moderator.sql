CREATE TABLE public."Moderator" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "fullName" text,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

ALTER TABLE ONLY public."Moderator"
ADD CONSTRAINT "Moderator_pkey" PRIMARY KEY (id);