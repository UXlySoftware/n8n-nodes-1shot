import { INodeType, INodeTypeDescription, NodeConnectionType, INodeProperties, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { transactionOperationsFields } from './descriptions/TransactionDescription';
import { escrowWalletOperationsFields } from './descriptions/EscrowWalletDescription';
import { loadTransactionExecutionOptions, loadTransactionReadOptions } from './executions/options';
import { promptOperationsFields } from './descriptions/PromptDescription';

export class OneShot implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Shot',
		name: 'oneShot',
		icon: { light: 'file:oneshot.svg', dark: 'file:oneshot.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the blockchain and web3 via 1Shot API',
		defaults: {
			name: '1Shot',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'oneShotOAuth2Api',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.1shotapi.com/v0',
			url: '',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		/**
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (TransactionDescription.ts)
		 * to keep this class easy to read.
		 *
		 */
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Transaction',
						value: 'transaction',
					},
					{
						name: 'Escrow Wallet',
						value: 'escrowWallet',
					},
					{
						name: '1Shot Prompts',
						value: 'prompt',
					},
				],
				default: 'transaction',
			} as INodeProperties,
			...transactionOperationsFields,
			...escrowWalletOperationsFields,
			...promptOperationsFields,
		],
	};

	methods = {
		loadOptions: {
			loadTransactionExecutionOptions,
			loadTransactionReadOptions,
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			if (resource === 'transaction') {
				const transactionId = this.getNodeParameter('transactionId', i) as string;
				const paramsString = this.getNodeParameter('params', i) as string;
				let url = '';
				let method: 'POST' = 'POST';

				if (operation === 'execute') {
					url = `/transactions/${transactionId}/execute`;
					// Parse the params JSON string into an object
					const parsedParams = JSON.parse(paramsString);
					
					// Wrap params in the expected format
					const body = {
						params: parsedParams,
					};
					this.logger.debug('Request body', { body });

					const options = {
						method,
						url,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body,
						json: true,
						baseURL: 'https://api.1shotapi.com/v0',
					};

					this.logger.debug('Making request', { url, options });

					const additionalCredentialOptions = {
						oauth2: {
							tokenType: 'Bearer',
							keepBearer: true,
							includeCredentialsOnRefreshOnBody: true,
							property: 'access_token',
							tokenExpiredStatusCode: 403,
						}
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'oneShotOAuth2Api', options, additionalCredentialOptions);
					this.logger.debug('Response received', { response });
					returnData.push(response);
				} else if (operation === 'read') {
					url = `/transactions/${transactionId}/read`;

					// Parse the params JSON string into an object
					const parsedParams = JSON.parse(paramsString);
					
					// Wrap params in the expected format
					const body = {
						params: parsedParams,
					};
					this.logger.debug('Request body', { body });

					const options = {
						method,
						url,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body,
						json: true,
						baseURL: 'https://api.1shotapi.com/v0',
					};

					this.logger.debug('Making request', { url, options });

					const additionalCredentialOptions = {
						oauth2: {
							tokenType: 'Bearer',
							keepBearer: true,
							includeCredentialsOnRefreshOnBody: true,
							property: 'access_token',
							tokenExpiredStatusCode: 403,
						}
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'oneShotOAuth2Api', options, additionalCredentialOptions);
					this.logger.debug(`Response received: "${response}"`, { response });
					returnData.push(response);
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
				}
			} else if (resource === 'escrowWallet') {
				const chainId = this.getNodeParameter('chainId', i) as string;
				const credentials = await this.getCredentials('oneShotOAuth2Api');
        		const businessId = credentials.businessId as string;

				if (operation === 'list') {
					const options = {
						method: "GET" as const,
						url:`/business/${businessId}/wallets`,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						qs: {chainId},
						json: true,
						baseURL: 'https://api.1shotapi.com/v0',
					};

					this.logger.debug('Making request for escrow wallets', { options });

					const additionalCredentialOptions = {
						oauth2: {
							tokenType: 'Bearer',
							keepBearer: true,
							includeCredentialsOnRefresh: true,
							property: 'access_token',
							tokenExpiredStatusCode: 403,
						}
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'oneShotOAuth2Api', options, additionalCredentialOptions);
					this.logger.debug('Response received for escrow wallets', { response });
					returnData.push(response);
				}
			} else if (resource === 'prompt') {
				if (operation === 'search') {
					const query = this.getNodeParameter('query', i) as string;
					const chainId = this.getNodeParameter('chainId', i) as string;
					const options = {
						method: "POST" as const,
						url:`/contracts/descriptions/search`,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: {
							query,
							chain: chainId
						},
						json: true,
						baseURL: 'https://api.1shotapi.com/v0',
					};

					const additionalCredentialOptions = {
						oauth2: {
							tokenType: 'Bearer',
							keepBearer: true,
							includeCredentialsOnRefreshOnBody: true,
							property: 'access_token',
							tokenExpiredStatusCode: 403,
						}
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'oneShotOAuth2Api', options, additionalCredentialOptions);
					this.logger.debug('Response received for 1Shot Prompts', { response });
					returnData.push(response);
				} else if (operation === 'assureTools') {
					const credentials = await this.getCredentials('oneShotOAuth2Api');
        			const businessId = credentials.businessId as string;
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;
					const contractDescriptionId = this.getNodeParameter('contractDescriptionId', i) as string;
					const escrowWalletId = this.getNodeParameter('escrowWalletId', i) as string;
					const chainId = this.getNodeParameter('chainId', i) as string;

					const options = {
						method: "POST" as const,
						url:`/business/${businessId}/transactions/contract`,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: {
							chain: chainId,
							contractAddress,
							escrowWalletId,
							contractDescriptionId,
						},
						json: true,
						baseURL: 'https://api.1shotapi.com/v0',
					};

					const additionalCredentialOptions = {
						oauth2: {
							tokenType: 'Bearer',
							keepBearer: true,
							includeCredentialsOnRefreshOnBody: true,
							property: 'access_token',
							tokenExpiredStatusCode: 403,
						}
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'oneShotOAuth2Api', options, additionalCredentialOptions);
					this.logger.debug('Response received for 1Shot Prompts', { response });
					returnData.push(response);
				}
			} else {
				throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
