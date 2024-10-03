-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDevKeyword" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_name_key" ON "Word"("name");
