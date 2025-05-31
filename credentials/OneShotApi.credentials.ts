import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OneShotApi implements ICredentialType {
	name = '1shotApi';
	displayName = '1Shot API';
	documentationUrl = 'https://docs.1shotapi.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
		},
		{
			displayName: 'Business ID',
			name: 'businessId',
			type: 'string',
			default: '',
			required: true,
		},
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	// An example is the Http Request node that can make generic calls
	// reusing this credential
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.1shotapi.com',
			url: '/v1/me',
		},
	};

	// OAuth2 configuration
	oauth2 = {
		tokenUrl: 'https://api.1shotapi.com/v0/token',
		clientId: '={{$credentials.clientId}}',
		clientSecret: '={{$credentials.clientSecret}}',
		scope: 'read write',
		grantType: 'client_credentials',
	};
}
