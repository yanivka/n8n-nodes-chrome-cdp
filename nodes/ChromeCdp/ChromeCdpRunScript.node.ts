import {
    ApplicationError,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import CDP from 'chrome-remote-interface';

export class ChromeCdpRunScript implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Chrome: Run Script',
		name: 'chromeCdpRunScript',
		icon: 'file:../../icons/chrome.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		description: 'Execute JavaScript in an existing Chrome tab',
		defaults: { name: 'Run Script' },
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
				displayName: 'JavaScript Code',
				name: 'jsCode',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: 'return document.title;',
				required: true,
				description: 'The JavaScript code to execute. Use "return" to send data back.',
			},
			{
				displayName: 'Wait for Navigation',
				name: 'waitForNavigation',
				type: 'boolean',
				default: false,
				description: 'Whether to wait for the page load event before running the script',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const targetWsUrl = this.getNodeParameter('wsUrl', i) as string;
			const jsCode = this.getNodeParameter('jsCode', i) as string;
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

				const expression = `(async () => { ${jsCode} })()`;

				const { result, exceptionDetails } = await Runtime.evaluate({
					expression,
					awaitPromise: true,
					returnByValue: true,
				});

				if (exceptionDetails) {
					throw new ApplicationError(`Script Error: ${exceptionDetails?.exception?.description}`);
				}

				returnData.push({
					json: {
						success: true,
						result: result.value,
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