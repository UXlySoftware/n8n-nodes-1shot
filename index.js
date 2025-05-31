module.exports = {
	nodeTypes: {
		OneShot: require('./dist/nodes/OneShot/OneShot.node.js').OneShot,
	},
	credentialTypes: {
		OneShotApi: require('./dist/credentials/OneShotApi.credentials.js').OneShotApi,
	},
};
