import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { createServer } from "./mcp-proxy.js";
import { createClients } from "./client.js";
import { loadConfig } from "./config.js";

const app = express();

app.use((req,res,next) =>{
  console.log(req.method, req.hostname, req.path);
  next();
});

class Connection {
  server: any;
  cleanup: any;
  transport?: SSEServerTransport;
}

const transportMap: Map<string, Connection> = new Map();

const config = await loadConfig();
const clients = await createClients(config.servers);

app.get("/sse", async (req, res) => {
  
  const { server, cleanup } = await createServer(clients);
  const transport = new SSEServerTransport(`/message`, res);

  console.log(`Created new connection with id: ${transport.sessionId}`);

  transportMap.set(transport.sessionId, {
    server,
    cleanup,
    transport
  });

  await server.connect(transport);

  server.onerror = (err) => {
    console.error(`Server onerror: ${err.stack}`)
  }

  server.onclose = ((sessionId) =>
    async () => {
      console.log(`Closing ${sessionId}`);
      await cleanup();
      await server.close();
      transportMap.delete(sessionId);
    }
  )(transport.sessionId);
});

app.post("/message", async (req, res) => {
  const sessionId = req.query["sessionId"] as string;
  console.log(`Received message for ${sessionId}`);
  const transport = transportMap.get(sessionId);
  await transport?.transport?.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3006;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Handling interrupt");

  server.close();
  for(const entry of transportMap.values()) {
    console.log(`Closing ${entry.transport?.sessionId}`);
    await entry.cleanup();
    await entry.server.close();
  }

  await Promise.all(clients.map(({cleanup}) => cleanup()));  
});