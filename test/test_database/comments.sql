CREATE TABLE public."Comment" (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    "authorId" integer NOT NULL,
    content text NOT NULL,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isFlagged" boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY public."Comment"
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);