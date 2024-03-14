CREATE TABLE `Account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` varchar(255),
	`access_token` varchar(255),
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` varchar(2048),
	`session_state` varchar(255),
	CONSTRAINT `Account_provider_providerAccountId_pk` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `AppPermission` (
	`id` varchar(255) NOT NULL,
	`appId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `AppPermission_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_AppPermissionToAppRole_default` (
	`id` varchar(255) NOT NULL,
	`A` varchar(255) NOT NULL,
	`B` varchar(255) NOT NULL,
	CONSTRAINT `_AppPermissionToAppRole_default_id` PRIMARY KEY(`id`),
	CONSTRAINT `_AppPermissionToAppRole_default_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `_AppPermissionToTeamAppRole` (
	`A` varchar(255) NOT NULL,
	`B` varchar(255) NOT NULL,
	CONSTRAINT `_AppPermissionToTeamAppRole_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `AppRole_default` (
	`id` varchar(255) NOT NULL,
	`appId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`minUsers` int NOT NULL DEFAULT 0,
	`maxUsers` int NOT NULL DEFAULT 0,
	CONSTRAINT `AppRole_default_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `AppTeamConfig` (
	`id` varchar(255) NOT NULL,
	`config` json NOT NULL,
	`appId` varchar(255) NOT NULL,
	`teamId` varchar(255) NOT NULL,
	CONSTRAINT `AppTeamConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `AppTeamConfig_appId_teamId_key` UNIQUE(`appId`,`teamId`)
);
--> statement-breakpoint
CREATE TABLE `App` (
	`id` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`subscriptionCost` decimal(15,2) NOT NULL,
	`devPartnerId` varchar(255) NOT NULL,
	CONSTRAINT `App_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_AppTeam` (
	`A` varchar(255) NOT NULL,
	`B` varchar(255) NOT NULL,
	CONSTRAINT `_AppTeam_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `CareShift` (
	`id` varchar(255) NOT NULL,
	`caregiverId` varchar(255) NOT NULL,
	`teamId` varchar(255) NOT NULL,
	`checkIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`checkOut` timestamp,
	`shiftEndedAt` timestamp,
	`notes` varchar(255),
	CONSTRAINT `CareShift_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `CareTask` (
	`id` varchar(255) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`doneAt` timestamp,
	`doneByUserId` varchar(255),
	`teamId` varchar(255) NOT NULL,
	`eventMasterId` varchar(255),
	`idCareShift` varchar(255) NOT NULL,
	`title` varchar(255),
	`description` varchar(255),
	`details` varchar(255),
	CONSTRAINT `CareTask_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `DevPartner` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`partnerUrl` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `DevPartner_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventCancellation` (
	`id` varchar(255) NOT NULL,
	`originalDate` timestamp(3) NOT NULL,
	`eventMasterId` varchar(255) NOT NULL,
	CONSTRAINT `EventCancellation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventException` (
	`id` varchar(255) NOT NULL,
	`originalDate` timestamp(3) NOT NULL,
	`newDate` timestamp(3) NOT NULL,
	`title` varchar(255),
	`description` varchar(255),
	`eventMasterId` varchar(255) NOT NULL,
	CONSTRAINT `EventException_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `EventMaster` (
	`id` varchar(255) NOT NULL,
	`rule` varchar(255) NOT NULL,
	`DateStart` timestamp(3) NOT NULL,
	`DateUntil` timestamp(3),
	`title` varchar(255),
	`description` varchar(255),
	`teamId` varchar(255) NOT NULL,
	CONSTRAINT `EventMaster_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Invitation` (
	`id` varchar(255) NOT NULL,
	`teamId` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`accepted` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`invitedById` varchar(255) NOT NULL,
	CONSTRAINT `Invitation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Notification` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `Notification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `Session_sessionToken` PRIMARY KEY(`sessionToken`),
	CONSTRAINT `Session_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `TeamAppRole` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(255),
	`minUsers` int NOT NULL DEFAULT 0,
	`maxUsers` int NOT NULL DEFAULT 0,
	`appId` varchar(255) NOT NULL,
	`teamId` varchar(255) NOT NULL,
	`appRole_defaultId` varchar(255),
	CONSTRAINT `TeamAppRole_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_TeamAppRoleToUser` (
	`A` varchar(255) NOT NULL,
	`B` varchar(255) NOT NULL,
	CONSTRAINT `_TeamAppRoleToUser_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `Team` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`ownerId` varchar(255) NOT NULL,
	CONSTRAINT `Team_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `Todo` (
	`id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(255),
	`dueDate` timestamp,
	`priority` int,
	`category` varchar(255),
	`status` enum('TODO','INPROGRESS','INREVIEW','DONE','CANCELED'),
	`reminder` tinyint,
	`assignedToUserId` varchar(255),
	`teamId` varchar(255) NOT NULL,
	CONSTRAINT `Todo_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp DEFAULT CURRENT_TIMESTAMP,
	`image` varchar(255),
	`activeTeamId` varchar(255) NOT NULL,
	`kodixAdmin` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `User_id` PRIMARY KEY(`id`),
	CONSTRAINT `User_email_key` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `_UserTeam` (
	`A` varchar(255) NOT NULL,
	`B` varchar(255) NOT NULL,
	CONSTRAINT `_UserTeam_AB_unique` UNIQUE(`A`,`B`)
);
--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `VerificationToken_identifier_token_pk` PRIMARY KEY(`identifier`,`token`),
	CONSTRAINT `VerificationToken_identifier_unique` UNIQUE(`identifier`),
	CONSTRAINT `VerificationToken_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `Account` (`userId`);--> statement-breakpoint
CREATE INDEX `AppPermission_appId_idx` ON `AppPermission` (`appId`);--> statement-breakpoint
CREATE INDEX `bIdx` ON `_AppPermissionToAppRole_default` (`B`);--> statement-breakpoint
CREATE INDEX `bIdx` ON `_AppPermissionToTeamAppRole` (`B`);--> statement-breakpoint
CREATE INDEX `AppRole_default_appId_idx` ON `AppRole_default` (`appId`);--> statement-breakpoint
CREATE INDEX `AppTeamConfig_appId_idx` ON `AppTeamConfig` (`appId`);--> statement-breakpoint
CREATE INDEX `AppTeamConfig_teamId_idx` ON `AppTeamConfig` (`teamId`);--> statement-breakpoint
CREATE INDEX `App_devPartnerId_idx` ON `App` (`devPartnerId`);--> statement-breakpoint
CREATE INDEX `bIdx` ON `_AppTeam` (`B`);--> statement-breakpoint
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
CREATE INDEX `userId_idx` ON `Session` (`userId`);--> statement-breakpoint
CREATE INDEX `TeamAppRole_appId_idx` ON `TeamAppRole` (`appId`);--> statement-breakpoint
CREATE INDEX `TeamAppRole_appRole_defaultId_idx` ON `TeamAppRole` (`appRole_defaultId`);--> statement-breakpoint
CREATE INDEX `TeamAppRole_teamId_idx` ON `TeamAppRole` (`teamId`);--> statement-breakpoint
CREATE INDEX `bIdx` ON `_TeamAppRoleToUser` (`B`);--> statement-breakpoint
CREATE INDEX `Team_ownerId_idx` ON `Team` (`ownerId`);--> statement-breakpoint
CREATE INDEX `Todo_assignedToUserId_idx` ON `Todo` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `Todo_teamId_idx` ON `Todo` (`teamId`);--> statement-breakpoint
CREATE INDEX `User_activeTeamId_idx` ON `User` (`activeTeamId`);--> statement-breakpoint
CREATE INDEX `bIdx` ON `_UserTeam` (`B`);