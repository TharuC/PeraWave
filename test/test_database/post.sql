CREATE TABLE public."PostVote" (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL,
    value integer NOT NULL
);

ALTER TABLE ONLY public."PostVote"
ADD CONSTRAINT "PostVote_pkey" PRIMARY KEY (id);
