import { WebSocketServer } from 'ws';

/**
 * Vite Plugin: Robust WebSocket Remote Control Relay
 * 
 * Uses noServer mode to handle ONLY '/ws-remote' upgrade requests,
 * preventing any conflict with Vite's internal HMR WebSockets.
 */
export function remoteControlPlugin() {
  return {
    name: 'vite-plugin-remote-control',
    configureServer(server) {
      // Graceful alias / redirect for controller URL variants (.htm, /controller, etc.)
      server.middlewares.use((req, res, next) => {
        try {
          const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const p = parsed.pathname.toLowerCase();
          if (p === '/controller.htm' || p === '/controller' || p === '/remote') {
            res.writeHead(302, { Location: '/controller.html' + (parsed.search || '') });
            res.end();
            return;
          }
        } catch (e) {}
        next();
      });

      const wss = new WebSocketServer({ noServer: true });
      const clients = new Set();

      wss.on('connection', (ws) => {
        clients.add(ws);

        ws.on('message', (data) => {
          // Broadcast to all other connected clients
          const msg = data.toString();
          for (const client of clients) {
            if (client !== ws && client.readyState === 1) {
              client.send(msg);
            }
          }
        });

        ws.on('close', () => {
          clients.delete(ws);
        });

        ws.on('error', () => {
          clients.delete(ws);
        });
      });

      // Handle only HTTP upgrade requests destined for '/ws-remote'
      server.httpServer?.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        if (url.pathname === '/ws-remote') {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
          });
        }
      });
    }
  };
}
