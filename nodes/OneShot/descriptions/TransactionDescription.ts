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
				name: 'List Transactions',
				value: 'list',
				description: 'List Transactions with filters',
				action: 'List transactions',
			},
			{
				name: 'Get Transaction',
				value: 'get',
				description: 'Get a specific Transaction',
				action: 'Get transaction',
			},
		],
		default: 'list',
	},
];

const transactionFields: INodeProperties[] = [
	{
		displayName: 'Transaction Name or ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['get'],
			},
		},
		default: '',
		description:
			'Enter the Transaction ID you want to get',
	},
	{
		displayName: 'Chain Name or ID',
		name: 'chainId',
		type: 'options',
		options: [
			{
				name: 'Ethereum',
				value: '1',
			},
			{
				name: 'Sepolia',
				value: '11155111',
			},
			{
				name: 'Base',
				value: '8453',
			},
			{
				name: 'Base Sepolia',
				value: '84531',
			},
			{
				name: 'Avalanche',
				value: '43114',
			},
			{
				name: 'Avalanche Fuji',
				value: '43113',
			},
		],
		required: true,
		displayOptions: {
			show: {
				resource: ['escrowWallet'],
				operation: ['list'],
			},
		},
		default: '1',
		description:
			'Choose from the list, or specify a Chain ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const transactionOperationsFields: INodeProperties[] = [
	...transactionOperations,
	...transactionFields,
];
