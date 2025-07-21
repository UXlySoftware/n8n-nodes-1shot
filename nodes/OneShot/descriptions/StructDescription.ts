import { INodeProperties } from 'n8n-workflow';

export const structOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['structs'],
			},
		},
		options: [
			{
				name: 'Update Struct',
				value: 'updateStruct',
				description: 'Update a Struct',
				action: 'Update struct',
			},
			{
				name: 'Update Struct Params',
				value: 'updateStructParams',
				description: 'Update Struct Params. You can update multiple params at once.',
				action: 'Update struct params',
			},
			{
				name: 'Add Struct Param',
				value: 'addStructParam',
				description: 'Add a new parameter to an existing Struct',
				action: 'Add struct param',
			},
			{
				name: 'Delete Struct Param',
				value: 'deleteStructParam',
				description:
					'Delete a parameter from an existing Struct. Because we require the indexes to remain in order, you can really only delete the last parameter.',
				action: 'Delete struct param',
			},
		],
		default: 'updateStruct',
	},
];

const structFields: INodeProperties[] = [
	{
		displayName: 'Struct Name or ID',
		name: 'structId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['structs'],
				operation: ['updateStruct', 'updateStructParams', 'addStructParam', 'deleteStructParam'],
			},
		},
		default: '',
		description:
			'Enter the ID of the struct you want to update or use an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Struct Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['structs'],
				operation: ['updateStruct'],
			},
		},
		default: '',
		description:
			'Enter the new name of the struct or use an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];

export const structOperationsFields: INodeProperties[] = [...structOperations, ...structFields];
