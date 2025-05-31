import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import { transactionOperationsFields } from './TransactionDescription';

export class OneShot implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Shot',
		name: 'oneShot',
		icon: { light: 'file:oneshot.svg', dark: 'file:oneshot.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the blockchain and web3 via 1Shot API',
		defaults: {
			name: '1Shot',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: '1shotApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.1shotapi.com/v0',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		/**
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (TransactionDescription.ts)
		 * to keep this class easy to read.
		 *
		 */
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Transaction',
						value: 'transaction',
					},
				],
				default: 'transaction',
			},
			...transactionOperationsFields,
		],
	};
}
