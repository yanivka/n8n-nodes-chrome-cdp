import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import CDP from 'chrome-remote-interface';

export class ChromeCdpGetWebPage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chrome: Read Web Page',
		name: 'chromeCdpGetWebPage', // Fixed to match class/convention
		icon: 'file:../../icons/chrome.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		description: 'Read a web page content',
		defaults: { name: 'Read Web Page' },
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'WebSocket URL',
				name: 'wsUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'The wsUrl returned from the Create Tab node',
			},
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{ name: 'Extract Page Content', value: 'extract' },
				],
				default: 'extract',
			},
			{
				displayName: 'Wait for Navigation',
				name: 'waitForNavigation',
				type: 'boolean',
				default: false,
				description: 'Whether to wait for the page load event before extracting data', // Removed period
			},
			{
				displayName: 'Extract Type',
				name: 'extractType',
				type: 'options',
				displayOptions: {
					show: {
						action: ['extract'],
					},
				},
				options: [
					{ name: 'Text (innerText)', value: 'text' },
					{ name: 'HTML (OuterHTML)', value: 'html' },
				],
				default: 'text',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const targetWsUrl = this.getNodeParameter('wsUrl', i) as string;
			const extractType = this.getNodeParameter('extractType', i) as string;
			const waitForNavigation = this.getNodeParameter('waitForNavigation', i) as boolean;

			let client;
			try {
				// Replaced 'any' with proper CDP call
				client = await CDP({ target: targetWsUrl });
				const { Runtime, Page } = client;
				
				await Promise.all([Runtime.enable(), Page.enable()]);

				if (waitForNavigation) {
					await Page.loadEventFired();
				}

				const expression = extractType === 'text' 
					? 'document.body.innerText' 
					: 'document.documentElement.outerHTML';

				const { result } = await Runtime.evaluate({
					expression,
					returnByValue: true,
				});

				returnData.push({
					json: {
						success: true,
						data: result.value,
						type: extractType,
					},
				});
			} catch (err) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: err.message } });
					continue;
				}
				throw err;
			} finally {
				if (client) await client.close();
			}
		}
		return [returnData];
	}
}

