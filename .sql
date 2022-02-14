
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
    "joined" TEXT NOT NULL -- Date from moment
);

2. CREATE TABLE "documents"(
    id TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);


3. CREATE TABLE "codes"(
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "issued_at" TEXT NOT NULL
);