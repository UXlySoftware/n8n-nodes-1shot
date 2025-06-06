import { INodeProperties } from 'n8n-workflow';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Webhook',
				value: 'webhook',
				description: 'Receive webhooks from 1Shot',
				action: 'Receive webhooks',
			},
		],
		default: 'webhook',
	},
];

const webhookFields: INodeProperties[] = [
	{
		displayName: 'Public Key',
		name: 'publicKey',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['webhook'],
			},
		},
		default: '',
		description: 'The ED-25519 public key provided by 1Shot for webhook verification',
	},
];

export const webhookOperationsFields: INodeProperties[] = [
	...webhookOperations,
	...webhookFields,
]; 