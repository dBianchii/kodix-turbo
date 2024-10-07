CREATE TABLE `userAppTeamConfig` (
	`id` varchar(12) NOT NULL,
	`config` json NOT NULL,
	`userId` varchar(12) NOT NULL,
	`appId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	CONSTRAINT `userAppTeamConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_userId_appId_teamId` UNIQUE(`userId`,`appId`,`teamId`)
);
--> statement-breakpoint
ALTER TABLE `eventMaster` ADD `status` enum('NORMAL','CRITICAL') DEFAULT 'NORMAL';--> statement-breakpoint
ALTER TABLE `userAppTeamConfig` ADD CONSTRAINT `userAppTeamConfig_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAppTeamConfig` ADD CONSTRAINT `userAppTeamConfig_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAppTeamConfig` ADD CONSTRAINT `userAppTeamConfig_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `userAppTeamConfig` (`userId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `userAppTeamConfig` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `userAppTeamConfig` (`teamId`);