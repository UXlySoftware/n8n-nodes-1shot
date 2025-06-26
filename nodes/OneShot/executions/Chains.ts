import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { ChainInfo, PagedResponse } from '../types/1shot';
import { additionalCredentialOptions, oneshotApiBaseUrl } from '../types/constants';

export async function listChainsOperation(context: IExecuteFunctions, index: number): Promise<PagedResponse<ChainInfo>> {
	const page = context.getNodeParameter('page', index) as number;
	const pageSize = context.getNodeParameter('pageSize', index) as number;

	return await listChains(
		context,
		page, 
		pageSize,
	);
}

export async function listChains(
	context: ILoadOptionsFunctions | IExecuteFunctions,
    page?: number,
    pageSize?: number,
): Promise<PagedResponse<ChainInfo>> {
	try {
		const response: PagedResponse<ChainInfo> = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'GET',
				url: `/chains`,
				qs: {
					pageSize: pageSize ?? 25,
					page: page ?? 1,
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
		context.logger.error(`Error listing supported Chains ${error.message}`, { error });
	}

	return new PagedResponse([], 1, 1, 0);
}