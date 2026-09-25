CREATE TABLE public."Report" (
    id integer NOT NULL,
    "reporterId" integer NOT NULL,
    "contentType" text NOT NULL,
    "contentId" integer NOT NULL,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'PENDING' NOT NULL,
    "modNote" text,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) NOT NULL
);

ALTER TABLE ONLY public."Report"
ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);