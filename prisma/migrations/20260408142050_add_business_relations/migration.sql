-- AlterTable
ALTER TABLE "Business" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "instagramUrl" TEXT;

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "postId" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "postedAt" DATETIME NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialPost_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "polygon" TEXT,
    "category" TEXT NOT NULL DEFAULT 'community',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "startTime" TEXT,
    "endTime" TEXT,
    "impactLevel" TEXT NOT NULL DEFAULT 'medium',
    "imageUrl" TEXT,
    "website" TEXT,
    "businessId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("address", "category", "createdAt", "description", "endDate", "endTime", "id", "imageUrl", "impactLevel", "latitude", "longitude", "polygon", "startDate", "startTime", "title", "updatedAt", "website") SELECT "address", "category", "createdAt", "description", "endDate", "endTime", "id", "imageUrl", "impactLevel", "latitude", "longitude", "polygon", "startDate", "startTime", "title", "updatedAt", "website" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_platform_postId_key" ON "SocialPost"("platform", "postId");
