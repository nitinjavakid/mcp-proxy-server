#!/usr/bin/env node

/**
 * This is a template MCP server that implements a simple notes system.
 * It demonstrates core MCP concepts like resources and tools by allowing:
 * - Listing notes as resources
 * - Reading individual notes
 * - Creating new notes via a tool
 * - Summarizing all notes via a prompt
 */

import { loadConfig } from "./config.js";
import { createClients } from "./client.js";
import { command, run, flag } from "cmd-ts";
import { handleStdioTransport } from "./stdio.js";
import { handleSSETransport } from "./sse.js";

const app = command({
  name: 'mcp-proxy-server',
  args: {
    sse: flag({ long: 'sse', description: 'If specified the proxy will run in SSE mode' })
  },
  handler: async ({sse}) => {
    const config = await loadConfig();
    const clients = await createClients(config.servers);

    if (sse) {
      await handleSSETransport(clients);
    } else {
      await handleStdioTransport(clients);
    }
  },
});

run(app, process.argv.slice(2));


