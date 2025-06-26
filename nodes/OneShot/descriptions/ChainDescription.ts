import { INodeProperties } from 'n8n-workflow';

export const chainOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['chains'],
			},
		},
		options: [
			{
				name: 'List Chains',
				value: 'list',
				description: 'List chains supported by 1Shot API',
				action: 'List chains',
			},
		],
		default: 'list',
	},
];

const chainFields: INodeProperties[] = [
	{
		displayName: 'Page Number',
		name: 'page',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['chains'],
				operation: ['list'],
			},
		},
		default: 1,
		description: 'Enter the page number to get. This starts at 1.',
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['chains'],
				operation: ['list'],
			},
		},
		default: 25,
		description: 'Enter the size of the page to get',
	},
];

export const chainOperationsFields: INodeProperties[] = [...chainOperations, ...chainFields];
