'use strict';
const { Contract} = require('fabric-contract-api');
var base64 = require('base-64');

// Define objectType names for prefix
const balancePrefix = 'balance';
const nftPrefix = 'nft';
const approvalPrefix = 'approval';

// Define key names for options
// const nameKey = 'name';
const symbolKey = 'symbol';

class TokenERC721Contract extends Contract {

  async init(ctx) {
  
    console.log("<== tokenERC721 Chaincode==>");
    
     }
     async BalanceOf(ctx, owner) {

        // There is a key record for every non-fungible token in the format of balancePrefix.owner.tokenId.
        // BalanceOf() queries for and counts all records matching balancePrefix.owner.*
        const iterator = await ctx.stub.getStateByPartialCompositeKey(balancePrefix, [owner]);

        // Count the number of returned composite keys
        let balance = 0;
        let result = await iterator.next();
        while (!result.done) {
            balance++;
            result = await iterator.next();
        }
        return balance;
    }

    /**
     * OwnerOf finds the owner of a non-fungible token
     *
     * @param {Context} ctx the transaction context
     * @param {String} tokenId The identifier for a non-fungible token
     * @returns {String} Return the owner of the non-fungible token
     */
    async OwnerOf(ctx, tokenId) {

        const nft = await this._readNFT(ctx, tokenId);
        const owner = nft.owner;
        if (!owner) {
            throw new Error('No owner is assigned to this token');
        }

        return owner;
    }
// start from here

// test from here

// async store_NftShare(ctx,tokenId_,nft_){

//     const clientMSPID = ctx.clientIdentity.getMSPID();

//     if (clientMSPID !== 'Org1MSP') {

//         throw new Error('client is not authorized to mint new tokens');

//     }

//     // Get ID of submitting client identity
//     const minter = ctx.clientIdentity.getID();
//     const tokenIdInt = parseInt(tokenId_);
//     if (isNaN(tokenIdInt)) {
//         throw new Error(`The tokenId ${tokenId_} is invalid. tokenId must be an integer`);
//     }
//    // const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId_]);
//     await ctx.stub.putState(tokenId_, Buffer.from(JSON.stringify(nft_)));
//     let response = {
//         nft:nft_
//       }
//       return JSON.stringify(response);
// }

// async getnft(ctx,tokenId_) {
 
//     let userAsBytes = await ctx.stub.getState(tokenId_); 
//     if (!userAsBytes || userAsBytes.toString().length <= 0) {
//     return({Error: "Incorrect" + tokenId_ + " ..!!"});
//         }
//     else {
//     let data=JSON.parse(userAsBytes.toString());
//     console.log(data);
//     return JSON.stringify(data);
//        }
//      }
// delete till here
    /**
     * TransferFrom transfers the ownership of a non-fungible token
     * from one owner to another owner
     *
     * @param {Context} ctx the transaction context
     * @param {String} from The current owner of the non-fungible token
     * @param {String} to The new owner
     * @param {String} tokenId the non-fungible token to transfer
     * @returns {Boolean} Return whether the transfer was successful or not
     */
    async TransferFrom(ctx, from, to, tokenId, nameKey) {
        //check contract options are already set first to execute the function
        // await this.CheckInitialized(ctx);
        const checkcontractAsBytes = await ctx.stub.getState(nameKey); 
        if (!checkcontractAsBytes || checkcontractAsBytes.toString().length <= 0) {
            return({Error: "contract options need to be set before calling any function, call Initialize() to initialize contract"});
          }

        const sender = ctx.clientIdentity.getID();

        const nft = await this._readNFT(ctx, tokenId);

        // Check if the sender is the current owner, an authorized operator,
        // or the approved client for this non-fungible token.
        const owner = nft.owner;
        const tokenApproval = nft.approved;
        const operatorApproval = await this.IsApprovedForAll(ctx, owner, sender);
        if (owner !== sender && tokenApproval !== sender && !operatorApproval) {
            throw new Error('The sender is not allowed to transfer the non-fungible token');
        }

        // Check if `from` is the current owner
        if (owner !== from) {
            throw new Error('The from is not the current owner.');
        }

        // Clear the approved client for this non-fungible token
        nft.approved = '';

        // Overwrite a non-fungible token to assign a new owner.
        nft.owner = to;
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        // Remove a composite key from the balance of the current owner
        const balanceKeyFrom = ctx.stub.createCompositeKey(balancePrefix, [from, tokenId]);
        await ctx.stub.deleteState(balanceKeyFrom);

        // Save a composite key to count the balance of a new owner
        const balanceKeyTo = ctx.stub.createCompositeKey(balancePrefix, [to, tokenId]);
        await ctx.stub.putState(balanceKeyTo, Buffer.from('\u0000'));

        // Emit the Transfer event
        const tokenIdInt = parseInt(tokenId);
        const transferEvent = { from: from, to: to, tokenId: tokenIdInt };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return true;
    }

    /**
     * IsApprovedForAll returns if a client is an authorized operator for another client
     *
     * @param {Context} ctx the transaction context
     * @param {String} owner The client that owns the non-fungible tokens
     * @param {String} operator The client that acts on behalf of the owner
     * @returns {Boolean} Return true if the operator is an approved operator for the owner, false otherwise
     */
    async IsApprovedForAll(ctx, owner, operator) {

        const approvalKey = ctx.stub.createCompositeKey(approvalPrefix, [owner, operator]);
        const approvalBytes = await ctx.stub.getState(approvalKey);
        let approved;
        if (approvalBytes && approvalBytes.length > 0) {
            const approval = JSON.parse(approvalBytes.toString());
            approved = approval.approved;
        } else {
            approved = false;
        }

        return approved;
    }

