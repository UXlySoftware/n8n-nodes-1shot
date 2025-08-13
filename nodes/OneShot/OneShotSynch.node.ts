import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';
import { oneshotApiBaseUrl } from './types/constants';
import {
	executeAndWaitContractMethodOperation,
	executeAsDelegatorAndWaitContractMethodOperation,
} from './executions/ContractMethods';
import { loadContractMethodExecutionOptions } from './executions/options';

export class OneShotSynch implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Shot API Submit & Wait',
		name: 'oneShotSynch',
		icon: { light: 'file:oneshot.svg', dark: 'file:oneshot.svg' },
		group: ['transform'],
		version: 1,
		subtitle: 'Execute and wait for transaction completion',
		description: 'Execute a contract method and wait for the transaction to complete',
		defaults: {
			name: '1Shot API Submit & Wait',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main, NodeConnectionType.Main],
		outputNames: ['Success', 'Error'],
		usableAsTool: true,
		credentials: [
			{
				name: 'oneShotOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: oneshotApiBaseUrl,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {},
				options: [
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a contract method on the blockchain',
						action: 'Execute a contract method',
					},
					{
						name: 'Execute as Delegator',
						value: 'executeAsDelegator',
						description:
							'Execute a contract method on the blockchain using a stored ERC-7702 delgation',
						action: 'Execute a contract method as delegator',
					},
				],
				default: 'execute',
			},
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
						operation: ['execute', 'executeAsDelegator'],
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
						operation: ['execute', 'executeAsDelegator'],
					},
				},
				default: '{}',
				description:
					'The parameters to pass to the Contract Method. Enter a JSON object (e.g., {"to": "0x3e6a2f0CBA03d293B54c9fCF354948903007a798", "amount": "10000"}).',
			},
			{
				displayName: 'Delegator Wallet Address',
				name: 'delegatorWalletAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeAsDelegator'],
					},
				},
				default: '',
				description: 'The address of the delagator wallet to use for the contract method',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['execute', 'executeAsDelegator'],
					},
				},
				options: [
					{
						displayName: 'Wallet ID',
						name: 'walletId',
						type: 'string',
						default: '',
						description: 'The ID of the Wallet to use for this Contract Method',
					},
					{
						displayName: 'Memo',
						name: 'memo',
						type: 'string',
						default: '',
						description:
							'Optional text to include with the Transaction after the Contract Method is executed',
					},
					{
						displayName: 'Gas Limit',
						name: 'gasLimit',
						type: 'string',
						default: '',
						description:
							'The gas limit to use for the Contract Method. If not provided, the default gas limit will be used.',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			loadContractMethodExecutionOptions,
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];
		const errorData = [];

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			if (operation === 'execute') {
				const response = await executeAndWaitContractMethodOperation(this, i);
				if (response.success) {
					returnData.push({ ...response.result } as IDataObject);
				} else {
					errorData.push({ ...response.result } as IDataObject);
				}
			} else if (operation === 'executeAsDelegator') {
				const response = await executeAsDelegatorAndWaitContractMethodOperation(this, i);
				if (response.success) {
					returnData.push({ ...response.result } as IDataObject);
				} else {
					errorData.push({ ...response.result } as IDataObject);
				}
			}
		}

		return [this.helpers.returnJsonArray(returnData), this.helpers.returnJsonArray(errorData)];
	}
}
