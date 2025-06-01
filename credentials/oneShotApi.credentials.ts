import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class oneShotApi implements ICredentialType {
	name = 'oneShotOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = '1Shot API';

	documentationUrl = 'https://docs.1shotapi.com';

	properties: INodeProperties[] = [
		
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'clientCredentials',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.1shotapi.com/v0/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Business ID',
			name: 'businessId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Token Expiration',
			name: 'tokenExpiration',
			type: 'hidden',
			default: 3600,
			description: 'Token expiration time in seconds (default: 3600)',
		},
	];
}