    // ============== ERC721 metadata extension ===============

    /**
     * Name returns a descriptive name for a collection of non-fungible tokens in this contract
     *
     * @param {Context} ctx the transaction context
     * @returns {String} Returns the name of the token
     */
    async Name(ctx, nameKey) {
        //check contract options are already set first to execute the function
        const checkcontractAsBytes = await ctx.stub.getState(nameKey); 
        if (!checkcontractAsBytes || checkcontractAsBytes.toString().length <= 0) {
            return({Error: "contract options need to be set before calling any function, call Initialize() to initialize contract"});
          }

        const nameAsBytes = await ctx.stub.getState(nameKey);
        return nameAsBytes.toString();
    }

    /**
     * Symbol returns an abbreviated name for non-fungible tokens in this contract.
     *
     * @param {Context} ctx the transaction context
     * @returns {String} Returns the symbol of the token
    */
    async Symbol(ctx, nameKey) {
        //check contract options are already set first to execute the function
        // await this.CheckInitialized(ctx);
        const checkcontractAsBytes = await ctx.stub.getState(nameKey); 
        if (!checkcontractAsBytes || checkcontractAsBytes.toString().length <= 0) {
            return({Error: "contract options need to be set before calling any function, call Initialize() to initialize contract"});
          }

        const symbolAsBytes = await ctx.stub.getState(symbolKey);
        return symbolAsBytes.toString();
    }

    // ============== Extended Functions for this sample ===============

    /**
     * Set optional information for a token.
     *
     * @param {Context} ctx the transaction context
     * @param {String} name The name of the token
     * @param {String} symbol The symbol of the token
     */
    async Initialize(ctx, name, symbol, nameKey) {

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to initialize contract (set the name and symbol)
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP') {
            throw new Error('client is not authorized to set the name and symbol of the token');
        }

        //check contract options are not already set, client is not authorized to change them once intitialized
        const nameBytes = await ctx.stub.getState(nameKey);
        if ((!nameBytes || nameBytes.toString().length <= 0)){
        // if (nameBytes !== undefined) {
        //     throw new Error('contract options are already set, client is not authorized to change them');
        // }

        await ctx.stub.putState(nameKey, Buffer.from(name));
        await ctx.stub.putState(symbolKey, Buffer.from(symbol));
        return true;
        } else {
            throw new Error('contract options are already set, client is not authorized to change them'); 
        }
    }

    /**
     * Mint a new non-fungible token
     *
     * @param {Context} ctx the transaction context
     * @param {String} tokenId Unique ID of the non-fungible token to be minted
     * @param {String} tokenURI URI containing metadata of the minted non-fungible token
     * @returns {Object} Return the non-fungible token object
    */
    async MintWithTokenURI(ctx, tokenId, tokenURI, nameKey) {
        //check contract options are already set first to execute the function
        // await this.CheckInitialized(ctx);
        const checkcontractAsBytes = await ctx.stub.getState(nameKey); 
        if (!checkcontractAsBytes || checkcontractAsBytes.toString().length <= 0) {
            return({Error: "contract options need to be set before calling any function, call Initialize() to initialize contract"});
          }

        // Check minter authorization - this sample assumes Org1 is the issuer with privilege to mint a new token
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP') {
            throw new Error('client is not authorized to mint new tokens');
        }

        // Get ID of submitting client identity
        const minter = ctx.clientIdentity.getID();

        // Check if the token to be minted does not exist
        const exists = await this._nftExists(ctx, tokenId);
        if (exists) {
            throw new Error(`The token ${tokenId} is already minted.`);
        }

        // Add a non-fungible token
        const tokenIdInt = parseInt(tokenId);
        if (isNaN(tokenIdInt)) {
            throw new Error(`The tokenId ${tokenId} is invalid. tokenId must be an integer`);
        }
        const nft = {
            tokenId: tokenIdInt,
            owner: minter,
            tokenURI: tokenURI
        };
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

        // A composite key would be balancePrefix.owner.tokenId, which enables partial
        // composite key query to find and count all records matching balance.owner.*
        // An empty value would represent a delete, so we simply insert the null character.
        const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [minter, tokenId]);
        await ctx.stub.putState(balanceKey, Buffer.from('\u0000'));

        // Emit the Transfer event
        const transferEvent = { from: '0x0', to: minter, tokenId: tokenIdInt };
        ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

        return nft;
    }

    async _readNFT(ctx, tokenId) {
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        const nftBytes = await ctx.stub.getState(nftKey);
        if (!nftBytes || nftBytes.length === 0) {
            throw new Error(`The tokenId ${tokenId} is invalid. It does not exist`);
        }
        const nft = JSON.parse(nftBytes.toString());
        return nft;
    }

    async _nftExists(ctx, tokenId) {
        const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
        const nftBytes = await ctx.stub.getState(nftKey);
        return nftBytes && nftBytes.length > 0;
    }

    /**
     * ClientAccountBalance returns the balance of the requesting client's account.
     *
     * @param {Context} ctx the transaction context
     * @returns {Number} Returns the account balance
     */
    async ClientAccountBalance(ctx) {

        // Get ID of submitting client identity
        const clientAccountID = ctx.clientIdentity.getID();
        return this.BalanceOf(ctx, clientAccountID);
    }

    async ClientAccountID(ctx) {

        // Get ID of submitting client identity
        const clientAccountID = ctx.clientIdentity.getID();
        return clientAccountID;
    }

 }

     module.exports = TokenERC721Contract;