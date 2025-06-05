# n8n-nodes-1shot

The [1Shot API](https://1shotapi.com) n8n node lets you read and write to any EVM blockchain from your n8n workflows. 1Shot API is a powerful managed wallet and transaction service for the EVM ecosystem; it ensures transactions are confirmed (handling retries and gas optimization) and sends webhook callbacks when they are finalized, making it perfect for use in any AI workflow platform. 

It also allows smart contract functions to be used like tools by agents; 1Shot Prompts provides a contract library with detailed prompts at the contract, function, input and output level so that agents and LLMs can better reason about how to use smart contracts to fullfil a user task. Additionally, 1Shot Prompts lets humans and agents search for smart contracts semantically, so you don't have manually find your target smart contract by parsing through blockscanners. 

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  <!-- delete if no auth needed -->  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history)  <!-- delete if not using this section -->  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

To install the 1Shot API node, go to your user settings and select *Community nodes* in the left-hand navigation bar. Search for `n8n-nodes-1shot`. Click install.

## Operations

The 1Shot API node supports the following operations:
- manage your 1Shot API wallets
- semantically search for smart contracts on specific networks and import them to your account as tools
- read data from and execute transaction on smart contract functions

## Credentials

You must authenticate your 1Shot API node against your business account in 1Shot API. Create a free account then create a new [API key and secret](https://app.1shotapi.com/api-keys). Then grab your business id from the [business' details](https://app.1shotapi.com/organizations) page. 

Enter these three quantities into the 1Shot node to connect n8n. 

## Compatibility

The n8n 1Shot API community node is compatible with n8n version 1.95.3 or later. 

## Usage

_This is an optional section. Use it to help users with any difficult or confusing aspects of the node._

_By the time users are looking for community nodes, they probably already know n8n basics. But if you expect new users, you can link to the [Try it out](https://docs.n8n.io/try-it-out/) documentation to help them get started._

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* See the [1Shot API documentation](https://docs.1shotapi.com) for more information on its features. 

## Version history

latest version: `0.1.1`
