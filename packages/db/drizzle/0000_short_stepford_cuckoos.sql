CREATE TABLE `appActivityLog` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`appId` varchar(12) NOT NULL,
	`userId` varchar(12) NOT NULL,
	`tableName` enum('careShift','careTask') NOT NULL,
	`rowId` varchar(12) NOT NULL,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`diff` json NOT NULL,
	`type` enum('create','update','delete') NOT NULL,
	CONSTRAINT `appActivityLog_id` PRIMARY KEY(`id`)
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
CREATE TABLE `ai_agent` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`createdById` varchar(12) NOT NULL,
	`name` varchar(100) NOT NULL,
	`instructions` text NOT NULL,
	`libraryId` varchar(12),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_agent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_library` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`name` varchar(255) NOT NULL,
	`files` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_model` (
	`id` varchar(12) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`universalModelId` varchar(60) NOT NULL,
	`providerId` varchar(12) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`config` json,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_model_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_model_universal_model_id_idx` UNIQUE(`universalModelId`)
);
--> statement-breakpoint
CREATE TABLE `ai_provider` (
	`id` varchar(12) NOT NULL,
	`name` varchar(100) NOT NULL,
	`baseUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_provider_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_team_model_config` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`modelId` varchar(12) NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`isDefault` boolean NOT NULL DEFAULT false,
	`priority` int DEFAULT 0,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_team_model_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_team_model_config_team_model_unique` UNIQUE(`teamId`,`modelId`)
);
--> statement-breakpoint
CREATE TABLE `ai_team_provider_token` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`providerId` varchar(12) NOT NULL,
	`token` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_team_provider_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_team_provider_token_team_provider_unique` UNIQUE(`teamId`,`providerId`)
);
--> statement-breakpoint
CREATE TABLE `chat_folder` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`createdById` varchar(12) NOT NULL,
	`name` varchar(100) NOT NULL,
	`aiAgentId` varchar(12),
	`aiModelId` varchar(12),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_folder_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_message` (
	`id` varchar(12) NOT NULL,
	`chatSessionId` varchar(12) NOT NULL,
	`senderRole` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`status` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_message_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_session` (
	`id` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`userId` varchar(12) NOT NULL,
	`chatFolderId` varchar(12),
	`aiAgentId` varchar(12),
	`aiModelId` varchar(12) NOT NULL,
	`title` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`activeAgentId` varchar(12),
	`agentHistory` json,
	CONSTRAINT `chat_session_id` PRIMARY KEY(`id`)
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
	`type` enum('NORMAL','CRITICAL'),
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
	`type` enum('NORMAL','CRITICAL') NOT NULL DEFAULT 'NORMAL',
	`createdBy` varchar(255) NOT NULL,
	CONSTRAINT `eventMaster_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careShift` (
	`id` varchar(12) NOT NULL,
	`caregiverId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`startAt` timestamp NOT NULL,
	`endAt` timestamp NOT NULL,
	`checkIn` timestamp,
	`checkOut` timestamp,
	`notes` varchar(255),
	`createdById` varchar(12) NOT NULL,
	`finishedByUserId` varchar(12),
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
	`title` varchar(255),
	`description` varchar(255),
	`details` varchar(255),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`type` enum('NORMAL','CRITICAL') NOT NULL DEFAULT 'NORMAL',
	`createdBy` varchar(12) NOT NULL,
	`createdFromCalendar` boolean NOT NULL,
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
CREATE TABLE `team` (
	`id` varchar(12) NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`ownerId` varchar(12) NOT NULL,
	CONSTRAINT `team_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userTeamAppRole` (
	`id` varchar(12) NOT NULL,
	`userId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`appId` varchar(12) NOT NULL,
	`role` varchar(255) NOT NULL,
	CONSTRAINT `userTeamAppRole_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_userId_teamId_appId_role` UNIQUE(`userId`,`teamId`,`appId`,`role`)
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
CREATE TABLE `expoToken` (
	`id` varchar(12) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	CONSTRAINT `expoToken_id` PRIMARY KEY(`id`),
	CONSTRAINT `expoToken_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` varchar(12) NOT NULL,
	`sentToUserId` varchar(12) NOT NULL,
	`teamId` varchar(12) NOT NULL,
	`subject` varchar(100),
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`message` text NOT NULL,
	`channel` enum('EMAIL','PUSH_NOTIFICATIONS') NOT NULL,
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
	`userId` varchar(255) NOT NULL,
	`expiresAt` datetime NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(12) NOT NULL,
	`name` varchar(255) NOT NULL,
	`passwordHash` varchar(255),
	`email` varchar(255) NOT NULL,
	`image` varchar(255),
	`activeTeamId` varchar(255) NOT NULL,
	`kodixAdmin` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
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
ALTER TABLE `appActivityLog` ADD CONSTRAINT `appActivityLog_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appActivityLog` ADD CONSTRAINT `appActivityLog_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appActivityLog` ADD CONSTRAINT `appActivityLog_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appTeamConfig` ADD CONSTRAINT `appTeamConfig_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appTeamConfig` ADD CONSTRAINT `appTeamConfig_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app` ADD CONSTRAINT `app_devPartnerId_devPartner_id_fk` FOREIGN KEY (`devPartnerId`) REFERENCES `devPartner`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_appToTeam` ADD CONSTRAINT `_appToTeam_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_appToTeam` ADD CONSTRAINT `_appToTeam_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAppTeamConfig` ADD CONSTRAINT `userAppTeamConfig_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAppTeamConfig` ADD CONSTRAINT `userAppTeamConfig_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAppTeamConfig` ADD CONSTRAINT `userAppTeamConfig_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_agent` ADD CONSTRAINT `ai_agent_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_agent` ADD CONSTRAINT `ai_agent_createdById_user_id_fk` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_agent` ADD CONSTRAINT `ai_agent_libraryId_ai_library_id_fk` FOREIGN KEY (`libraryId`) REFERENCES `ai_library`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_library` ADD CONSTRAINT `ai_library_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_model` ADD CONSTRAINT `ai_model_providerId_ai_provider_id_fk` FOREIGN KEY (`providerId`) REFERENCES `ai_provider`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_team_model_config` ADD CONSTRAINT `ai_team_model_config_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_team_model_config` ADD CONSTRAINT `ai_team_model_config_modelId_ai_model_id_fk` FOREIGN KEY (`modelId`) REFERENCES `ai_model`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_team_provider_token` ADD CONSTRAINT `ai_team_provider_token_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_team_provider_token` ADD CONSTRAINT `ai_team_provider_token_providerId_ai_provider_id_fk` FOREIGN KEY (`providerId`) REFERENCES `ai_provider`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_folder` ADD CONSTRAINT `chat_folder_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_folder` ADD CONSTRAINT `chat_folder_createdById_user_id_fk` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_folder` ADD CONSTRAINT `chat_folder_aiAgentId_ai_agent_id_fk` FOREIGN KEY (`aiAgentId`) REFERENCES `ai_agent`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_folder` ADD CONSTRAINT `chat_folder_aiModelId_ai_model_id_fk` FOREIGN KEY (`aiModelId`) REFERENCES `ai_model`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_message` ADD CONSTRAINT `chat_message_chatSessionId_chat_session_id_fk` FOREIGN KEY (`chatSessionId`) REFERENCES `chat_session`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_session` ADD CONSTRAINT `chat_session_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_session` ADD CONSTRAINT `chat_session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_session` ADD CONSTRAINT `chat_session_chatFolderId_chat_folder_id_fk` FOREIGN KEY (`chatFolderId`) REFERENCES `chat_folder`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_session` ADD CONSTRAINT `chat_session_aiAgentId_ai_agent_id_fk` FOREIGN KEY (`aiAgentId`) REFERENCES `ai_agent`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_session` ADD CONSTRAINT `chat_session_aiModelId_ai_model_id_fk` FOREIGN KEY (`aiModelId`) REFERENCES `ai_model`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventCancellation` ADD CONSTRAINT `eventCancellation_eventMasterId_eventMaster_id_fk` FOREIGN KEY (`eventMasterId`) REFERENCES `eventMaster`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventException` ADD CONSTRAINT `eventException_eventMasterId_eventMaster_id_fk` FOREIGN KEY (`eventMasterId`) REFERENCES `eventMaster`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventMaster` ADD CONSTRAINT `eventMaster_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventMaster` ADD CONSTRAINT `eventMaster_createdBy_user_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careShift` ADD CONSTRAINT `careShift_caregiverId_user_id_fk` FOREIGN KEY (`caregiverId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careShift` ADD CONSTRAINT `careShift_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careShift` ADD CONSTRAINT `careShift_createdById_user_id_fk` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careShift` ADD CONSTRAINT `careShift_finishedByUserId_user_id_fk` FOREIGN KEY (`finishedByUserId`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careTask` ADD CONSTRAINT `careTask_doneByUserId_user_id_fk` FOREIGN KEY (`doneByUserId`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careTask` ADD CONSTRAINT `careTask_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careTask` ADD CONSTRAINT `careTask_createdBy_user_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_assignedToUserId_user_id_fk` FOREIGN KEY (`assignedToUserId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `todo` ADD CONSTRAINT `todo_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_invitedById_user_id_fk` FOREIGN KEY (`invitedById`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team` ADD CONSTRAINT `team_ownerId_user_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `userTeamAppRole` ADD CONSTRAINT `userTeamAppRole_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userTeamAppRole` ADD CONSTRAINT `userTeamAppRole_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userTeamAppRole` ADD CONSTRAINT `userTeamAppRole_appId_app_id_fk` FOREIGN KEY (`appId`) REFERENCES `app`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_userToTeam` ADD CONSTRAINT `_userToTeam_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `_userToTeam` ADD CONSTRAINT `_userToTeam_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expoToken` ADD CONSTRAINT `expoToken_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_sentToUserId_user_id_fk` FOREIGN KEY (`sentToUserId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_teamId_team_id_fk` FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resetToken` ADD CONSTRAINT `resetToken_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `appActivityLog` (`teamId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `appActivityLog` (`appId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `appActivityLog` (`userId`);--> statement-breakpoint
CREATE INDEX `tableName_idx` ON `appActivityLog` (`tableName`);--> statement-breakpoint
CREATE INDEX `rowId_idx` ON `appActivityLog` (`rowId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `appTeamConfig` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `appTeamConfig` (`teamId`);--> statement-breakpoint
CREATE INDEX `devPartnerId_idx` ON `app` (`devPartnerId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `_appToTeam` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `_appToTeam` (`teamId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `userAppTeamConfig` (`userId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `userAppTeamConfig` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `userAppTeamConfig` (`teamId`);--> statement-breakpoint
CREATE INDEX `ai_agent_team_idx` ON `ai_agent` (`teamId`);--> statement-breakpoint
CREATE INDEX `ai_agent_created_by_idx` ON `ai_agent` (`createdById`);--> statement-breakpoint
CREATE INDEX `ai_agent_name_idx` ON `ai_agent` (`name`);--> statement-breakpoint
CREATE INDEX `ai_agent_library_idx` ON `ai_agent` (`libraryId`);--> statement-breakpoint
CREATE INDEX `ai_agent_created_at_idx` ON `ai_agent` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_library_team_idx` ON `ai_library` (`teamId`);--> statement-breakpoint
CREATE INDEX `ai_library_name_idx` ON `ai_library` (`name`);--> statement-breakpoint
CREATE INDEX `ai_library_created_at_idx` ON `ai_library` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_model_display_name_idx` ON `ai_model` (`displayName`);--> statement-breakpoint
CREATE INDEX `ai_model_provider_idx` ON `ai_model` (`providerId`);--> statement-breakpoint
CREATE INDEX `ai_model_status_idx` ON `ai_model` (`status`);--> statement-breakpoint
CREATE INDEX `ai_model_enabled_idx` ON `ai_model` (`enabled`);--> statement-breakpoint
CREATE INDEX `ai_model_created_at_idx` ON `ai_model` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_provider_name_idx` ON `ai_provider` (`name`);--> statement-breakpoint
CREATE INDEX `ai_provider_created_at_idx` ON `ai_provider` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_team_model_config_team_idx` ON `ai_team_model_config` (`teamId`);--> statement-breakpoint
CREATE INDEX `ai_team_model_config_model_idx` ON `ai_team_model_config` (`modelId`);--> statement-breakpoint
CREATE INDEX `ai_team_model_config_enabled_idx` ON `ai_team_model_config` (`enabled`);--> statement-breakpoint
CREATE INDEX `ai_team_model_config_is_default_idx` ON `ai_team_model_config` (`isDefault`);--> statement-breakpoint
CREATE INDEX `ai_team_model_config_priority_idx` ON `ai_team_model_config` (`priority`);--> statement-breakpoint
CREATE INDEX `ai_team_model_config_created_at_idx` ON `ai_team_model_config` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_team_provider_token_team_idx` ON `ai_team_provider_token` (`teamId`);--> statement-breakpoint
CREATE INDEX `ai_team_provider_token_provider_idx` ON `ai_team_provider_token` (`providerId`);--> statement-breakpoint
CREATE INDEX `ai_team_provider_token_created_at_idx` ON `ai_team_provider_token` (`createdAt`);--> statement-breakpoint
CREATE INDEX `chat_folder_team_idx` ON `chat_folder` (`teamId`);--> statement-breakpoint
CREATE INDEX `chat_folder_created_by_idx` ON `chat_folder` (`createdById`);--> statement-breakpoint
CREATE INDEX `chat_folder_ai_agent_idx` ON `chat_folder` (`aiAgentId`);--> statement-breakpoint
CREATE INDEX `chat_folder_ai_model_idx` ON `chat_folder` (`aiModelId`);--> statement-breakpoint
CREATE INDEX `chat_folder_name_idx` ON `chat_folder` (`name`);--> statement-breakpoint
CREATE INDEX `chat_folder_created_at_idx` ON `chat_folder` (`createdAt`);--> statement-breakpoint
CREATE INDEX `chat_message_session_idx` ON `chat_message` (`chatSessionId`);--> statement-breakpoint
CREATE INDEX `chat_message_sender_role_idx` ON `chat_message` (`senderRole`);--> statement-breakpoint
CREATE INDEX `chat_message_status_idx` ON `chat_message` (`status`);--> statement-breakpoint
CREATE INDEX `chat_message_created_at_idx` ON `chat_message` (`createdAt`);--> statement-breakpoint
CREATE INDEX `chat_session_team_idx` ON `chat_session` (`teamId`);--> statement-breakpoint
CREATE INDEX `chat_session_user_idx` ON `chat_session` (`userId`);--> statement-breakpoint
CREATE INDEX `chat_session_folder_idx` ON `chat_session` (`chatFolderId`);--> statement-breakpoint
CREATE INDEX `chat_session_ai_agent_idx` ON `chat_session` (`aiAgentId`);--> statement-breakpoint
CREATE INDEX `chat_session_ai_model_idx` ON `chat_session` (`aiModelId`);--> statement-breakpoint
CREATE INDEX `chat_session_title_idx` ON `chat_session` (`title`);--> statement-breakpoint
CREATE INDEX `chat_session_created_at_idx` ON `chat_session` (`createdAt`);--> statement-breakpoint
CREATE INDEX `chat_session_active_agent_idx` ON `chat_session` (`activeAgentId`);--> statement-breakpoint
CREATE INDEX `eventMasterId_idx` ON `eventCancellation` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `eventMasterId_idx` ON `eventException` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `eventMaster` (`teamId`);--> statement-breakpoint
CREATE INDEX `caregiverId_idx` ON `careShift` (`caregiverId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `careShift` (`teamId`);--> statement-breakpoint
CREATE INDEX `doneByUserId_idx` ON `careTask` (`doneByUserId`);--> statement-breakpoint
CREATE INDEX `eventMasterId_Idx` ON `careTask` (`eventMasterId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `careTask` (`teamId`);--> statement-breakpoint
CREATE INDEX `assignedToUserId_idx` ON `todo` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `todo` (`teamId`);--> statement-breakpoint
CREATE INDEX `invitedById_idx` ON `invitation` (`invitedById`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `invitation` (`teamId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `ownerId_idx` ON `team` (`ownerId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `userTeamAppRole` (`userId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `userTeamAppRole` (`teamId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `userTeamAppRole` (`appId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `_userToTeam` (`userId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `_userToTeam` (`teamId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `expoToken` (`userId`);--> statement-breakpoint
CREATE INDEX `sentToUserId_idx` ON `notification` (`sentToUserId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `notification` (`teamId`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `resetToken` (`token`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `resetToken` (`userId`);--> statement-breakpoint
CREATE INDEX `activeTeamId_idx` ON `user` (`activeTeamId`);--> statement-breakpoint
CREATE INDEX `appId_idx` ON `appsToTeams` (`appId`);--> statement-breakpoint
CREATE INDEX `teamId_idx` ON `appsToTeams` (`teamId`);