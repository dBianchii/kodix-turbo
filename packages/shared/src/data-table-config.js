"use strict";
//TODO: Understand where to move this file. Its a file that needs to be shared between the api and the ...
//TODO: Also, I dont think @kdx/api should have an icon lib installed
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataTableConfig = void 0;
exports.dataTableConfig = {
    comparisonOperators: [
        { label: "Contains", value: "like" },
        { label: "Does not contain", value: "notIlike" },
        { label: "Is", value: "eq" },
        { label: "Is not", value: "notEq" },
        { label: "Starts with", value: "startsWith" },
        { label: "Ends with", value: "endsWith" },
        { label: "Is empty", value: "isNull" },
        { label: "Is not empty", value: "isNotNull" },
    ],
    selectableOperators: [
        { label: "Is", value: "eq" },
        { label: "Is not", value: "notEq" },
        { label: "Is empty", value: "isNull" },
        { label: "Is not empty", value: "isNotNull" },
    ],
    logicalOperators: [
        {
            label: "And",
            value: "and",
            description: "All conditions must be met",
        },
        {
            label: "Or",
            value: "or",
            description: "At least one condition must be met",
        },
    ],
};
