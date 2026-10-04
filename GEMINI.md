# Science Explorer 3D — Workspace Guidelines & Memory

See [AGENTS.md](./AGENTS.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) for the full architecture, module specifications, interaction protocols, and system memory.

### Key Rules for AI Agents:
1. **Never delete existing modules:** The application must maintain all 4 modules (`solar`, `photosynthesis`, `reproduction`, `heart`).
2. **Port & HTTPS:** The application server runs on port `3050` with `@vitejs/plugin-basic-ssl`. Never disable HTTPS because mobile WebXR and gyroscope require it.
3. **Double-Click Selection:** 3D objects are inspected via double-click / double-tap (not 5-second hold).
4. **XYZ Gizmo:** Support detaching via `[🛑 OFF XYZ (X)]` button on gizmo, HUD, mobile controller, or key <kbd>X</kbd>.
5. **WebSocket Relay:** Handled on `/ws-remote` via `vite-remote-plugin.js`. Aliases `/controller.htm` and `/controller` to `/controller.html`.
