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
		displayName: 'Endpoint Name or ID',
		name: 'transactionId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadTransactionExecutionOptions',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['execute'],
			},
		},
		default: '',
		description:
			'Choose from the list, or specify a Transaction ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Endpoint Name or ID',
		name: 'transactionId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadTransactionReadOptions',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['read'],
			},
		},
		default: '',
		description:
			'Choose from the list, or specify a Transaction ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
		description:
			'The parameters to pass to the transaction function. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
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
