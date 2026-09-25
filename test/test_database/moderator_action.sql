CREATE TABLE public."ModerationAction" (
    id integer NOT NULL,
    "moderatorId" integer,
    "targetUserId" integer NOT NULL,
    "actionType" text NOT NULL,
    reason text,
    "durationDays" integer,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);