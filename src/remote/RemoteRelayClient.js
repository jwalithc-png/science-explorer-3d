/**
 * WebSocket Remote Relay Client
 * Connects to the Vite backend WebSocket server at '/ws-remote'
 * to enable dual-screen PC remote control over local Wi-Fi.
 */
export class RemoteRelayClient {
  constructor(options = {}) {
    this.onMessageCallback = options.onMessage || null;
    this.ws = null;
    this.isConnected = false;
    this.reconnectTimer = null;

    this.connect();
  }

  connect() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws-remote`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[RemoteRelay] Connected to PC WebSocket bridge at', wsUrl);
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (this.onMessageCallback) {
            this.onMessageCallback(msg);
          }
        } catch (e) {
          console.warn('[RemoteRelay] Error parsing incoming message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      console.warn('[RemoteRelay] WebSocket connection failure:', e);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2500);
  }

  sendMessage(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}
