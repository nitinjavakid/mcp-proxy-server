#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./mcp-proxy.js";
import { loadConfig } from "./config.js";
import { createClients } from "./client.js";

async function main() {
  const transport = new StdioServerTransport();
  const config = await loadConfig();
  const clients = await createClients(config.servers);
  const { server, cleanup } = await createServer(clients);

  await server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();

    await Promise.all(clients.map(({cleanup}) => cleanup()));
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
