import { INodeProperties } from 'n8n-workflow';

export const contractMethodOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
			},
		},
		options: [
			{
				name: 'Execute',
				value: 'execute',
				description: 'Execute a contract method on the blockchain',
				action: 'Execute a contract method',
			},
			{
				name: 'Read',
				value: 'read',
				description: 'Read data from a view or pure function',
				action: 'Read data from a function',
			},
			{
				name: 'Assure Contract Methods From Prompt',
				value: 'assureContractMethodsFromPrompt',
				description: 'Make sure you have a set of Contract Methods ready to use based on your chosen Prompt',
				action: 'Assure contract methods from prompt',
			},
		],
		default: 'execute',
	},
];

const contractMethodFields: INodeProperties[] = [
	{
		displayName: 'Contract Method Name or ID',
		name: 'contractMethodId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadContractMethodExecutionOptions',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['execute'],
			},
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Contract Method Name or ID',
		name: 'contractMethodId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadContractMethodReadOptions',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['read'],
			},
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Parameters',
		name: 'params',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['contractMethods'],
			},
		},
		default: '{}',
		description:
			'The parameters to pass to the Contract Method. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contractMethods'],
				operation: ['execute'],
			},
		},
		options: [
			{
				displayName: 'Escrow Wallet ID',
				name: 'escrowWalletId',
				type: 'string',
				default: '',
				description: 'The ID of the Wallet to use for this Contract Method',
			},
			{
				displayName: 'Memo',
				name: 'memo',
				type: 'string',
				default: '',
				description: 'Optional text to include with the Transaction after the Contract Method is executed',
			},
			{
				displayName: 'Authorization List',
				name: 'authorizationList',
				type: 'json',
				default: '[]',
				description: 'List of ERC-7702 authorizations for the Contract Method',
			},
		],
	},
];

export const contractMethodOperationsFields: INodeProperties[] = [
	...contractMethodOperations,
	...contractMethodFields,
];
