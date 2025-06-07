import { INodeProperties } from "n8n-workflow";

export const chainOptions = [
	{
		name: 'Ethereum Mainnet',
		value: '1',
	},
	{
		name: 'Sepolia Testnet',
		value: '11155111',
	},
	{
		name: 'Polygon Mainnet',
		value: '137',
	},
	{
		name: 'Avalanche C-Chain',
		value: '43114',
	},
	{
		name: 'Avalanche Fuji Testnet',
		value: '43113',
	},
	{
		name: 'Polygon Mumbai Testnet',
		value: '80002',
	},
	{
		name: 'BNB Smart Chain',
		value: '56',
	},
	{
		name: 'Arbitrum One',
		value: '42161',
	},
	{
		name: 'Optimism',
		value: '10',
	},
	{
		name: 'Astar',
		value: '592',
	},
	{
		name: 'BNB Smart Chain Testnet',
		value: '97',
	},
	{
		name: 'zkSync Era',
		value: '324',
	},
	{
		name: 'Base',
		value: '8453',
	},
	{
		name: 'Base Goerli Testnet',
		value: '84532',
	},
	{
		name: 'Chiliz Chain',
		value: '88888',
	},
	{
		name: 'Palm',
		value: '11297108109',
	},
	{
		name: 'Celo',
		value: '42220',
	},
	{
		name: 'Unichain',
		value: '130',
	},
	{
		name: 'Worldchain',
		value: '480',
	},
	{
		name: 'Blast',
		value: '81457',
	},
	{
		name: 'Shibuya',
		value: '81',
	},
];

export function createChain(required: boolean, resource: string, operations: string[]): INodeProperties {
    // eslint-disable-next-line n8n-nodes-base/node-param-default-missing
    return {
		displayName: 'Chain Name or ID',
		name: 'chainId',
		type: 'options',
		options: required ? chainOptions : [{ name: 'None', value: '' }, ...chainOptions],
		required: required,
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		default: required ? '1' : '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	};
}