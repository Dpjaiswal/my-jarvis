# Aria OS - Desktop Client 💻

This is the native desktop client for **Aria OS**, scaffolding a high-performance **Vite + React** frontend designed to be seamlessly bundled with **Tauri**.

## ⚙️ Application Workflow (Tauri Architecture)

Unlike the Web client, the Desktop client is meant to run continuously as a background OS process, acting as a deep system integration layer.

1. **Native OS Hooks:** Using Tauri's Rust backend (to be implemented), this client can hook into global keyboard shortcuts (e.g., `Cmd+Space` to summon Aria), the system tray, and local file systems.
2. **Local IPC (Inter-Process Communication):** The Vite React frontend communicates with the Rust backend to read local system states or parse documents.
3. **Core Orchestration:** When an AI intent is required, the Desktop client proxies the request to the central **Aria API** (FastAPI).
4. **Zero-Latency Execution:** Because everything (the Vite frontend, Tauri Rust backend, FastAPI, and Ollama) runs on the same local hardware, the entire network loop happens on `localhost`, ensuring lightning-fast responses with zero external data leakage.

## 🚀 Getting Started

### Installation

```bash
# Navigate to the desktop app directory
cd apps/desktop

# Install dependencies
npm install
```

### Running the Development Server (React Only)

```bash
npm run dev
```
*(This runs the React UI in the browser for rapid prototyping).*

### Building for Tauri (Future Phase)
Once the Tauri CLI is fully integrated, you will be able to compile this into a standalone `.dmg`, `.app`, or `.exe` binary that consumes less than 50MB of RAM.
