-- CreateTable
CREATE TABLE "architects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "client_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "architectId" TEXT NOT NULL,
    "selectedRoomTypes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "projectType" TEXT,
    "housingType" TEXT,
    "housingTypeOther" TEXT,
    "propertyUsage" TEXT,
    "householdAdults" INTEGER,
    "householdChildren" INTEGER,
    "householdGrandchildren" INTEGER,
    "childrenAges" TEXT,
    "hasAnimals" BOOLEAN,
    "desiredOrganization" TEXT,
    "organizationComments" TEXT,
    CONSTRAINT "client_sessions_architectId_fkey" FOREIGN KEY ("architectId") REFERENCES "architects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "architectId" TEXT NOT NULL,
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "room_types_architectId_fkey" FOREIGN KEY ("architectId") REFERENCES "architects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "room_types_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "room_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomTypeId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "optionsJson" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "questions_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerValue" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "client_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "client_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inspiration_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "architectId" TEXT NOT NULL,
    "sessionId" TEXT,
    "roomTypeIds" TEXT,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isClientUpload" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspiration_photos_architectId_fkey" FOREIGN KEY ("architectId") REFERENCES "architects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "photo_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "annotationsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photo_interactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "client_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "photo_interactions_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "inspiration_photos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "architects_email_key" ON "architects"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_answers_sessionId_questionId_key" ON "client_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "photo_interactions_sessionId_photoId_key" ON "photo_interactions"("sessionId", "photoId");
