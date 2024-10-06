-- CreateTable
CREATE TABLE `TodayWordAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `gameId` INTEGER NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `try` INTEGER NOT NULL,
    `results` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TodayWordAnswer` ADD CONSTRAINT `TodayWordAnswer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodayWordAnswer` ADD CONSTRAINT `TodayWordAnswer_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `TodayWord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
