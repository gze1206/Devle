/*
  Warnings:

  - Added the required column `length` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Ranking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,
    CONSTRAINT "Ranking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ranking_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "TodayWord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "length" INTEGER NOT NULL,
    "isDevKeyword" BOOLEAN NOT NULL
);
INSERT INTO "new_Word" ("description", "id", "isDevKeyword", "name") SELECT "description", "id", "isDevKeyword", "name" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
CREATE UNIQUE INDEX "Word_name_key" ON "Word"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
