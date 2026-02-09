# n8n-nodes-chrome-cdp

A high-performance n8n community node package providing direct integration with the **Chrome DevTools Protocol (CDP)**. This package is designed for low-level browser control, efficient tab management, and high-speed data extraction.

https://github.com/user-attachments/assets/8e19cdfd-9934-4b97-bd7f-d372227db5c2

## Features

* **Chrome: Create Tab**: Open new browser targets with optional navigation and native "Wait for Page Load" event handling.
* **Chrome: Read Web Page**: Extract `innerText` or `outerHTML` from an existing tab session via WebSocket.
* **Chrome: Run Script**: Execute custom asynchronous JavaScript within the page context and return JSON results directly to n8n.

## Installation

Follow the [official n8n guide](https://docs.n8n.io/integrations/community-nodes/installation/) to install this package:

1. Go to **Settings > Community Nodes** in your n8n instance.
2. Click on **Install a community node**.
3. Enter `n8n-nodes-chrome-cdp` in the **npm Package Name** field.
4. Agree to the risks and click **Install**.

## Prerequisites

This node requires a running Chromium-based browser (Chrome, Edge, or Brave) with the remote debugging port enabled.

### Recommended Startup Command
Launch your browser with the following flags to allow n8n to connect:

```bash
chrome --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --incognito
```

Note: Ensure your firewall or network settings allow traffic on port 9222.

## Node Documentation

### 1. Chrome: Create Tab
Initializes a new browser tab and returns connection details.
* **Host**: The IP or hostname of your Chrome instance.
* **URL**: The destination address (defaults to `about:blank`).
* **Wait for Page Load**: If enabled, pauses execution until the browser triggers `loadEventFired`.
<img width="1074" height="539" alt="image" src="https://github.com/user-attachments/assets/71e57a91-dcea-49d3-93d8-8d68840695bd" />

### 2. Chrome: Read Web Page
Connects to an active session to pull content without re-navigating.
* **WebSocket URL**: The `wsUrl` provided by the Create Tab node.
* **Extract Type**: Choose **Text** for a clean string or **HTML** for the raw source code.
* **Wait for Navigation**: Ensures the DOM is fully settled before extraction.
<img width="1077" height="540" alt="image" src="https://github.com/user-attachments/assets/027bf019-b692-49c6-a1f5-a0f26161d695" />

### 3. Chrome: Run Script
Injects and executes custom logic inside the browser.
* **JavaScript Code**: Your script. Supports `async/await`. Use `return` to pass data back to the workflow.
* **Wait for Navigation**: Optional flag to delay execution until the page is ready.
<img width="1370" height="719" alt="image" src="https://github.com/user-attachments/assets/27c020ae-0e7b-4ba4-bfcc-b9a353bca7f5" />

## License

[MIT](LICENSE)
