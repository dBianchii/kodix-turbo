import type { NormalizeOAS } from "fets";
import { createClient } from "fets";

const openapi = {
  openapi: "3.0.2",
  paths: {
    "/test/{id}": {
      get: {
        tags: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "number",
              nullable: true,
            },
          },
          {
            name: "foo",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "bar",
            in: "query",
            required: true,
            schema: {
              type: "number",
            },
          },
        ],
        responses: {
          "200": {
            description: "200",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "number",
                    },
                  },
                  required: ["id"],
                },
              },
            },
          },
        },
      },
    },
    "/something": {
      get: {
        tags: [],
        parameters: [
          {
            name: "foo",
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "bar",
            in: "query",
            required: true,
            schema: {
              type: "number",
            },
          },
        ],
        responses: {
          "200": {
            description: "200",
          },
        },
      },
    },
  },
  info: {
    title: "Posts API",
    version: "1.0.0",
  },
} as const;

const client = createClient<NormalizeOAS<typeof openapi>>({});

const response = await client["/test"].get();
const pets = await response.json();

console.log(pets);
