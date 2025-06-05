import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NewSolidityStructParam, SolidityStruct, SolidityStructParamUpdate } from '../types/1shot';

export async function updateStruct(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	structId: string,
	name?: string,
): Promise<SolidityStruct> {
	try {
		const response: SolidityStruct = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'PUT',
				url: `/structs/${structId}`,
				body: {
					name,
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
		context.logger.error(`Error updating struct ${error.message}`, { error });
		throw error;
	}
}

export async function addStructParam(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	structId: string,
	param: NewSolidityStructParam,
): Promise<SolidityStruct> {
	try {
		const response: SolidityStruct = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'POST',
				url: `/structs/${structId}/params`,
				body: param,
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
		context.logger.error(`Error adding struct param ${error.message}`, { error });
		throw error;
	}
}

export async function updateStructParams(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	structId: string,
	updates: Array<SolidityStructParamUpdate & { id: string }>,
): Promise<SolidityStruct> {
	try {
		const response: SolidityStruct = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'PUT',
				url: `/structs/${structId}/params`,
				body: {
					updates,
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
		context.logger.error(`Error updating struct params ${error.message}`, { error });
		throw error;
	}
}

export async function deleteStructParam(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	structId: string,
	structParamId: string,
): Promise<SolidityStruct> {
	try {
		const response: SolidityStruct = await context.helpers.requestWithAuthentication.call(
			context,
			'oneShotOAuth2Api',
			{
				method: 'DELETE',
				url: `/structs/${structId}/params/${structParamId}`,
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
		context.logger.error(`Error deleting struct param ${error.message}`, { error });
		throw error;
	}
}
