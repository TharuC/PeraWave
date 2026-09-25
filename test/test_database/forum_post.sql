CREATE TABLE public."ForumPost" (
    id integer NOT NULL,
    "authorId" integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    faculty text,
    batch text,
    visibility text NOT NULL,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    upvotes integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) NOT NULL,
    "isFlagged" boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY public."ForumPost"
ADD CONSTRAINT "ForumPost_pkey" PRIMARY KEY (id);