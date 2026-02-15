import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3.raw",
        },
      });

      if (response.ok) return response;
      if (response.status === 404) throw new Error("Repository not found");
      if (response.status === 403) throw new Error("Rate limit exceeded. Try again later.");
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
  throw new Error("Failed to fetch after retries");
};

const fetchMarkdownFiles = async (repoUrl) => {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?$/);
  if (!match) {
    throw new Error("Invalid GitHub URL format. Use: https://github.com/owner/repo");
  }

  const [, owner, repo] = match;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;

  const response = await fetchWithRetry(apiUrl);
  const contents = await response.json();

  if (!Array.isArray(contents)) {
    throw new Error("Failed to read repository contents");
  }

  const mdFiles = contents
    .filter((file) => file.name && file.name.endsWith(".md"))
    .map((file) => ({
      path: file.path || file.name,
      url: file.download_url,
    }))
    .filter((file) => file.url);

  if (mdFiles.length === 0) {
    throw new Error("No markdown files found in repository root");
  }

  const mdContents = [];
  for (const file of mdFiles) {
    try {
      const fileResponse = await fetchWithRetry(file.url);
      const content = await fileResponse.text();
      mdContents.push({ path: file.path, content });
    } catch (error) {
      console.warn(`Failed to fetch ${file.path}:`, error);
    }
  }

  if (mdContents.length === 0) {
    throw new Error("Failed to fetch markdown file contents");
  }

  return mdContents;
};

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
    const files = await fetchMarkdownFiles(repoUrl);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(files),
        },
      ],
      result: files,
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

