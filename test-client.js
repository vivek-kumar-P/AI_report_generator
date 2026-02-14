import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  ReadBuffer,
  serializeMessage,
} from "@modelcontextprotocol/sdk/shared/stdio.js";

class ChildProcessStdioTransport {
  constructor(command, args, options = {}) {
    this._command = command;
    this._args = args;
    this._options = options;
    this._readBuffer = new ReadBuffer();
    this._process = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    this.sessionId = undefined;
  }

  async start() {
    if (this._process) {
      throw new Error("Transport already started");
    }

    return new Promise((resolve, reject) => {
      this._process = spawn(this._command, this._args, {
        stdio: ["pipe", "pipe", "inherit"],
        ...this._options,
      });

      this._process.on("error", (error) => {
        this.onerror?.(error);
        reject(error);
      });

      this._process.on("spawn", () => {
        resolve();
      });

      this._process.on("close", () => {
        this._process = null;
        this.onclose?.();
      });

      this._process.stdin?.on("error", (error) => {
        this.onerror?.(error);
      });

      this._process.stdout?.on("data", (chunk) => {
        this._readBuffer.append(chunk);
        this._processReadBuffer();
      });

      this._process.stdout?.on("error", (error) => {
        this.onerror?.(error);
      });
    });
  }

  _processReadBuffer() {
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        this.onmessage?.(message);
      } catch (error) {
        this.onerror?.(error);
      }
    }
  }

  send(message) {
    if (!this._process?.stdin) {
      throw new Error("Not connected");
    }

    const json = serializeMessage(message);
    return new Promise((resolve) => {
      if (this._process.stdin.write(json)) {
        resolve();
      } else {
        this._process.stdin.once("drain", resolve);
      }
    });
  }

  async close() {
    if (!this._process) {
      this._readBuffer.clear();
      return;
    }

    const processToClose = this._process;
    this._process = null;
    const closePromise = new Promise((resolve) => {
      processToClose.once("close", () => {
        resolve();
      });
    });

    try {
      processToClose.stdin?.end();
    } catch {
      // Ignore shutdown errors.
    }

    await Promise.race([
      closePromise,
      new Promise((resolve) => setTimeout(resolve, 2000).unref()),
    ]);

    if (processToClose.exitCode === null) {
      try {
        processToClose.kill("SIGTERM");
      } catch {
        // Ignore shutdown errors.
      }

      await Promise.race([
        closePromise,
        new Promise((resolve) => setTimeout(resolve, 2000).unref()),
      ]);
    }

    if (processToClose.exitCode === null) {
      try {
        processToClose.kill("SIGKILL");
      } catch {
        // Ignore shutdown errors.
      }
    }

    this._readBuffer.clear();
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, "index.js");

async function main() {
  const transport = new ChildProcessStdioTransport(process.execPath, [serverPath]);
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);

    const listResult = await client.listTools({});
    console.log("tools/list response:", listResult);

    const callResult = await client.callTool({ name: "hello", arguments: {} });
    console.log("tools/call response:", callResult);
  } catch (error) {
    console.error("Request failed:", error);
  } finally {
    await client.close();
  }
}

main();
