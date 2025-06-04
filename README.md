![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# 1Shot API n8n Node

This repo contains the implementation of the [1Shot API](https://1shotapi.com) n8n node. 1Shot API is a powerful managed wallet and transaction service for the EVM ecosystem. It lets you read and write to smart contracts on any public EVM network with simple API calls. It ensures transactions are confirmed (handling retries and gas optimization) and sends webhook callbacks when they are finalized, making it perfect for AI worflow platforms like [n8n](https://n8n.io/). 

It also allows smart contract functions to be used like tools by agents; 1Shot Prompts provides a contract library with detailed prompts at the contract, function, input and output level so that agents and LLMs can better reason about how to use smart contracts to fullfil a user task. Additionally, 1Shot Prompts lets humans and agents search for smart contracts semantically, so you don't have manually find your target smart contract by parsing through blockscanners. 

## Running the Node

First, clone this repository and copy `example.env` into `docker-compose.env`:

```sh
git clone https://github.com/UXlySoftware/n8n-nodes-1shot.git
cd n8n-nodes-1shot
cp example.env docker-compose.env
```

Next, make a free account on 1Shot API and create an [API Key and Secret](https://app.1shotapi.com/api-keys), you'll use this to authenticate the 1Shot API node in n8n. You'll also want to grab your 1Shot API business ID from your [organization's detail](https://app.1shotapi.com/organizations) page. 

Finally, make a free [ngrok](https://ngrok.com/) account, its a tunneling service that will allow you to log into your n8n node from the internet. Create a free [ngrok domain](https://dashboard.ngrok.com/domains) and past the domain into the `NGROK_DOMAIN` variable in `docker-compose.env`. Lastly, grab your [ngrok auth token ](https://dashboard.ngrok.com/get-started/your-authtoken) and paste it into the `NGROK_AUTHTOKEN` variable in `docker-compose.env`. 

Make sure you have [docker](https://docs.n8n.io/hosting/installation/docker/) installed on the machine you are going to run n8n on and start up the node:

```sh
docker compose --env-file docker-compose.env up -d
```

You should now be able to access the [ngrok inspection dashboard](http://localhost:4040/). It should show a link to your ngrok domain that you can click to take you to the n8n login page for your n8n stack. 

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
