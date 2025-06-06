import {
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { webhookTrigger } from './executions/Webhooks';

export class OneShotWebhook implements INodeType {
	description: INodeTypeDescription = {
		displayName: '1Shot Webhook',
		name: 'oneShotWebhook',
		icon: { light: 'file:oneshot.svg', dark: 'file:oneshot.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when 1Shot sends a webhook',
		defaults: {
			name: '1Shot Webhook',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '1shot',
			},
		],
		supportsCORS: true,
		triggerPanel: {
			header: '',
			executionsHelp: {
				inactive:
					'Webhooks have two modes: test and production. <br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. <a data-key="activate">Activate</a> the workflow, then make requests to the production URL. These executions will show up in the executions list, but not in the editor.',
				active:
					'Webhooks have two modes: test and production. <br /> <br /> <b>Use test mode while you build your workflow</b>. Click the \'listen\' button, then make a request to the test URL. The executions will show up in the editor.<br /> <br /> <b>Use production mode to run your workflow automatically</b>. Since the workflow is activated, you can make requests to the production URL. These executions will show up in the <a data-key="executions">executions list</a>, but not in the editor.',
			},
			activationHint:
				"Once you've finished building your workflow, run it without having to click this button by using the production webhook URL.",
		},
		properties: [
			{
				displayName: 'Public Key',
				name: 'publicKey',
				type: 'string',
				required: true,
				default: '',
				description: 'The ED-25519 public key provided by 1Shot for webhook verification',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		return webhookTrigger.call(this);
	}
} 