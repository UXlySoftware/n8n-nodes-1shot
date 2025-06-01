import { INodeProperties } from 'n8n-workflow';

export const escrowWalletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['escrowWallet'],
			},
		},
		options: [
			{
				name: 'List Escrow Wallets',
				value: 'list',
				description: 'List escrow wallets for a given chain',
				action: 'List escrow wallets',
				routing: {
					request: {
						method: 'POST',
						url: '=/transactions/{{$parameter.transactionId}}/execute',
					},
				},
			},
		],
		default: 'list',
	},
];

const escrowWalletFields: INodeProperties[] = [
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
		description: 'Choose from the list, or specify a Chain ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	
];

export const escrowWalletOperationsFields: INodeProperties[] = [
	...escrowWalletOperations,
	...escrowWalletFields,
]; 