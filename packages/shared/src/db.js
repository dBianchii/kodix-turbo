"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.appDependencies = exports.appIdToUserAppTeamConfigSchema = exports.appIdToAppTeamConfigSchema = exports.aiStudioUserAppTeamConfigSchema = exports.aiStudioConfigSchema = exports.chatUserAppTeamConfigSchema = exports.kodixCareUserAppTeamConfigSchema = exports.chatConfigSchema = exports.kodixCareConfigSchema = exports.allRoles = exports.appIdToRoles = exports.aiStudioAppId = exports.chatAppId = exports.kodixCareAppId = exports.calendarAppId = exports.todoAppId = exports.commonRolesForAllApps = exports.kdxPartnerId = void 0;
exports.getAppDependencies = getAppDependencies;
exports.hasCircularDependencies = hasCircularDependencies;
var zod_1 = require("zod");
var dayjs_1 = require("@kdx/dayjs");
//* Partners
exports.kdxPartnerId = "p8bmvvk3cy3l";
//-------------------------------  	Apps 	 -------------------------------//
exports.commonRolesForAllApps = ["ADMIN"];
//* Todo *//
exports.todoAppId = "7mwag78tv8pa";
//* Calendar *//
exports.calendarAppId = "rglo4zodf341";
//*  KodixCare *//
exports.kodixCareAppId = "1z50i9xblo4b";
//* Chat *//
exports.chatAppId = "az1x2c3bv4n5";
//* AI Studio *//
exports.aiStudioAppId = "ai9x7m2k5p1s";
exports.appIdToRoles = (_a = {},
    _a[exports.kodixCareAppId] = __spreadArray(__spreadArray([], exports.commonRolesForAllApps, true), ["CAREGIVER"], false),
    _a[exports.calendarAppId] = __spreadArray([], exports.commonRolesForAllApps, true),
    _a[exports.todoAppId] = __spreadArray([], exports.commonRolesForAllApps, true),
    _a[exports.chatAppId] = __spreadArray([], exports.commonRolesForAllApps, true),
    _a[exports.aiStudioAppId] = __spreadArray([], exports.commonRolesForAllApps, true),
    _a);
exports.allRoles = __spreadArray([], new Set(Object.values(exports.appIdToRoles).flat()), true);
//-------------------------------  	Apps 	 -------------------------------//
//* Helpers *//
/**
 * Converts a value to a Date object using the ISO 8601 format.
 * If the value is already a Date object, it is returned as is.
 * If the value is a string, it is parsed using the dayjs library and converted to a Date object.
 * @returns A Date object representing the input value.
 */
var dateFromISO8601 = zod_1.z.preprocess(function (value) { return (value instanceof Date ? value : (0, dayjs_1.default)(value).toDate()); }, zod_1.z.date());
/**
 * @description Schema for validating kodix care config
 */
