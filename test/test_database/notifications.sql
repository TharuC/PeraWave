CREATE TABLE public."Notification" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE ONLY public."Notification"
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);