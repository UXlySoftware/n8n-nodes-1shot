import { IExecuteFunctions, ILoadOptionsFunctions, NodeOperationError } from "n8n-workflow";
import { EChain, PagedResponse, ContractMethod, ContractMethodTestResult, ContractMethodEstimate, Transaction, JSONValue, ERC7702Authorization } from '../types/1shot';

export async function listContractMethods(
	context: ILoadOptionsFunctions | IExecuteFunctions,
    chainId?: EChain,
    page?: number,
    pageSize?: number,
    name?: string,
    status?: 'live' | 'archived' | 'both',
    contractAddress?: string,
    promptId?: string,
	methodType?: 'read' | 'write',
): Promise<PagedResponse<ContractMethod>> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(
				context.getNode(),
				'Business ID is required in credentials',
			);
		}

		const response: PagedResponse<ContractMethod> = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/business/${businessId}/methods`,
				qs: {
					pageSize: pageSize ?? 25,
					page: page ?? 1,
					chainId,
					name,
					status,
					contractAddress,
					promptId,
					methodType,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error listing Contract Methods ${error.message}`, { error });
	}

	return new PagedResponse([], 1, 1, 0);
}

export async function createContractMethod(
	context: IExecuteFunctions,
	chainId: EChain,
	contractAddress: string,
	walletId: string,
	name: string,
	description: string,
	functionName: string,
	stateMutability: 'nonpayable' | 'payable' | 'view' | 'pure',
	inputs: any[],
	outputs: any[],
	callbackUrl?: string,
): Promise<ContractMethod> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(
				context.getNode(),
				'Business ID is required in credentials',
			);
		}

		const response: ContractMethod = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/methods`,
				body: {
					chainId,
					contractAddress,
					walletId,
					name,
					description,
					functionName,
					stateMutability,
					inputs,
					outputs,
					callbackUrl,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error creating Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function createContractMethodsFromAbi(
	context: IExecuteFunctions,
	chainId: EChain,
	contractAddress: string,
	walletId: string,
	abi: any[],
	name?: string,
	description?: string,
	tags?: string[],
): Promise<ContractMethod[]> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(
				context.getNode(),
				'Business ID is required in credentials',
			);
		}

		const response: ContractMethod[] = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/methods/abi`,
				body: {
					chainId,
					contractAddress,
					walletId,
					abi,
					name,
					description,
					tags,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error creating Contract Methods from ABI ${error.message}`, { error });
		throw error;
	}
}

export async function assureContractMethodsFromPrompt(
	context: IExecuteFunctions,
	chainId: EChain,
	contractAddress: string,
	walletId: string,
	promptId?: string,
): Promise<ContractMethod[]> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(
				context.getNode(),
				'Business ID is required in credentials',
			);
		}

		const response: ContractMethod[] = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/business/${businessId}/methods/prompt`,
				body: {
					chainId,
					contractAddress,
					walletId,
					promptId,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error assuring Contract Methods from Prompt ${error.message}`, { error });
		throw error;
	}
}

export async function getContractMethod(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	contractMethodId: string,
): Promise<ContractMethod> {
	try {
		const response: ContractMethod = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/methods/${contractMethodId}`,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error getting Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function updateContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	chainId?: EChain,
	contractAddress?: string,
	walletId?: string,
	name?: string,
	description?: string,
	functionName?: string,
	payable?: boolean,
	nativeTransaction?: boolean,
	callbackUrl?: string | null,
): Promise<ContractMethod> {
	try {
		const response: ContractMethod = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'PUT',
				url: `/methods/${contractMethodId}`,
				body: {
					chainId,
					contractAddress,
					walletId,
					name,
					description,
					functionName,
					payable,
					nativeTransaction,
					callbackUrl,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error updating Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function deleteContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
): Promise<void> {
	try {
		await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'DELETE',
				url: `/methods/${contractMethodId}`,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);
	} catch (error) {
		context.logger.error(`Error deleting Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function testContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
): Promise<ContractMethodTestResult> {
	try {
		const response: ContractMethodTestResult = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/test`,
				body: { params },
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error testing Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function estimateContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
	walletId: string,
): Promise<ContractMethodEstimate> {
	try {
		const response: ContractMethodEstimate = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/estimate`,
				body: {
					params,
					walletId,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error estimating Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function executeContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
	walletId: string,
	memo?: string,
	authorizationList?: ERC7702Authorization[],
): Promise<Transaction> {
	try {
		const response: Transaction = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/execute`,
				body: {
					params,
					walletId,
					memo,
					authorizationList,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error executing Contract Method ${error.message}`, { error });
		throw error;
	}
}

export async function readContractMethod(
	context: IExecuteFunctions,
	contractMethodId: string,
	params: JSONValue,
): Promise<JSONValue> {
	try {
		const response: JSONValue = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/methods/${contractMethodId}/read`,
				body: { params },
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: 'https://api.1shotapi.com/v0',
			},
		);

		return response;
	} catch (error) {
		context.logger.error(`Error reading Contract Method ${error.message}`, { error });
		throw error;
	}
}