exports.kodixCareConfigSchema = zod_1.z.object({
    patientName: zod_1.z
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
exports.chatConfigSchema = zod_1.z.object({
    // Configurações que fazem sentido por TEAM (muito poucas)
    teamSettings: zod_1.z
        .object({
        // Exemplo: limites organizacionais, políticas da empresa
        maxSessionsPerUser: zod_1.z.number().min(1).max(100).default(50),
        allowModelSwitching: zod_1.z.boolean().default(true),
        organizationName: zod_1.z.string().optional(),
    })
        .default({}),
});
exports.kodixCareUserAppTeamConfigSchema = zod_1.z.object({
    sendNotificationsForDelayedTasks: zod_1.z.boolean().optional(),
});
/**
 * @description Schema for validating chat app user config
 * ✅ CORRIGIDO: Agora contém TODAS as configurações pessoais do usuário
 */
exports.chatUserAppTeamConfigSchema = zod_1.z.object({
    // ✅ MIGRADO: Preferências pessoais do usuário (era Team)
    personalSettings: zod_1.z
        .object({
        preferredModelId: zod_1.z.string().optional(), // Era lastSelectedModelId no team
        enableNotifications: zod_1.z.boolean().default(true),
        notificationSound: zod_1.z.boolean().default(false),
        rememberLastModel: zod_1.z.boolean().default(true), // MIGRADO do team
    })
        .default({}),
    // ✅ MIGRADO: Configurações de IA pessoais (era Team)
    aiSettings: zod_1.z
        .object({
        maxTokens: zod_1.z.number().min(100).max(8000).default(2000),
        temperature: zod_1.z.number().min(0).max(2).default(0.7),
        enableStreaming: zod_1.z.boolean().default(true),
    })
        .default({}),
    // ✅ MIGRADO: Configurações de UI pessoais (era Team)
    uiPreferences: zod_1.z
        .object({
        chatTheme: zod_1.z.enum(["light", "dark", "auto"]).default("auto"),
        fontSize: zod_1.z.enum(["small", "medium", "large"]).default("medium"),
        compactMode: zod_1.z.boolean().default(false),
        showModelInHeader: zod_1.z.boolean().default(true), // MIGRADO do team
        autoSelectModel: zod_1.z.boolean().default(true), // MIGRADO do team
        defaultChatTitle: zod_1.z.string().default("Nova Conversa"), // MIGRADO do team
    })
        .default({}),
    // ✅ MIGRADO: Configurações de comportamento pessoais (era Team)
    behaviorSettings: zod_1.z
        .object({
        autoSaveConversations: zod_1.z.boolean().default(true),
        enableTypingIndicator: zod_1.z.boolean().default(true),
    })
        .default({}),
});
/**
 * @description Schema for validating AI Studio app team config
 */
exports.aiStudioConfigSchema = zod_1.z.object({
    teamInstructions: zod_1.z
        .object({
        content: zod_1.z.string().default(""),
        enabled: zod_1.z.boolean().default(false),
        appliesTo: zod_1.z.enum(["chat", "all"]).default("chat"),
    })
        .default({}),
});
/**
 * @description Schema for validating AI Studio user config
 */
exports.aiStudioUserAppTeamConfigSchema = zod_1.z.object({
    userInstructions: zod_1.z
        .object({
        content: zod_1.z
            .string()
            .max(2500, "As instruções não podem exceder 2500 caracteres.")
            .default(""),
        enabled: zod_1.z.boolean().default(true),
    })
        .default({}),
});
//TODO: Maybe move this getAppTeamConfigSchema elsewhere
exports.appIdToAppTeamConfigSchema = (_b = {},
    _b[exports.kodixCareAppId] = exports.kodixCareConfigSchema,
    _b[exports.chatAppId] = exports.chatConfigSchema,
    _b[exports.aiStudioAppId] = exports.aiStudioConfigSchema,
    _b);
//TODO: Maybe move this getAppTeamConfigSchema elsewhere
exports.appIdToUserAppTeamConfigSchema = (_c = {},
    _c[exports.kodixCareAppId] = exports.kodixCareUserAppTeamConfigSchema,
    _c[exports.chatAppId] = exports.chatUserAppTeamConfigSchema,
    _c[exports.aiStudioAppId] = exports.aiStudioUserAppTeamConfigSchema,
    _c);
//-------------------------------  App Dependencies  -------------------------------//
/**
 * Define dependências entre apps
 * Formato: { [appId]: [array de dependências obrigatórias] }
 */
exports.appDependencies = (_d = {},
    _d[exports.todoAppId] = [],
    _d[exports.calendarAppId] = [],
    _d[exports.kodixCareAppId] = [exports.calendarAppId],
    _d[exports.chatAppId] = [exports.aiStudioAppId],
    _d[exports.aiStudioAppId] = [],
    _d);
/**
 * Obter todas as dependências de um app (incluindo dependências transitivas)
 */
function getAppDependencies(appId) {
    var visited = new Set();
    var dependencies = [];
    function collectDependencies(currentAppId) {
        if (visited.has(currentAppId))
            return;
        visited.add(currentAppId);
        var directDependencies = exports.appDependencies[currentAppId];
        for (var _i = 0, directDependencies_1 = directDependencies; _i < directDependencies_1.length; _i++) {
            var dependency = directDependencies_1[_i];
            dependencies.push(dependency);
            collectDependencies(dependency); // Dependências transitivas
        }
    }
    collectDependencies(appId);
    return __spreadArray([], new Set(dependencies), true); // Remove duplicatas
}
/**
 * Verificar se um app tem dependências circulares
 */
function hasCircularDependencies(appId) {
    var visited = new Set();
    var recursionStack = new Set();
    function hasCycle(currentAppId) {
        if (recursionStack.has(currentAppId))
            return true;
        if (visited.has(currentAppId))
            return false;
        visited.add(currentAppId);
        recursionStack.add(currentAppId);
        var dependencies = exports.appDependencies[currentAppId];
        for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
            var dependency = dependencies_1[_i];
            if (hasCycle(dependency))
                return true;
        }
        recursionStack.delete(currentAppId);
        return false;
    }
    return hasCycle(appId);
}
