import { INodeProperties } from 'n8n-workflow';

export const transactionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{
				name: 'Execute',
				value: 'execute',
				description: 'Execute a transaction on the blockchain',
				action: 'Execute a transaction',
				routing: {
					request: {
						method: 'POST',
						url: '=/transactions/{{$parameter.transactionId}}/execute',
					},
				},
			},
			{
				name: 'Read',
				value: 'read',
				description: 'Read data from a view or pure function',
				action: 'Read data from a function',
				routing: {
					request: {
						method: 'POST',
						url: '=/transactions/{{$parameter.transactionId}}/read',
					},
				},
			},
		],
		default: 'execute',
	},
];

const transactionFields: INodeProperties[] = [
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		default: '',
		description: 'The ID of the transaction to execute or read from',
	},
	{
		displayName: 'Parameters',
		name: 'params',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		default: '{}',
		description: 'The parameters to pass to the transaction function. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['execute'],
			},
		},
		options: [
			{
				displayName: 'Escrow Wallet ID',
				name: 'escrowWalletId',
				type: 'string',
				default: '',
				description: 'The ID of the escrow wallet to use for this transaction',
			},
			{
				displayName: 'Memo',
				name: 'memo',
				type: 'string',
				default: '',
				description: 'Optional text to include with the transaction execution',
			},
			{
				displayName: 'Authorization List',
				name: 'authorizationList',
				type: 'json',
				default: '[]',
				description: 'List of ERC-7702 authorizations for the transaction',
			},
		],
	},
];

export const transactionOperationsFields: INodeProperties[] = [
	...transactionOperations,
	...transactionFields,
]; 