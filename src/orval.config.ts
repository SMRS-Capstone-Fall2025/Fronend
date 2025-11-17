import { defineConfig } from "orval";

// Replace the default input with your OpenAPI/Swagger JSON/YAML URL or a local path.
// You can set OPENAPI_INPUT env var to override the `input` at runtime.

export default defineConfig({
  api: {
    input: process.env.OPENAPI_INPUT || "./specs/openapi.json",
    output: {
      mode: "tags-split",
      target: "src/services",
      schemas: "src/services/beapi.schemas.ts",
      client: "react-query",
      prettier: true,
      clean: true,
      propertySortOrder: "Alphabetical",
      override: {
        mutator: {
          path: "src/lib/api/mutator.ts",
          name: "mutator",
        },
      },
    },
  },
});
