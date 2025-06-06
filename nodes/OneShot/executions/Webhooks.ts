import { IWebhookFunctions, IWebhookResponseData } from 'n8n-workflow';
import { verifyAsync } from '../crypto/ED25519';


export async function webhookTrigger(
	this: IWebhookFunctions,
): Promise<IWebhookResponseData> {
	const publicKey = this.getNodeParameter('publicKey') as string;
	const body = this.getBodyData();
	const signature = body.signature as string;

    console.log(`Received webhook with signature: ${signature}`);
    console.log(`Received webhook with body: `, body);
    console.log(`Received webhook with publicKey: ${publicKey}`);

	if (!signature) {
		throw new Error('No signature provided in webhook payload');
	}


    // Testing
//     const privKey = utils.randomPrivateKey(); // Secure random private key
//   const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
//   const pubKey = await getPublicKeyAsync(privKey); // Sync methods below
//   const testSig = await signAsync(message, privKey);
//   const testValid = await verifyAsync(testSig, message, pubKey);
//   this.logger.info(`CHARLIE: Test valid: ${testValid}`);

	// Remove signature from body before verification
	const { signature: _, ...payloadWithoutSignature } = body;

	const isValid = await verify1ShotSignature(publicKey, signature, payloadWithoutSignature);
	if (!isValid) {
		throw new Error('1Shot: Signature verification failed');
	}

	return {
		workflowData: [
			[
				{
					json: body,
				},
			],
		],
	};
} 

// ED-25519 signature verification
async function verify1ShotSignature(publicKey: string, signature: string, payload: any): Promise<boolean> {
	try {
        // Convert the public key from base64 to bytes
        const publicKeyBytes = Buffer.from(publicKey, 'base64');
    
        // Convert the signature from base64 to bytes
        const signatureBytes = Buffer.from(signature, 'base64');
    
        // Sort all object keys recursively and create a canonical JSON string
        const sortedData = sortObjectKeys(payload);
        const message = JSON.stringify(sortedData);
        console.log(`CHARLIE: Message: ${message}`);
    
        // Convert the message to UTF-8 bytes
        const messageBytes = new TextEncoder().encode(message);
    
        // Verify the signature
        return await verifyAsync(signatureBytes, messageBytes, publicKeyBytes);
      } catch (error) {
        // If any error occurs during validation, return false
        return false;
      }
}

/**
 * Recursively sorts object keys alphabetically
 * @param obj - The object to sort
 * @returns A new object with sorted keys
 */
function sortObjectKeys(obj: Record<string, any>): Record<string, any> {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
  
    return Object.keys(obj)
      .sort()
      .reduce((result: Record<string, any>, key: string) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
      }, {});
  }