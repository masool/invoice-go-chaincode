/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require("fabric-ca-client");
const fs = require('fs');
const path = require('path');
const { BlockDecoder } = require("fabric-common");
const channelName = "hcl-channel";

/***************************************** CHAINCODES ***********************************************/

exports.Org1 = async function(type,args) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..','..','..', 'hcl-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        var response = {};

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('hcl-user-org1');
        if (!identity) {
            console.log('An identity for the user "hcl-user-org1" does not exist in the wallet');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'hcl-user-org1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('hcl-channel');

        // Get the contract from the network.
        const contract = network.getContract('tokenERC721');
        let result='';
        if (type == "INVOKE"){
           result = await contract.submitTransaction(...args)
         } else if (type == "QUERY"){
           result = await contract.evaluateTransaction(...args)
         }
        //const result = await contract.submitTransaction(...args);
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        return result

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}

exports.Org2 = async function(type,args) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..','..','..', 'hcl-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        var response = {};

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('hcl-user-org2');
        if (!identity) {
            console.log('An identity for the user "hcl-user-org2" does not exist in the wallet');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'hcl-user-org2', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('hcl-channel');

        // Get the contract from the network.
        const contract = network.getContract('tokenERC721');
        let result='';
        if (type == "INVOKE"){
           result = await contract.submitTransaction(...args)
         } else if (type == "QUERY"){
           result = await contract.evaluateTransaction(...args)
         }
        //const result = await contract.submitTransaction(...args);
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();
        return result

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        response.error = error.message;
        return response;
    }
}