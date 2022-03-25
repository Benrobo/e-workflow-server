
-- database creation

1. CREATE DATABASE "e-workflow";

-- Tables Creations

1. CREATE TABLE "users"(
    id TEXT NOT NULL unique primary key,
    "userId" TEXT NOT NULL unique,
    "userName" TEXT NOT NULL,
    "mail" TEXT NOT NULL unique,
    "phoneNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- student | staff
    "hash" TEXT NOT NULL,
    "userRole" TEXT NOT NULL, -- student | staff | admin
    "userStatus" TEXT NOT NULL, -- pending | approved
    "refreshToken" TEXT NOT NULL,
    "joined" TEXT NOT NULL, -- Date from moment
    "documentPermissions" INT
);



2. CREATE TABLE "groups"(
    id TEXT NOT NULL,
    "name" TEXT,
    "courseType" TEXT,
    "courseName" TEXT,
    "userId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);



3. CREATE TABLE "documents"(
    id TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "userId" TEXT , -- this would be filled up when submitting course form
    "groupId" TEXT, -- this would be filled up when submitting final year project
    "staffId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);


4. CREATE TABLE "docFeedback"(
    id TEXT NOT NULL  unique primary key,
    "note" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);

5. CREATE TABLE "codes"(
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "issued_at" TEXT NOT NULL
);

6. CREATE TABLE "notifications"(
    "id" TEXT NOT NULL  unique primary key,
    "userId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isSeen" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issued_at" TEXT NOT NULL
);

7. CREATE TABLE "signatures"(
    "id" TEXT NOT NULL  unique primary key,
    "documentId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "issued_at" TEXT NOT NULL
);