import type { ICredentialType, INodeProperties } from 'n8n-workflow';
import { oneshotApiBaseUrl } from '../nodes/OneShot/types/constants';

export class oneShotOAuth2Api implements ICredentialType {
	name = 'oneShotOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = '1Shot OAuth2 API';

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
			default: `${oneshotApiBaseUrl}/token`,
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
	];
}
