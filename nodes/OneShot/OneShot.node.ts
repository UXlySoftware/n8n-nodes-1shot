import { INodeType, INodeTypeDescription, NodeConnectionType, INodeProperties, IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { transactionOperationsFields } from './TransactionDescription';

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
				name: 'oAuth2Api',
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
				],
				default: 'transaction',
			} as INodeProperties,
			...transactionOperationsFields,
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			if (resource === 'transaction') {
				const transactionId = this.getNodeParameter('transactionId', i) as string;
				const params = this.getNodeParameter('params', i) as object;
				let url = '';
				let method: 'POST' = 'POST';

				if (operation === 'execute') {
					url = `/transactions/${transactionId}/execute`;
					// Parse the params JSON string into an object
					const paramsString = this.getNodeParameter('params', i) as string;
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
						}
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'oAuth2Api', options, additionalCredentialOptions);
					this.logger.debug('Response received', { response });
					returnData.push(response);
				} else if (operation === 'read') {
					url = `/transactions/${transactionId}/read`;
					const options = {
						method,
						url,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: params,
						json: true,
						baseURL: 'https://api.1shotapi.com/v0',
					};

					this.logger.debug('Making request', { url, options });

					const additionalCredentialOptions = {
						oauth2: {
							tokenType: 'Bearer',
							keepBearer: true,
						}
					};

					const response = await this.helpers.requestWithAuthentication.call(this, 'oAuth2Api', options, additionalCredentialOptions);
					this.logger.debug('Response received', { response });
					returnData.push(response);
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
				}
			} else {
				throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
