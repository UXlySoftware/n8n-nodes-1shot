import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { EChain, FullPrompt } from '../types/1shot';

export async function searchPrompts(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	query: string,
	chainId?: EChain,
): Promise<FullPrompt[]> {
	try {
		const response: FullPrompt[] = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: '/prompts/search',
				body: {
					query,
					chainId,
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
		context.logger.error(`Error searching prompts ${error.message}`, { error });
		throw error;
	}
}
