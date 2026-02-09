

n8n-nodes-chrome-cdp
A high-performance n8n community node package providing direct integration with the Chrome DevTools Protocol (CDP). Designed for low-level browser control, tab management, and efficient data extraction in self-hosted environments.

Features
Chrome: Create Tab: Open new tabs (targets) with optional navigation and "Wait for Page Load" events.

Chrome: Read Web Page: Extract innerText (text) or outerHTML (raw source) from an existing tab using its WebSocket URL.

Chrome: Run Script: Execute custom JavaScript within a tab's context with support for async/await and JSON result returns.

Installation
For Self-Hosted n8n (Docker)
This package is designed for portability. To use it in a Docker environment:

Build the project on the host machine: npm run build (This will compile the TypeScript and bundle the chrome-remote-interface dependency into the dist/node_modules folder).

Mount the volume in the docker run command or docker-compose.yaml: -v "/project-root/dist:/home/node/.n8n/custom/node_modules/n8n-nodes-chrome-cdp"

Restart n8n to register the nodes.

Prerequisites
You must run a Chromium-based browser with the remote debugging port open.

Recommended Startup Command: chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --incognito --user-data-dir=$(mktemp -d -t 'chrome-remote_profile')

Note: Use host.docker.internal as the Host in n8n nodes to connect from the container to the host machine.

Node Descriptions
1. Create Tab
Host: The IP or hostname of the Chrome instance (default: host.docker.internal).

URL: The initial page to load (default: about:blank).

Wait for Page Load: If enabled, the node will wait for the browser's loadEventFired before returning.

2. Read Web Page
WebSocket URL: Pass the wsUrl from the Create Tab node.

Extract Type: Choose between Text or HTML.

Wait for Navigation: Ensures the page is fully settled before reading content.

3. Run Script
JavaScript Code: Custom script to run. Use return to send data back to n8n.

Wait for Navigation: Optional pause to ensure the target is ready for script execution.

License
MIT