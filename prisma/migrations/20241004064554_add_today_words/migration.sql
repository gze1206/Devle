-- CreateTable
CREATE TABLE "TodayWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "wordId" INTEGER NOT NULL,
    CONSTRAINT "TodayWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TodayWord_date_key" ON "TodayWord"("date");
