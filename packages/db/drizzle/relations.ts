import { relations } from "drizzle-orm/relations";
import { app, appToTeam, team, userToTeam, user, account, aiAgent, aiLibrary, aiProvider, aiModel, aiTeamModelConfig, aiTeamProviderToken, devPartner, appActivityLog, appTeamConfig, careShift, careTask, chatFolder, chatSession, chatMessage, eventMaster, eventCancellation, eventException, expoToken, invitation, notification, resetToken, session, todo, userAppTeamConfig, userTeamAppRole } from "./schema";

export const appToTeamRelations = relations(appToTeam, ({one}) => ({
	app: one(app, {
		fields: [appToTeam.appId],
		references: [app.id]
	}),
	team: one(team, {
		fields: [appToTeam.teamId],
		references: [team.id]
	}),
}));

export const appRelations = relations(app, ({one, many}) => ({
	appToTeams: many(appToTeam),
	devPartner: one(devPartner, {
		fields: [app.devPartnerId],
		references: [devPartner.id]
	}),
	appActivityLogs: many(appActivityLog),
	appTeamConfigs: many(appTeamConfig),
	userAppTeamConfigs: many(userAppTeamConfig),
	userTeamAppRoles: many(userTeamAppRole),
}));

export const teamRelations = relations(team, ({one, many}) => ({
	appToTeams: many(appToTeam),
	userToTeams: many(userToTeam),
	aiAgents: many(aiAgent),
	aiLibraries: many(aiLibrary),
	aiTeamModelConfigs: many(aiTeamModelConfig),
	aiTeamProviderTokens: many(aiTeamProviderToken),
	appActivityLogs: many(appActivityLog),
	appTeamConfigs: many(appTeamConfig),
	careShifts: many(careShift),
	careTasks: many(careTask),
	chatFolders: many(chatFolder),
	chatSessions: many(chatSession),
	eventMasters: many(eventMaster),
	invitations: many(invitation),
	notifications: many(notification),
	user: one(user, {
		fields: [team.ownerId],
		references: [user.id]
	}),
	todos: many(todo),
	userAppTeamConfigs: many(userAppTeamConfig),
	userTeamAppRoles: many(userTeamAppRole),
}));

