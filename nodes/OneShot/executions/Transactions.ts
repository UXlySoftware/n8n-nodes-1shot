import { IExecuteFunctions, ILoadOptionsFunctions, NodeOperationError } from 'n8n-workflow';
import { EChain, ETransactionStatus, PagedResponse, Transaction } from '../types/1shot';
import { additionalCredentialOptions, oneshotApiBaseUrl } from '../types/constants';

export async function listTransactionsOperation(context: IExecuteFunctions, index: number) {
	const chainId = context.getNodeParameter('chainId', index) as EChain;
	const page = context.getNodeParameter('page', index) as number;
	const pageSize = context.getNodeParameter('pageSize', index) as number;
	const status = context.getNodeParameter('status', index) as ETransactionStatus;
	const walletId = context.getNodeParameter('walletId', index) as string;
	const contractMethodId = context.getNodeParameter('contractMethodId', index) as string;
	const apiCredentialId = context.getNodeParameter('apiCredentialId', index) as string;
	const userId = context.getNodeParameter('userId', index) as string;

	return await listTransactions(
		context,
		chainId || undefined,
		page || undefined,
		pageSize || undefined,
		status || undefined,
		walletId || undefined,
		contractMethodId || undefined,
		apiCredentialId || undefined,
		userId || undefined,
	);
}

export async function getTransactionOperation(context: IExecuteFunctions, index: number) {
	const transactionId = context.getNodeParameter('transactionId', index) as string;
	return await getTransaction(context, transactionId);
}

export async function listTransactions(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	chainId?: EChain,
	page?: number,
	pageSize?: number,
	status?: ETransactionStatus,
	walletId?: string,
	contractMethodId?: string,
	apiCredentialId?: string,
	userId?: string,
): Promise<PagedResponse<Transaction>> {
	try {
		const credentials = await context.getCredentials('oneShotOAuth2Api');
		const businessId = credentials.businessId as string;

		if (!businessId) {
			throw new NodeOperationError(
				context.getNode(),
				'Business ID is required in credentials',
			);
		}

		const response: PagedResponse<Transaction> = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/business/${businessId}/transactions`,
				qs: {
					chainId,
					pageSize: pageSize ?? 25,
					page: page ?? 1,
					status,
					walletId,
					contractMethodId,
					apiCredentialId,
					userId,
				},
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: oneshotApiBaseUrl,
			},
			additionalCredentialOptions,
		);

		return response;
	} catch (error) {
		context.logger.error(`Error listing transactions ${error.message}`, { error });
		throw error;
	}
}

export async function getTransaction(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	transactionId: string,
): Promise<Transaction> {
	try {
		const response: Transaction = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/transactions/${transactionId}`,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				json: true,
				baseURL: oneshotApiBaseUrl,
			},
			additionalCredentialOptions,
		);

		return response;
	} catch (error) {
		context.logger.error(`Error getting transaction ${error.message}`, { error });
		throw error;
	}
}
