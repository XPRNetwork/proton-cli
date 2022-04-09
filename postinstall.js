const ProtocolRegistry = require("protocol-registry")
const path = require('path')
ProtocolRegistry.register({
    protocol: "proton", // sets protocol for your command , testproto://**
    command: `${path.join(__dirname, 'bin/dev')} psr $_URL_`, // this will be executed with a extra argument %url from which it was initiated
    override: true, // Use this with caution as it will destroy all previous Registrations on this protocol
    terminal: true, // Use this to run your command inside a terminal
    script: false,
}).then(async () => {
    console.log("Successfully registered proton: handler");
});