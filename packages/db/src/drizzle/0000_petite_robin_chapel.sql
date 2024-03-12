-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `Account` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`type` varchar(191) NOT NULL,
	`provider` varchar(191) NOT NULL,
	`providerAccountId` varchar(191) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(191),
	`scope` varchar(191),
	`id_token` text,
	`session_state` varchar(191),
	CONSTRAINT `Account_id` PRIMARY KEY(`id`),
	CONSTRAINT `Account_provider_providerAccountId_key` UNIQUE(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `App` (
	`id` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updatedAt` datetime(3) NOT NULL,
	`subscriptionCost` decimal(65,30) NOT NULL,
	`devPartnerId` varchar(191) NOT NULL,
	CONSTRAINT `App_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `AppPermission` (
	`id` varchar(191) NOT NULL,
	`appId` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` varchar(191),
	CONSTRAINT `AppPermission_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `AppRole_default` (
	`id` varchar(191) NOT NULL,
	`appId` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` varchar(191),
	`minUsers` int NOT NULL DEFAULT 0,
	`maxUsers` int NOT NULL DEFAULT 0,
	CONSTRAINT `AppRole_default_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `AppTeamConfig` (
	`id` varchar(191) NOT NULL,
	`config` json NOT NULL,
	`appId` varchar(191) NOT NULL,
	`teamId` varchar(191) NOT NULL,
	CONSTRAINT `AppTeamConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `AppTeamConfig_appId_teamId_key` UNIQUE(`appId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `CareShift` (
	`id` varchar(191) NOT NULL,
	`caregiverId` varchar(191) NOT NULL,
	`teamId` varchar(191) NOT NULL,
	`checkIn` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`checkOut` datetime(3),
	`shiftEndedAt` datetime(3),
	`notes` varchar(191),
	CONSTRAINT `CareShift_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `CareTask` (
	`id` varchar(191) NOT NULL,
	`eventDate` datetime(3) NOT NULL,
	`doneAt` datetime(3),
	`doneByUserId` varchar(191),
	`teamId` varchar(191) NOT NULL,
	`eventMasterId` varchar(191),
	`idCareShift` varchar(191) NOT NULL,
	`title` varchar(191),
	`description` varchar(191),
	`details` varchar(191),
	CONSTRAINT `CareTask_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `DevPartner` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`partnerUrl` varchar(191),
	`createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updatedAt` datetime(3) NOT NULL,
	CONSTRAINT `DevPartner_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventCancellation` (
	`id` varchar(191) NOT NULL,
	`originalDate` datetime(3) NOT NULL,
	`eventMasterId` varchar(191) NOT NULL,
	CONSTRAINT `EventCancellation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventException` (
	`id` varchar(191) NOT NULL,
	`originalDate` datetime(3) NOT NULL,
	`newDate` datetime(3) NOT NULL,
	`title` varchar(191),
	`description` varchar(191),
	`eventMasterId` varchar(191) NOT NULL,
	CONSTRAINT `EventException_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventMaster` (
	`id` varchar(191) NOT NULL,
	`rule` varchar(191) NOT NULL,
	`DateStart` datetime(3) NOT NULL,
	`DateUntil` datetime(3),
	`title` varchar(191),
	`description` varchar(191),
	`teamId` varchar(191) NOT NULL,
	CONSTRAINT `EventMaster_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Invitation` (
	`id` varchar(191) NOT NULL,
	`teamId` varchar(191) NOT NULL,
	`email` varchar(191) NOT NULL,
	`accepted` tinyint NOT NULL DEFAULT 0,
	`createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updatedAt` datetime(3) NOT NULL,
	`invitedById` varchar(191) NOT NULL,
	CONSTRAINT `Invitation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Notification` (
	`id` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	CONSTRAINT `Notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Post` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`content` varchar(191) NOT NULL,
	CONSTRAINT `Post_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` varchar(191) NOT NULL,
	`sessionToken` varchar(191) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `Session_id` PRIMARY KEY(`id`),
	CONSTRAINT `Session_sessionToken_key` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `Team` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updatedAt` datetime(3) NOT NULL,
	`ownerId` varchar(191) NOT NULL,
	CONSTRAINT `Team_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `TeamAppRole` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191) NOT NULL,
	`description` varchar(191),
	`minUsers` int NOT NULL DEFAULT 0,
	`maxUsers` int NOT NULL DEFAULT 0,
	`appId` varchar(191) NOT NULL,
	`teamId` varchar(191) NOT NULL,
	`appRole_defaultId` varchar(191),
	CONSTRAINT `TeamAppRole_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Todo` (
	`id` varchar(191) NOT NULL,
	`title` varchar(191) NOT NULL,
	`description` varchar(191),
	`dueDate` datetime(3),
	`priority` int,
	`category` varchar(191),
	`status` enum('TODO','INPROGRESS','INREVIEW','DONE','CANCELED'),
	`reminder` tinyint,
	`assignedToUserId` varchar(191),
	`teamId` varchar(191) NOT NULL,
	CONSTRAINT `Todo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191),
	`email` varchar(191) NOT NULL,
	`emailVerified` datetime(3),
	`image` varchar(191),
	`activeTeamId` varchar(191) NOT NULL,
	`kodixAdmin` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `User_id` PRIMARY KEY(`id`),
	CONSTRAINT `User_email_key` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` varchar(191) NOT NULL,
	`token` varchar(191) NOT NULL,
	`expires` datetime(3) NOT NULL,
	CONSTRAINT `VerificationToken_identifier_token_key` UNIQUE(`identifier`,`token`),
	CONSTRAINT `VerificationToken_token_key` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `_AppPermissionToAppRole_default` (
	`A` varchar(191) NOT NULL,
	`B` varchar(191) NOT NULL,
	CONSTRAINT `_AppPermissionToAppRole_default_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `_AppPermissionToTeamAppRole` (
	`A` varchar(191) NOT NULL,
	`B` varchar(191) NOT NULL,
	CONSTRAINT `_AppPermissionToTeamAppRole_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `_AppTeam` (
	`A` varchar(191) NOT NULL,
	`B` varchar(191) NOT NULL,
	CONSTRAINT `_AppTeam_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `_TeamAppRoleToUser` (
	`A` varchar(191) NOT NULL,
	`B` varchar(191) NOT NULL,
	CONSTRAINT `_TeamAppRoleToUser_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `_UserTeam` (
	`A` varchar(191) NOT NULL,
	`B` varchar(191) NOT NULL,
	CONSTRAINT `_UserTeam_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `t3turbo_account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` varchar(255),
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `t3turbo_account_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `t3turbo_post` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`content` varchar(256) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `t3turbo_post_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `t3turbo_session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `t3turbo_session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `t3turbo_user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp(3) DEFAULT CURRENT_TIMESTAMP(3),
	`image` varchar(255),
	CONSTRAINT `t3turbo_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `t3turbo_verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `t3turbo_verificationToken_identifier_token` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
CREATE INDEX `Account_userId_idx` ON `Account` (`userId`);--> statement-breakpoint
CREATE INDEX `App_devPartnerId_idx` ON `App` (`devPartnerId`);--> statement-breakpoint
CREATE INDEX `AppPermission_appId_idx` ON `AppPermission` (`appId`);--> statement-breakpoint
CREATE INDEX `AppRole_default_appId_idx` ON `AppRole_default` (`appId`);--> statement-breakpoint
CREATE INDEX `AppTeamConfig_appId_idx` ON `AppTeamConfig` (`appId`);--> statement-breakpoint
CREATE INDEX `AppTeamConfig_teamId_idx` ON `AppTeamConfig` (`teamId`);--> statement-breakpoint
CREATE INDEX `CareShift_caregiverId_idx` ON `CareShift` (`caregiverId`);--> statement-breakpoint
CREATE INDEX `CareShift_teamId_idx` ON `CareShift` (`teamId`);--> statement-breakpoint
CREATE INDEX `CareTask_doneByUserId_idx` ON `CareTask` (`doneByUserId`);--> statement-breakpoint
CREATE INDEX `CareTask_eventMasterId_idx` ON `CareTask` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `CareTask_idCareShift_idx` ON `CareTask` (`idCareShift`);--> statement-breakpoint
CREATE INDEX `CareTask_teamId_idx` ON `CareTask` (`teamId`);--> statement-breakpoint
CREATE INDEX `EventCancellation_eventMasterId_idx` ON `EventCancellation` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `EventException_eventMasterId_idx` ON `EventException` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `EventMaster_teamId_idx` ON `EventMaster` (`teamId`);--> statement-breakpoint
CREATE INDEX `Invitation_invitedById_idx` ON `Invitation` (`invitedById`);--> statement-breakpoint
CREATE INDEX `Invitation_teamId_idx` ON `Invitation` (`teamId`);--> statement-breakpoint
CREATE INDEX `Notification_userId_idx` ON `Notification` (`userId`);--> statement-breakpoint
CREATE INDEX `Session_userId_idx` ON `Session` (`userId`);--> statement-breakpoint
CREATE INDEX `Team_ownerId_idx` ON `Team` (`ownerId`);--> statement-breakpoint
CREATE INDEX `TeamAppRole_appId_idx` ON `TeamAppRole` (`appId`);--> statement-breakpoint
CREATE INDEX `TeamAppRole_appRole_defaultId_idx` ON `TeamAppRole` (`appRole_defaultId`);--> statement-breakpoint
CREATE INDEX `TeamAppRole_teamId_idx` ON `TeamAppRole` (`teamId`);--> statement-breakpoint
CREATE INDEX `Todo_assignedToUserId_idx` ON `Todo` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `Todo_teamId_idx` ON `Todo` (`teamId`);--> statement-breakpoint
CREATE INDEX `User_activeTeamId_idx` ON `User` (`activeTeamId`);--> statement-breakpoint
CREATE INDEX `_AppPermissionToAppRole_default_B_index` ON `_AppPermissionToAppRole_default` (`B`);--> statement-breakpoint
CREATE INDEX `_AppPermissionToTeamAppRole_B_index` ON `_AppPermissionToTeamAppRole` (`B`);--> statement-breakpoint
CREATE INDEX `_AppTeam_B_index` ON `_AppTeam` (`B`);--> statement-breakpoint
CREATE INDEX `_TeamAppRoleToUser_B_index` ON `_TeamAppRoleToUser` (`B`);--> statement-breakpoint
CREATE INDEX `_UserTeam_B_index` ON `_UserTeam` (`B`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `t3turbo_account` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `t3turbo_session` (`userId`);
*/