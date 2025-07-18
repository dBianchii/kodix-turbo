"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typedObjectKeys = exports.typedObjectEntries = exports.getSuccessesAndErrors = exports.getBaseUrl = void 0;
exports.getErrorMessage = getErrorMessage;
var zod_1 = require("zod");
var constants_1 = require("./constants");
/**
 * @description Base URL for the current environment.
 */
var getBaseUrl = function () {
    var _a;
    if (typeof window !== "undefined")
        return window.location.origin;
    if (process.env.VERCEL_URL) {
        if (process.env.VERCEL_URL.includes("".concat(constants_1.KDX_VERCEL_PROJECT_NAME, "-")) &&
            process.env.VERCEL_ENV === "production")
            return constants_1.KDX_PRODUCTION_URL;
        return "https://".concat(process.env.VERCEL_URL);
    }
    return "http://localhost:".concat((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
};
exports.getBaseUrl = getBaseUrl;
/**
 * @description Extracts successes and errors from promise.allSettled in a typesafe maner
 */
var getSuccessesAndErrors = function (results) {
    var errors = results.filter(function (x) { return x.status === "rejected"; });
    var successes = results.filter(function (x) { return x.status === "fulfilled"; });
    return { successes: successes, errors: errors };
};
exports.getSuccessesAndErrors = getSuccessesAndErrors;
/**
 * @description A typesafe Object.entries
 */
var typedObjectEntries = function (obj) { return Object.entries(obj); };
exports.typedObjectEntries = typedObjectEntries;
/**
 * @description A typesafe Object.keys
 */
var typedObjectKeys = function (obj) {
    return Object.keys(obj);
};
exports.typedObjectKeys = typedObjectKeys;
/**
 * @description Gets the error message
 */
function getErrorMessage(err) {
    var unknownError = "Something went wrong, please try again later.";
    if (err instanceof zod_1.z.ZodError) {
        var errors = err.issues.map(function (issue) {
            return issue.message;
        });
        return errors.join("\n");
    }
    if (err instanceof Error)
        return err.message;
    return unknownError;
}
