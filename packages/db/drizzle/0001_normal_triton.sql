CREATE TABLE `apps` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`iconUrl` varchar(255) NOT NULL,
	CONSTRAINT `apps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appsToTeams` (
	`appId` varchar(255) NOT NULL,
	`teamId` varchar(30) NOT NULL,
	CONSTRAINT `appsToTeams_appId_teamId_pk` PRIMARY KEY(`appId`,`teamId`)
);
--> statement-breakpoint
CREATE INDEX `appId_idx` ON `appsToTeams` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `appsToTeams` (`teamId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `invitation` (`email`);