export const userToTeamRelations = relations(userToTeam, ({one}) => ({
	team: one(team, {
		fields: [userToTeam.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [userToTeam.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	userToTeams: many(userToTeam),
	accounts: many(account),
	aiAgents: many(aiAgent),
	appActivityLogs: many(appActivityLog),
	careShifts_caregiverId: many(careShift, {
		relationName: "careShift_caregiverId_user_id"
	}),
	careShifts_createdById: many(careShift, {
		relationName: "careShift_createdById_user_id"
	}),
	careShifts_finishedByUserId: many(careShift, {
		relationName: "careShift_finishedByUserId_user_id"
	}),
	careTasks_createdBy: many(careTask, {
		relationName: "careTask_createdBy_user_id"
	}),
	careTasks_doneByUserId: many(careTask, {
		relationName: "careTask_doneByUserId_user_id"
	}),
	chatFolders: many(chatFolder),
	chatSessions: many(chatSession),
	eventMasters: many(eventMaster),
	expoTokens: many(expoToken),
	invitations: many(invitation),
	notifications: many(notification),
	resetTokens: many(resetToken),
	sessions: many(session),
	teams: many(team),
	todos: many(todo),
	userAppTeamConfigs: many(userAppTeamConfig),
	userTeamAppRoles: many(userTeamAppRole),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const aiAgentRelations = relations(aiAgent, ({one, many}) => ({
	user: one(user, {
		fields: [aiAgent.createdById],
		references: [user.id]
	}),
	aiLibrary: one(aiLibrary, {
		fields: [aiAgent.libraryId],
		references: [aiLibrary.id]
	}),
	team: one(team, {
		fields: [aiAgent.teamId],
		references: [team.id]
	}),
	chatFolders: many(chatFolder),
	chatSessions: many(chatSession),
}));

export const aiLibraryRelations = relations(aiLibrary, ({one, many}) => ({
	aiAgents: many(aiAgent),
	team: one(team, {
		fields: [aiLibrary.teamId],
		references: [team.id]
	}),
}));

export const aiModelRelations = relations(aiModel, ({one, many}) => ({
	aiProvider: one(aiProvider, {
		fields: [aiModel.providerId],
		references: [aiProvider.id]
	}),
	aiTeamModelConfigs: many(aiTeamModelConfig),
	chatFolders: many(chatFolder),
	chatSessions: many(chatSession),
}));

export const aiProviderRelations = relations(aiProvider, ({many}) => ({
	aiModels: many(aiModel),
	aiTeamProviderTokens: many(aiTeamProviderToken),
}));

export const aiTeamModelConfigRelations = relations(aiTeamModelConfig, ({one}) => ({
	aiModel: one(aiModel, {
		fields: [aiTeamModelConfig.modelId],
		references: [aiModel.id]
	}),
	team: one(team, {
		fields: [aiTeamModelConfig.teamId],
		references: [team.id]
	}),
}));

export const aiTeamProviderTokenRelations = relations(aiTeamProviderToken, ({one}) => ({
	aiProvider: one(aiProvider, {
		fields: [aiTeamProviderToken.providerId],
		references: [aiProvider.id]
	}),
	team: one(team, {
		fields: [aiTeamProviderToken.teamId],
		references: [team.id]
	}),
}));

export const devPartnerRelations = relations(devPartner, ({many}) => ({
	apps: many(app),
}));

export const appActivityLogRelations = relations(appActivityLog, ({one}) => ({
	app: one(app, {
		fields: [appActivityLog.appId],
		references: [app.id]
	}),
	team: one(team, {
		fields: [appActivityLog.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [appActivityLog.userId],
		references: [user.id]
	}),
}));

export const appTeamConfigRelations = relations(appTeamConfig, ({one}) => ({
	app: one(app, {
		fields: [appTeamConfig.appId],
		references: [app.id]
	}),
	team: one(team, {
		fields: [appTeamConfig.teamId],
		references: [team.id]
	}),
}));

export const careShiftRelations = relations(careShift, ({one}) => ({
	user_caregiverId: one(user, {
		fields: [careShift.caregiverId],
		references: [user.id],
		relationName: "careShift_caregiverId_user_id"
	}),
	user_createdById: one(user, {
		fields: [careShift.createdById],
		references: [user.id],
		relationName: "careShift_createdById_user_id"
	}),
	user_finishedByUserId: one(user, {
		fields: [careShift.finishedByUserId],
		references: [user.id],
		relationName: "careShift_finishedByUserId_user_id"
	}),
	team: one(team, {
		fields: [careShift.teamId],
		references: [team.id]
	}),
}));

export const careTaskRelations = relations(careTask, ({one}) => ({
	user_createdBy: one(user, {
		fields: [careTask.createdBy],
		references: [user.id],
		relationName: "careTask_createdBy_user_id"
	}),
	user_doneByUserId: one(user, {
		fields: [careTask.doneByUserId],
		references: [user.id],
		relationName: "careTask_doneByUserId_user_id"
	}),
	team: one(team, {
		fields: [careTask.teamId],
		references: [team.id]
	}),
}));

export const chatFolderRelations = relations(chatFolder, ({one, many}) => ({
	aiAgent: one(aiAgent, {
		fields: [chatFolder.aiAgentId],
		references: [aiAgent.id]
	}),
	aiModel: one(aiModel, {
		fields: [chatFolder.aiModelId],
		references: [aiModel.id]
	}),
	user: one(user, {
		fields: [chatFolder.createdById],
		references: [user.id]
	}),
	team: one(team, {
		fields: [chatFolder.teamId],
		references: [team.id]
	}),
	chatSessions: many(chatSession),
}));

export const chatMessageRelations = relations(chatMessage, ({one}) => ({
	chatSession: one(chatSession, {
		fields: [chatMessage.chatSessionId],
		references: [chatSession.id]
	}),
}));

export const chatSessionRelations = relations(chatSession, ({one, many}) => ({
	chatMessages: many(chatMessage),
	aiAgent: one(aiAgent, {
		fields: [chatSession.aiAgentId],
		references: [aiAgent.id]
	}),
	aiModel: one(aiModel, {
		fields: [chatSession.aiModelId],
		references: [aiModel.id]
	}),
	chatFolder: one(chatFolder, {
		fields: [chatSession.chatFolderId],
		references: [chatFolder.id]
	}),
	team: one(team, {
		fields: [chatSession.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [chatSession.userId],
		references: [user.id]
	}),
}));

export const eventCancellationRelations = relations(eventCancellation, ({one}) => ({
	eventMaster: one(eventMaster, {
		fields: [eventCancellation.eventMasterId],
		references: [eventMaster.id]
	}),
}));

export const eventMasterRelations = relations(eventMaster, ({one, many}) => ({
	eventCancellations: many(eventCancellation),
	eventExceptions: many(eventException),
	user: one(user, {
		fields: [eventMaster.createdBy],
		references: [user.id]
	}),
	team: one(team, {
		fields: [eventMaster.teamId],
		references: [team.id]
	}),
}));

export const eventExceptionRelations = relations(eventException, ({one}) => ({
	eventMaster: one(eventMaster, {
		fields: [eventException.eventMasterId],
		references: [eventMaster.id]
	}),
}));

export const expoTokenRelations = relations(expoToken, ({one}) => ({
	user: one(user, {
		fields: [expoToken.userId],
		references: [user.id]
	}),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	user: one(user, {
		fields: [invitation.invitedById],
		references: [user.id]
	}),
	team: one(team, {
		fields: [invitation.teamId],
		references: [team.id]
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.sentToUserId],
		references: [user.id]
	}),
	team: one(team, {
		fields: [notification.teamId],
		references: [team.id]
	}),
}));

export const resetTokenRelations = relations(resetToken, ({one}) => ({
	user: one(user, {
		fields: [resetToken.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const todoRelations = relations(todo, ({one}) => ({
	user: one(user, {
		fields: [todo.assignedToUserId],
		references: [user.id]
	}),
	team: one(team, {
		fields: [todo.teamId],
		references: [team.id]
	}),
}));

export const userAppTeamConfigRelations = relations(userAppTeamConfig, ({one}) => ({
	app: one(app, {
		fields: [userAppTeamConfig.appId],
		references: [app.id]
	}),
	team: one(team, {
		fields: [userAppTeamConfig.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [userAppTeamConfig.userId],
		references: [user.id]
	}),
}));

export const userTeamAppRoleRelations = relations(userTeamAppRole, ({one}) => ({
	app: one(app, {
		fields: [userTeamAppRole.appId],
		references: [app.id]
	}),
	team: one(team, {
		fields: [userTeamAppRole.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [userTeamAppRole.userId],
		references: [user.id]
	}),
}));