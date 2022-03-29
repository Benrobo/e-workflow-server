
-- database creation

CREATE DATABASE "e-workflow";

-- Tables Creations

CREATE TABLE "users"(
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


CREATE TABLE "groups"(
    id TEXT NOT NULL,
    "name" TEXT,
    "courseType" TEXT,
    "courseName" TEXT,
    "userId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);

CREATE TABLE "documents"(
    id TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "userId" TEXT , -- this would be filled up when submitting course form
    "groupId" TEXT, -- this would be filled up when submitting final year project
    "supervisor" TEXT,
    "externalSupervisor" TEXT,
    "schoolOfficer" TEXT,
    "courseAdvisor" TEXT,
    "HOD" TEXT,
    "status" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);


CREATE TABLE "docFeedback"(
    id TEXT NOT NULL  unique primary key,
    "note" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);


CREATE TABLE "codes"(
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "issued_at" TEXT NOT NULL
);

CREATE TABLE "notifications"(
    "id" TEXT NOT NULL  unique primary key,
    "userId" TEXT NOT NULL,
    "staffId" TEXT,
    "message" TEXT NOT NULL,
    "isSeen" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issued_at" TEXT NOT NULL
);

CREATE TABLE "signatures"(
    "id" TEXT NOT NULL  unique primary key,
    "documentId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "issued_at" TEXT NOT NULL
);