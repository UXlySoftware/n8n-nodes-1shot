import { INodeProperties } from 'n8n-workflow';

export const promptOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['prompt'],
			},
		},
		options: [
			{
				name: 'Search Prompts',
				value: 'search',
				description: 'Search for prompts with semantic search',
				action: 'Search prompts',
			},
		],
		default: 'search',
	},
];

const promptFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'Enter a query to search 1Shot Prompts for tools you can use in your dynamic workflow',
		required: true,
		displayOptions: {
			show: {
				resource: ['prompt'],
				operation: ['search'],
			},
		},
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
				resource: ['prompt'],
				operation: ['search'],
			},
		},
		default: '1',
		description: 'Choose from the list, or specify a Chain ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	
];

export const promptOperationsFields: INodeProperties[] = [
	...promptOperations,
	...promptFields,
]; 