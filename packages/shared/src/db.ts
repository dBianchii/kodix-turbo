import { z } from "zod";

import dayjs from "@kdx/dayjs";

//* Partners
export const kdxPartnerId = "p8bmvvk3cy3l";

//-------------------------------  	Apps 	 -------------------------------//
export const commonRolesForAllApps = ["ADMIN"] as const;

//* Todo *//
export const todoAppId = "7mwag78tv8pa";

//* Calendar *//
export const calendarAppId = "rglo4zodf341";

//*  KodixCare *//
export const kodixCareAppId = "1z50i9xblo4b";

//* Chat *//
export const chatAppId = "az1x2c3bv4n5";

//* AI Studio *//
export const aiStudioAppId = "ai9x7m2k5p1s";

export const appIdToRoles = {
  [kodixCareAppId]: [...commonRolesForAllApps, "CAREGIVER"] as const,
  [calendarAppId]: [...commonRolesForAllApps] as const,
  [todoAppId]: [...commonRolesForAllApps] as const,
  [chatAppId]: [...commonRolesForAllApps] as const,
  [aiStudioAppId]: [...commonRolesForAllApps] as const,
};
export const allRoles = [...new Set(Object.values(appIdToRoles).flat())];

export type AppRole<T extends KodixAppId = keyof typeof appIdToRoles> =
  (typeof appIdToRoles)[T][number];

export type KodixAppId =
  | typeof todoAppId
  | typeof calendarAppId
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof aiStudioAppId;

export type AppIdsWithConfig =
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof aiStudioAppId; //? Some apps might not have config implemented
export type AppIdsWithUserAppTeamConfig =
  | typeof kodixCareAppId
  | typeof chatAppId
  | typeof aiStudioAppId; //? Some apps might not have userAppTeamConfig implemented
//-------------------------------  	Apps 	 -------------------------------//

//* Helpers *//

/**
 * Converts a value to a Date object using the ISO 8601 format.
 * If the value is already a Date object, it is returned as is.
 * If the value is a string, it is parsed using the dayjs library and converted to a Date object.
 * @returns A Date object representing the input value.
 */
const dateFromISO8601 = z.preprocess(
  (value) => (value instanceof Date ? value : dayjs(value as string).toDate()),
  z.date(),
);

/**
 * @description Schema for validating kodix care config
 */
export const kodixCareConfigSchema = z.object({
  patientName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[^\d]+$/, {
      message: "Numbers are not allowed in the patient name",
    }),
  clonedCareTasksUntil: dateFromISO8601.optional(),
});

/**
 * @description Schema for validating chat app team config
 * ✅ SIMPLIFICADO: Apenas configurações realmente compartilhadas pela equipe
 * A maioria foi migrada para chatUserAppTeamConfigSchema (configurações pessoais)
 */
export const chatConfigSchema = z.object({
  // Configurações que fazem sentido por TEAM (muito poucas)
  teamSettings: z
    .object({
      // Exemplo: limites organizacionais, políticas da empresa
      maxSessionsPerUser: z.number().min(1).max(100).default(50),
      allowModelSwitching: z.boolean().default(true),
      organizationName: z.string().optional(),
    })
    .default({}),
});

export const kodixCareUserAppTeamConfigSchema = z.object({
  sendNotificationsForDelayedTasks: z.boolean().optional(),
});

/**
 * @description Schema for validating chat app user config
 * ✅ CORRIGIDO: Agora contém TODAS as configurações pessoais do usuário
 */
