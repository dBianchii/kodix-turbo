import { z } from "zod";

import type { appActivityLogs } from "@kdx/db/schema";
import type { KodixAppId } from "@kdx/shared";
import {
  aiStudioAppId,
  aiStudioUserAppTeamConfigSchema,
  calendarAppId,
  chatAppId,
  chatUserAppTeamConfigSchema,
  kodixCareAppId,
  kodixCareConfigSchema,
  kodixCareUserAppTeamConfigSchema,
  todoAppId,
} from "@kdx/shared";

import { ZNanoId } from "../..";

export type AppIdsWithConfig = typeof kodixCareAppId | typeof chatAppId; //? Some apps might not have config implemented
export type AppIdsWithUserAppTeamConfig =
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof aiStudioAppId; //? Some apps might not have userAppTeamConfig implemented

export const ZGetConfigInput = z.object({
  appId: z.custom<AppIdsWithConfig>(),
});
export type TGetConfigInput = z.infer<typeof ZGetConfigInput>;

export const ZGetUserAppTeamConfigInputSchema = z.object({
  appId: z.custom<AppIdsWithUserAppTeamConfig>(),
});
export type TGetUserAppTeamConfigInputSchema = z.infer<
  typeof ZGetUserAppTeamConfigInputSchema
>;

export const ZInstallAppInputSchema = z.object({
  appId: z.union([
    z.literal(todoAppId),
    z.literal(calendarAppId),
    z.literal(kodixCareAppId),
    z.literal(chatAppId),
    z.literal(aiStudioAppId),
  ]),
});
export type TInstallAppInputSchema = z.infer<typeof ZInstallAppInputSchema>;

export const ZSaveConfigInput = z.object({
  appId: z.literal(kodixCareAppId),
  config: kodixCareConfigSchema.partial(),
}); //TODO: make dynamic based on app when we have more apps with team config
export type TSaveConfigInput = z.infer<typeof ZSaveConfigInput>;

export const ZUninstallAppInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
});
export type TUninstallAppInputSchema = z.infer<typeof ZUninstallAppInputSchema>;

export const ZSaveUserAppTeamConfigInputSchema = z.union([
  z.object({
    appId: z.literal(kodixCareAppId),
    config: kodixCareUserAppTeamConfigSchema.partial(),
  }),
  z.object({
    appId: z.literal(chatAppId),
    config: chatUserAppTeamConfigSchema.partial(),
  }),
  z.object({
    appId: z.literal(aiStudioAppId),
    config: aiStudioUserAppTeamConfigSchema.partial(),
  }),
]);
export type TSaveUserAppTeamConfigInputSchema = z.infer<
  typeof ZSaveUserAppTeamConfigInputSchema
>;

export const ZGetAppActivityLogsInputSchema = z.object({
  appId: z.custom<KodixAppId>(),
  tableNames: z
    .array(z.custom<typeof appActivityLogs.$inferSelect.tableName>())
    .min(1),
  rowId: ZNanoId.optional(),
  perPage: z.number().min(1).default(10),
  page: z.number().min(1).default(1),
});
export type TGetAppActivityLogsInputSchema = z.infer<
  typeof ZGetAppActivityLogsInputSchema
>;

// Export AI Studio validators
export {
  // AI Provider
  criarAiProviderSchema,
  atualizarAiProviderSchema,
  buscarAiProvidersSchema,

  // AI Model
  criarAiModelSchema,
  atualizarAiModelSchema,
  buscarAiModelsSchema,

  // AI Team Provider Token (novos)
  criarAiTeamProviderTokenSchema,
  atualizarAiTeamProviderTokenSchema,
  buscarTokenPorProviderSchema,
  removerTokenPorProviderSchema,

  // AI Team Model Config (novos)
  criarAiTeamModelConfigSchema,
  atualizarAiTeamModelConfigSchema,
  toggleModelSchema,
  setDefaultModelSchema,
  setModelPrioritySchema,
  reorderModelsPrioritySchema,
  testModelSchema,
  buscarTeamModelConfigSchema,
  teamModelIdSchema,

  // Diagnóstico e correção (novos)
  enableProviderModelsSchema,
  toggleGlobalModelSchema,

  // AI Library
  criarAiLibrarySchema,
  atualizarAiLibrarySchema,
  buscarAiLibrariesSchema,

  // AI Agent
  criarAiAgentSchema,
  atualizarAiAgentSchema,
  buscarAiAgentsSchema,

  // Common
  idSchema as aiStudioIdSchema,
} from "./ai-studio";

// Export Chat validators
export {
  criarChatFolderSchema,
  atualizarChatFolderSchema,
  buscarChatFoldersSchema,
  criarChatSessionSchema,
  atualizarChatSessionSchema,
  buscarChatSessionsSchema,
  criarChatMessageSchema,
  atualizarChatMessageSchema,
  buscarChatMessagesSchema,
  getMessagesSchema,
  enviarMensagemSchema,
  autoCreateSessionWithMessageSchema,
  createEmptySessionSchema,
  generateSessionTitleSchema,
  iniciarNovaConversa,
  duplicarSessaoSchema,
  idSchema as chatIdSchema,
  sessionIdSchema,
  type AtualizarChatFolderInput,
  type AtualizarChatMessageInput,
  type AtualizarChatSessionInput,
  type BuscarChatFoldersInput,
  type BuscarChatMessagesInput,
  type BuscarChatSessionsInput,
  type GetMessagesInput,
  buscarPorTeamSchema,
  type BuscarPorTeamInput,
  type CriarChatFolderInput,
  type CriarChatMessageInput,
  type CriarChatSessionInput,
  type DuplicarSessaoInput,
  type EnviarMensagemInput,
  type AutoCreateSessionWithMessageInput,
  type CreateEmptySessionInput,
  type GenerateSessionTitleInput,
  type IniciarNovaConversaInput,
} from "./chat";

// Export KodixCare validators
export {
  ZDoCheckoutForShiftInputSchema,
  ZCheckEmailForRegisterInputSchema,
  ZSignInByPasswordInputSchema,
  ZCreateCareShiftInputSchema,
  ZFindOverlappingShiftsInputSchema,
  ZEditCareShiftInputSchema,
  ZDeleteCareShiftInputSchema,
  type TDoCheckoutForShiftInputSchema,
  type TCheckEmailForRegisterInputSchema,
  type TSignInByPasswordInputSchema,
  type TCreateCareShiftInputSchema,
  type TFindOverlappingShiftsInputSchema,
  type TEditCareShiftInputSchema,
  type TDeleteCareShiftInputSchema,
} from "./kodixCare";

// Export Calendar validators
export {
  ZCancelInputSchema,
  ZCreateInputSchema,
  ZEditInputSchema,
  ZGetAllInputSchema,
  type TCancelInputSchema,
  type TCreateInputSchema,
  type TEditInputSchema,
  type TGetAllInputSchema,
} from "./calendar";

// Export Todo validators
export {
  ZCreateInputSchema as ZTodoCreateInputSchema,
  ZUpdateInputSchema as ZTodoUpdateInputSchema,
  type TCreateInputSchema as TTodoCreateInputSchema,
  type TUpdateInputSchema as TTodoUpdateInputSchema,
} from "./todo";
