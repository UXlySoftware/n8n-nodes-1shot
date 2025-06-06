import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { listContractMethods } from './ContractMethods';

export async function loadContractMethodExecutionOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return loadContractMethodOptions(this, "write");
}

export async function loadContractMethodReadOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return loadContractMethodOptions(this, "read");
}

export async function loadContractMethodAllOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return loadContractMethodOptions(this, undefined);
}

async function loadContractMethodOptions(
	loadOptionsFunctions: ILoadOptionsFunctions,
	methodType?: "read" | "write",
): Promise<INodePropertyOptions[]> {
	const options: INodePropertyOptions[] = [];

	const contractMethods = await listContractMethods(loadOptionsFunctions,
		undefined,
		1, // page
		1000, // pageSize
		undefined, // chainId
		undefined, // contractId
		undefined, // contractMethodId
		methodType, // methodType
	);

	for (const contractMethod of contractMethods.response) {
		options.push({
			name: contractMethod.name,
			value: contractMethod.id,
			description: contractMethod.description || '',
		});
	}

	return options;
}