export const chatUserAppTeamConfigSchema = z.object({
  // ✅ MIGRADO: Preferências pessoais do usuário (era Team)
  personalSettings: z
    .object({
      preferredModelId: z.string().optional(), // Era lastSelectedModelId no team
      enableNotifications: z.boolean().default(true),
      notificationSound: z.boolean().default(false),
      rememberLastModel: z.boolean().default(true), // MIGRADO do team
    })
    .default({}),

  // ✅ MIGRADO: Configurações de IA pessoais (era Team)
  aiSettings: z
    .object({
      maxTokens: z.number().min(100).max(8000).default(2000),
      temperature: z.number().min(0).max(2).default(0.7),
      enableStreaming: z.boolean().default(true),
    })
    .default({}),

  // ✅ MIGRADO: Configurações de UI pessoais (era Team)
  uiPreferences: z
    .object({
      chatTheme: z.enum(["light", "dark", "auto"]).default("auto"),
      fontSize: z.enum(["small", "medium", "large"]).default("medium"),
      compactMode: z.boolean().default(false),
      showModelInHeader: z.boolean().default(true), // MIGRADO do team
      autoSelectModel: z.boolean().default(true), // MIGRADO do team
      defaultChatTitle: z.string().default("Nova Conversa"), // MIGRADO do team
    })
    .default({}),

  // ✅ MIGRADO: Configurações de comportamento pessoais (era Team)
  behaviorSettings: z
    .object({
      autoSaveConversations: z.boolean().default(true),
      enableTypingIndicator: z.boolean().default(true),
    })
    .default({}),
});

/**
 * @description Schema for validating AI Studio app team config
 */
export const aiStudioConfigSchema = z.object({
  teamInstructions: z
    .object({
      content: z.string().default(""),
      enabled: z.boolean().default(false),
      appliesTo: z.enum(["chat", "all"]).default("chat"),
    })
    .default({}),
});

/**
 * @description Schema for validating AI Studio user config
 */
export const aiStudioUserAppTeamConfigSchema = z.object({
  userInstructions: z
    .object({
      content: z
        .string()
        .max(2500, "As instruções não podem exceder 2500 caracteres.")
        .default(""),
      enabled: z.boolean().default(true),
    })
    .default({}),
});

//TODO: Maybe move this getAppTeamConfigSchema elsewhere
export const appIdToAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareConfigSchema,
  [chatAppId]: chatConfigSchema,
  [aiStudioAppId]: aiStudioConfigSchema,
};

//TODO: Maybe move this getAppTeamConfigSchema elsewhere
export const appIdToUserAppTeamConfigSchema = {
  [kodixCareAppId]: kodixCareUserAppTeamConfigSchema,
  [chatAppId]: chatUserAppTeamConfigSchema,
  [aiStudioAppId]: aiStudioUserAppTeamConfigSchema,
};

//-------------------------------  App Dependencies  -------------------------------//

/**
 * Define dependências entre apps
 * Formato: { [appId]: [array de dependências obrigatórias] }
 */
export const appDependencies: Record<KodixAppId, KodixAppId[]> = {
  [todoAppId]: [], // Todo não depende de nenhum app
  [calendarAppId]: [], // Calendar não depende de nenhum app
  [kodixCareAppId]: [calendarAppId], // Kodix Care depende do Calendar
  [chatAppId]: [aiStudioAppId], // ✅ Chat DEPENDE do AI Studio
  [aiStudioAppId]: [], // AI Studio não depende de nenhum app
};

/**
 * Obter todas as dependências de um app (incluindo dependências transitivas)
 */
export function getAppDependencies(appId: KodixAppId): KodixAppId[] {
  const visited = new Set<KodixAppId>();
  const dependencies: KodixAppId[] = [];

  function collectDependencies(currentAppId: KodixAppId) {
    if (visited.has(currentAppId)) return;
    visited.add(currentAppId);

    const directDependencies = appDependencies[currentAppId] || [];
    for (const dependency of directDependencies) {
      dependencies.push(dependency);
      collectDependencies(dependency); // Dependências transitivas
    }
  }

  collectDependencies(appId);
  return [...new Set(dependencies)]; // Remove duplicatas
}

/**
 * Verificar se um app tem dependências circulares
 */
export function hasCircularDependencies(appId: KodixAppId): boolean {
  const visited = new Set<KodixAppId>();
  const recursionStack = new Set<KodixAppId>();

  function hasCycle(currentAppId: KodixAppId): boolean {
    if (recursionStack.has(currentAppId)) return true;
    if (visited.has(currentAppId)) return false;

    visited.add(currentAppId);
    recursionStack.add(currentAppId);

    const dependencies = appDependencies[currentAppId] || [];
    for (const dependency of dependencies) {
      if (hasCycle(dependency)) return true;
    }

    recursionStack.delete(currentAppId);
    return false;
  }

  return hasCycle(appId);
}
