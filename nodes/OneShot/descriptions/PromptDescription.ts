import { INodeProperties } from 'n8n-workflow';
import { createChain } from './CommonDescriptions';

export const promptOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['prompts'],
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
		description:
			'Enter a query to search 1Shot Prompts for tools you can use in your dynamic workflow',
		required: true,
		displayOptions: {
			show: {
				resource: ['prompts'],
				operation: ['search'],
			},
		},
	},
	createChain(false, 'prompts', ['search']),
];

export const promptOperationsFields: INodeProperties[] = [...promptOperations, ...promptFields];
