import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";

const server = new Server(
  {
    name: "my-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = [
  {
    name: "hello",
    description: "Say hello",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "scan_markdown_files",
    description: "Scan and list markdown files from a repository",
    inputSchema: {
      type: "object",
      properties: {
        repoUrl: { type: "string" },
      },
      required: ["repoUrl"],
    },
  },
  {
    name: "generate_project_report",
    description: "Generate a project report",
    inputSchema: {
      type: "object",
      properties: {
        repoUrl: { type: "string" },
        maxPages: { type: "number" },
        extraPrompt: { type: "string" },
        template: { type: "string" },
        markdownFiles: { type: "array" },
      },
      required: ["repoUrl"],
    },
  },
];

const callTool = async ({ name, args }) => {
  const safeArgs = args ?? {};
  if (name === "hello") {
    return {
      content: [
        {
          type: "text",
          text: "Hello from MCP 🚀",
        },
      ],
      result: "Hello from MCP 🚀",
    };
  }

  if (name === "scan_markdown_files") {
    const { repoUrl } = safeArgs;
    const mockFiles = [
      {
        path: "README.md",
        content: "# My Project\n\nThis is the main readme for the project. It contains an overview and getting started guide.",
      },
      {
        path: "docs/ARCHITECTURE.md",
        content: "# Architecture\n\n## Overview\nThe system is built with a modular design...",
      },
      {
        path: "docs/API.md",
        content: "# API Documentation\n\n## Endpoints\n- GET /api/data\n- POST /api/create",
      },
    ];
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(mockFiles),
        },
      ],
      result: mockFiles,
    };
  }

  if (name === "generate_project_report") {
    const { repoUrl, maxPages, extraPrompt, template, markdownFiles } = safeArgs;
    const filesInfo = Array.isArray(markdownFiles)
      ? `Found ${markdownFiles.length} markdown files: ${markdownFiles.map((f) => f.path).join(", ")}`
      : "No markdown files provided";
    const fakeMarkdown = `# Generated Report\n\nRepo: ${repoUrl}\nPages: ${maxPages}\nPrompt: ${extraPrompt}\nTemplate used: ${template ? "yes" : "no"}\n\nMarkdown files: ${filesInfo}\n\nAI summary: This is a placeholder report from MCP. Real LLM would summarize .md files here...`;
    return {
      content: [
        {
          type: "text",
          text: fakeMarkdown,
        },
      ],
      result: fakeMarkdown,
    };
  }

  throw new Error("Tool not found");
};

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return callTool({ name, args });
});

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/tools", (req, res) => {
  res.json({ tools });
});

app.post("/tools/call", async (req, res) => {
  const { name, args } = req.body || {};
  if (!name) {
    res.status(400).json({ error: "Missing tool name" });
    return;
  }

  try {
    const result = await callTool({ name, args });
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool not found";
    res.status(404).json({ error: message });
  }
});

app.listen(8000, () => {
  console.log("HTTP MCP server listening on http://localhost:8000");
});

// 🚀 Start server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

