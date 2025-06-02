import {
	ILoadOptionsFunctions,
	INodePropertyOptions,
    NodeOperationError,
} from 'n8n-workflow';

export async function loadTransactionExecutionOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return loadTransactionOptions(this, true);
}

export async function loadTransactionReadOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return loadTransactionOptions(this, false);
}

async function loadTransactionOptions(loadOptionsFunctions: ILoadOptionsFunctions, executable: boolean): Promise<INodePropertyOptions[]> {
    const options: INodePropertyOptions[] = [];
    
    try {
        // Get the credentials to access businessId
        const credentials = await loadOptionsFunctions.getCredentials('oneShotOAuth2Api');
        const businessId = credentials.businessId as string;

        if (!businessId) {
            throw new NodeOperationError(loadOptionsFunctions.getNode(), 'Business ID is required in credentials');
        }

        const response = await loadOptionsFunctions.helpers.requestWithAuthentication.call(loadOptionsFunctions, 'oneShotOAuth2Api', 
            {
                method: "GET",
                url: `/business/${businessId}/transactions?`,
                qs: {
                    pageSize: 100,
                    page: 1,
                    stateMutability: executable ? ["NonPayable", "Payable"] : ["View", "Pure"],
                },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                json: true,
                baseURL: 'https://api.1shotapi.com/v0',
            }
        );

        for (const transaction of response.response) {
            options.push({
                name: transaction.name || transaction.id,
                value: transaction.id,
                description: transaction.description || '',
            });
        }
        
    } catch (error) {
        loadOptionsFunctions.logger.error(`Error loading transactions ${error.message}`, { error });
    }

    return options;
}