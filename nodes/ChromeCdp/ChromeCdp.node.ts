/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import CDP from 'chrome-remote-interface';

export class ChromeCdp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chrome CDP',
		name: 'chromeCdp',
		icon: 'file:../../icons/chrome.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true, 
		description: 'Direct Chrome DevTools Protocol Integration',
		defaults: { name: 'Chrome CDP' },
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Host',
				name: 'host',
				type: 'string',
				default: 'host.docker.internal',
			},
			{
				displayName: 'Port',
				name: 'port',
				type: 'number',
				default: 9222,
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: 'about:blank',
				description: 'The URL to open in the new tab',
			},
			{
				displayName: 'Wait for Page Load',
				name: 'waitForPage',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for the page load event before returning',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const host = this.getNodeParameter('host', i) as string;
			const port = this.getNodeParameter('port', i) as number;
			const url = this.getNodeParameter('url', i) as string || 'about:blank';
			const waitForPage = this.getNodeParameter('waitForPage', i) as boolean;

			try {
				// 1. Create the new tab (target)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
				const target = await (CDP as any).New({ host, port, url: 'about:blank' });
				
				// 2. If we need to wait, we must connect to the new tab specifically
				if (waitForPage && url !== 'about:blank') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
					const client = await (CDP as any)({ target: target.webSocketDebuggerUrl });
					const { Page } = client;
					
					try {
						await Page.enable();
						// Start the navigation and wait for the load event
						await Promise.all([
							Page.loadEventFired(),
							Page.navigate({ url })
						]);
					} finally {
						await client.close();
					}
				} else if (url !== 'about:blank') {
					// Just trigger navigation without waiting
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const client = await (CDP as any)({ target: target.webSocketDebuggerUrl });
					await client.Page.navigate({ url });
					await client.close();
				}

				returnData.push({ 
					json: { 
						success: true,
						tabId: target.id,
						url: url,
						wsUrl: target.webSocketDebuggerUrl
					} 
				});
			} catch (err) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: err.message } });
					continue;
				}
				throw err;
			}
		}
		return [returnData];
	}
}