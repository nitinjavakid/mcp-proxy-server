import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConnectedClient } from "./client.js";
import { createServer } from "./mcp-proxy.js";

export async function handleStdioTransport(clients: ConnectedClient[]) {
    const { server, cleanup } = await createServer(clients);
    const transport = new StdioServerTransport();
  
    await server.connect(transport);
  
    const gracefulShutdown = async (signal) => {
      await transport.close();
      await server.close();
      await cleanup();
      await Promise.all(clients.map(({ cleanup }) => cleanup()));
    };
  
    // Cleanup on exit
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
}