CREATE TABLE `appPermission` (
	`id` varchar(12) NOT NULL,
	`appId` varchar(12) NOT NULL,
	CONSTRAINT `appPermission_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_appPermissionToTeamAppRole` (
	`appPermissionId` varchar(12) NOT NULL,
	`teamAppRoleId` varchar(12) NOT NULL,
	CONSTRAINT `unique_appPermissionId_teamAppRoleId` UNIQUE(`appPermissionId`,`teamAppRoleId`)
);
--> statement-breakpoint
CREATE TABLE `appTeamConfig` (
	`id` varchar(12) NOT NULL,
	`config` json NOT NULL,
	`appId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	CONSTRAINT `appTeamConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_appId_teamId` UNIQUE(`appId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `app` (
	`id` varchar(12) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`devPartnerId` varchar(12) NOT NULL,
	CONSTRAINT `app_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_appToTeam` (
	`appId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	CONSTRAINT `unique_appId_teamId` UNIQUE(`appId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `devPartner` (
	`id` varchar(12) NOT NULL,
	`name` varchar(255) NOT NULL,
	`partnerUrl` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `devPartner_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventCancellation` (
	`id` varchar(12) NOT NULL,
	`originalDate` timestamp NOT NULL,
	`eventMasterId` varchar(12) NOT NULL,
	CONSTRAINT `eventCancellation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventException` (
	`id` varchar(12) NOT NULL,
	`originalDate` timestamp NOT NULL,
	`newDate` timestamp(3) NOT NULL,
	`title` varchar(255),
	`description` varchar(255),
	`eventMasterId` varchar(12) NOT NULL,
	CONSTRAINT `eventException_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventMaster` (
	`id` varchar(12) NOT NULL,
	`rule` varchar(255) NOT NULL,
	`dateStart` timestamp(3) NOT NULL,
	`dateUntil` timestamp(3),
	`title` varchar(255),
	`description` varchar(255),
	`teamId` varchar(12) NOT NULL,
	CONSTRAINT `eventMaster_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careShift` (
	`id` varchar(12) NOT NULL,
	`caregiverId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`checkIn` timestamp NOT NULL DEFAULT (now()),
	`checkOut` timestamp,
	`shiftEndedAt` timestamp,
	`notes` varchar(255),
	CONSTRAINT `careShift_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careTask` (
	`id` varchar(12) NOT NULL,
	`date` timestamp NOT NULL,
	`doneAt` timestamp,
	`doneByUserId` varchar(12),
	`teamId` varchar(12) NOT NULL,
	`eventMasterId` varchar(12),
	`careShiftId` varchar(12) NOT NULL,
	`title` varchar(255),
	`description` varchar(255),
	`details` varchar(255),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careTask_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `todo` (
	`id` varchar(12) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(255),
	`dueDate` timestamp,
	`priority` smallint,
	`status` enum('TODO','INPROGRESS','INREVIEW','DONE','CANCELED'),
	`assignedToUserId` varchar(255),
	`teamId` varchar(12) NOT NULL,
	CONSTRAINT `todo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`email` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`invitedById` varchar(12) NOT NULL,
	CONSTRAINT `invitation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamAppRole` (
	`id` varchar(12) NOT NULL,
	`appId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`appRoleDefaultId` varchar(12) NOT NULL,
	CONSTRAINT `teamAppRole_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_teamAppRoleToUser` (
	`teamAppRoleId` varchar(12) NOT NULL,
	`userId` varchar(12) NOT NULL,
	CONSTRAINT `unique_teamAppRoleId_userId` UNIQUE(`teamAppRoleId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` varchar(12) NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`ownerId` varchar(12) NOT NULL,
	CONSTRAINT `team_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_userToTeam` (
	`userId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	CONSTRAINT `unique_userId_teamId` UNIQUE(`userId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`providerId` varchar(255) NOT NULL,
	`providerUserId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `account_providerId_providerUserId_pk` PRIMARY KEY(`providerId`,`providerUserId`)
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` varchar(12) NOT NULL,
	`sentToUserId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`subject` varchar(100),
	`sentAt` timestamp NOT NULL,
	`message` text NOT NULL,
	`channel` enum('EMAIL') NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	CONSTRAINT `notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resetToken` (
	`id` varchar(12) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`token` varchar(12) NOT NULL,
	`tokenExpiresAt` timestamp NOT NULL,
	CONSTRAINT `resetToken_id` PRIMARY KEY(`id`),
	CONSTRAINT `resetToken_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(12) NOT NULL,
	`name` varchar(255),
	`passwordHash` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp DEFAULT (now()),
	`image` varchar(255),
	`activeTeamId` varchar(255) NOT NULL,
	`kodixAdmin` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `appPermission` ADD CONSTRAINT `appPermission_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `_appPermissionToTeamAppRole` ADD CONSTRAINT `_appPermissionToTeamAppRole_appPermissionId_appPermission_id_fk` FOREIGN KEY (`appPermissionId`) REFERENCES `appPermission`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_appPermissionToTeamAppRole` ADD CONSTRAINT `_appPermissionToTeamAppRole_teamAppRoleId_teamAppRole_id_fk` FOREIGN KEY (`teamAppRoleId`) REFERENCES `teamAppRole`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appTeamConfig` ADD CONSTRAINT `appTeamConfig_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appTeamConfig` ADD CONSTRAINT `appTeamConfig_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app` ADD CONSTRAINT `app_devPartnerId_devPartner_id_fk` FOREIGN KEY (`devPartnerId`) REFERENCES `devPartner`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_appToTeam` ADD CONSTRAINT `_appToTeam_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_appToTeam` ADD CONSTRAINT `_appToTeam_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventCancellation` ADD CONSTRAINT `eventCancellation_eventMasterId_eventMaster_id_fk` FOREIGN KEY (`eventMasterId`) REFERENCES `eventMaster`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventException` ADD CONSTRAINT `eventException_eventMasterId_eventMaster_id_fk` FOREIGN KEY (`eventMasterId`) REFERENCES `eventMaster`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventMaster` ADD CONSTRAINT `eventMaster_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careShift` ADD CONSTRAINT `careShift_caregiverId_user_id_fk` FOREIGN KEY (`caregiverId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careShift` ADD CONSTRAINT `careShift_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careTask` ADD CONSTRAINT `careTask_doneByUserId_user_id_fk` FOREIGN KEY (`doneByUserId`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careTask` ADD CONSTRAINT `careTask_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careTask` ADD CONSTRAINT `careTask_careShiftId_careShift_id_fk` FOREIGN KEY (`careShiftId`) REFERENCES `careShift`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_assignedToUserId_user_id_fk` FOREIGN KEY (`assignedToUserId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_invitedById_user_id_fk` FOREIGN KEY (`invitedById`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamAppRole` ADD CONSTRAINT `teamAppRole_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teamAppRole` ADD CONSTRAINT `teamAppRole_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_teamAppRoleToUser` ADD CONSTRAINT `_teamAppRoleToUser_teamAppRoleId_teamAppRole_id_fk` FOREIGN KEY (`teamAppRoleId`) REFERENCES `teamAppRole`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_teamAppRoleToUser` ADD CONSTRAINT `_teamAppRoleToUser_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team` ADD CONSTRAINT `team_ownerId_user_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `_userToTeam` ADD CONSTRAINT `_userToTeam_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_userToTeam` ADD CONSTRAINT `_userToTeam_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_sentToUserId_user_id_fk` FOREIGN KEY (`sentToUserId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resetToken` ADD CONSTRAINT `resetToken_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `appId_idx` ON `appPermission` (`appId`);--> statement-breakpoint
CREATE INDEX `appPermissionId_idx` ON `_appPermissionToTeamAppRole` (`appPermissionId`);--> statement-breakpoint
CREATE INDEX `teamAppRoleId_idx` ON `_appPermissionToTeamAppRole` (`teamAppRoleId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `appTeamConfig` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `appTeamConfig` (`teamId`);--> statement-breakpoint
CREATE INDEX `devPartnerId_idx` ON `app` (`devPartnerId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `_appToTeam` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `_appToTeam` (`teamId`);--> statement-breakpoint
CREATE INDEX `eventMasterId_idx` ON `eventCancellation` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `eventMasterId_idx` ON `eventException` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `eventMaster` (`teamId`);--> statement-breakpoint
CREATE INDEX `caregiverId_idx` ON `careShift` (`caregiverId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `careShift` (`teamId`);--> statement-breakpoint
CREATE INDEX `doneByUserId_idx` ON `careTask` (`doneByUserId`);--> statement-breakpoint
CREATE INDEX `eventMasterId_Idx` ON `careTask` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `careShiftId_idx` ON `careTask` (`careShiftId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `careTask` (`teamId`);--> statement-breakpoint
CREATE INDEX `assignedToUserId_idx` ON `todo` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `todo` (`teamId`);--> statement-breakpoint
CREATE INDEX `invitedById_idx` ON `invitation` (`invitedById`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `invitation` (`teamId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `teamAppRole` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `teamAppRole` (`teamId`);--> statement-breakpoint
CREATE INDEX `teamAppRoleId_idx` ON `_teamAppRoleToUser` (`teamAppRoleId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `_teamAppRoleToUser` (`userId`);--> statement-breakpoint
CREATE INDEX `ownerId_idx` ON `team` (`ownerId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `_userToTeam` (`userId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `_userToTeam` (`teamId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `sentToUserId_idx` ON `notification` (`sentToUserId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `notification` (`teamId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `resetToken` (`userId`);--> statement-breakpoint
CREATE INDEX `activeTeamId_idx` ON `user` (`activeTeamId`);