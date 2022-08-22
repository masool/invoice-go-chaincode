# Hyperledger Fabric

You can use Fabric samples to get started working with Hyperledger Fabric, explore important Fabric features, and learn how to build applications that can interact with blockchain networks using the Fabric SDKs. To learn more about Hyperledger Fabric, visit the [Fabric documentation](https://hyperledger-fabric.readthedocs.io/en/latest).

## Getting started with the Fabric

To use the Hyperledger Fabric, you need to download the Fabric Docker images and the Fabric CLI tools. First, make sure that you have installed all of the [Fabric prerequisites](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html). You can then follow the instructions to [Install the Fabric Samples, Binaries, and Docker Images](https://hyperledger-fabric.readthedocs.io/en/latest/install.html) in the Fabric documentation. In addition to downloading the Fabric images and tool binaries, the Fabric samples will also be cloned to your local machine.

## HCL network

The [Fabric HCL network](HCL-network) in this repository provides a Docker Compose based HCL network with single
Organization, two peers and an ordering service node. You can use it on your local machine to run the samples listed below.
You can also use it to deploy and test your own Fabric chaincodes and applications.

## HCL Blockchain Network V2.0.0 - NFT_ERC721 POC

A Node.js app to demonstrate **__fabric-client__** & **__fabric-ca-client__** Node.js SDK APIs

### Introduction - ERC-721 token scenario

The ERC-721 token smart contract demonstrates how to create and transfer non-fungible tokens. Non-fungible tokens represent ownership over digital or physical assets. Example assets are artworks, houses, tickets, etc. Non-fungible tokens are distinguishable and we can track the ownership of each one separately.

In ERC-721, there is an account for each participant that holds a balance of tokens. A mint transaction creates a non-fungible token for an owner and adds one token in the owner's account. A transfer transaction changes the ownership of a token from the current owner to a new owner. The transfer also debits one token from the previous owner's account and credits one token to another account.

In this sample it is assumed that only one organization (played by Org1) is in an issuer role and can mint new tokens into their account, while any organization can transfer tokens from their account to a recipient's account. Accounts could be defined at the organization level or client identity level. In this sample accounts are defined at the client identity level, where every authorized client with an enrollment certificate from their organization implicitly has an account ID that matches their client ID. The client ID is simply a base64-encoded concatenation of the issuer and subject from the client identity's enrollment certificate. The client ID can therefore be considered the account ID that is used as the payment address of a recipient.

In this tutorial, you will mint and transfer tokens as follows:

A member of Org1 uses the MintWithTokenURI function to create a new non-fungible token into their account. The MintWithTokenURI smart contract function reads the certificate information of the client identity that submitted the transaction using the GetClientIdentity.GetID() API and creates a non-fungible token associated with the client ID with the requested token ID.
The same minter client will then use the TransferFrom function to transfer a non-fungible token with a requested token ID to the recipient's account. It is assumed that the recipient has provided their account ID to the transfer caller out of band. The recipient can then transfer tokens to other registered users in the same fashion.

### Prerequisites and Bring up the HCL network:

* [Docker](https://www.docker.com/products/overview) - v1.12 or higher
* [Docker Compose](https://docs.docker.com/compose/overview/) - v1.8 or higher
* [Git client](https://git-scm.com/downloads) - needed for clone commands
* **Node.js** v8.4.0 or higher
* [Download Docker images](http://hyperledger-fabric.readthedocs.io/en/latest/samples.html#binaries)

```
cd HCL_NFT_ERC721
```

Once you have completed the above setup, you will have provisioned a local network with the following docker container configuration:

* 2 CAs
* 1 orderers
* 2 peers (1 peers per Org)
* 2 Organisations (Org1 & Org2)
* 2 couchdb
* 1 Channel

#### Artifacts
* Crypto material has been generated using the **cryptogen** tool from Hyperledger Fabric and mounted to all peers, the orderering node and CA containers. More details regarding the cryptogen tool are available [here](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html#crypto-generator).
* An Orderer genesis block (genesis.block) and channel configuration transaction (ntuc-channel.tx) has been pre generated using the **configtxgen** tool from Hyperledger Fabric and placed within the artifacts folder. More details regarding the configtxgen tool are available [here](http://hyperledger-fabric.readthedocs.io/en/latest/build_network.html#configuration-transaction-generator).


## How to Run the Application

Below are the instructions given to run this application.

##### Start HCL - Blockchain network and Application

```
git clone https://github.com/masool/HCL_NFT_ERC721.git
```

```
cd HCL_NFT_ERC721
```

```
./bootstrap.sh -r ( Note: Use Sudo if any permission issues)
```
* bootstrap script will download required hyperledger fabric binaries and also pull fabric docker images if not availble.
* This launches the HCL permissioned network and can see the below output for successfull up and running the HCL network
```
HCL Business network has been statted

                                                                                 
  _   _  ____ _       _   _      _                      _      ____  _             _   
 | | | |/ ___| |     | \ | | ___| |___      _____  _ __| | __ / ___|| |_ __ _ _ __| |_ 
 | |_| | |   | |     |  \| |/ _ \ __\ \ /\ / / _ \| '__| |/ / \___ \| __/ _` | '__| __|
 |  _  | |___| |___  | |\  |  __/ |_ \ V  V / (_) | |  |   <   ___) | || (_| | |  | |_ 
 |_| |_|\____|_____| |_| \_|\___|\__| \_/\_/ \___/|_|  |_|\_\ |____/ \__\__,_|_|   \__|
                                                                                       
                                                                                 
### Generating channel configuration transaction 'HCL-channel.tx' ###
+ configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./channel-artifacts/HCL-channel.tx -channelID HCL-channel
```

```
========= All GOOD, HCL Business Network execution completed =========== 


                                                                             
  _   _  ____ _       _   _      _                 _      _____           _     
 | | | |/ ___| |     | \ | | ___| |___      _____ | | __ | ____|_ __   __| |___ 
 | |_| | |   | |     |  \| |/ _ \ __\ \ /\ / / _ \| |/ / |  _| | '_ \ / _` / __|
 |  _  | |___| |___  | |\  |  __/ |_ \ V  V / (_) |   <  | |___| | | | (_| \__ \ 
 |_| |_|\____|_____| |_| \_|\___|\__| \_/\_/ \___/|_|\_\ |_____|_| |_|\__,_|___/

                                                                             
```

* After successful launch of network can see all the required docker containers are up and running using below command.
```
docker ps -a
```

* Start client application to interact with the network using below script.
```
./fabricapi.sh
```

* If above script run scuccessfull then can see below output.
```
run enroll admin for hcl ADMIN fo org1
(node:4384) ExperimentalWarning: The fs.promises API is experimental
Wallet path: /home/masoolbabairfan/Desktop/HLF-NFT/NFT-2orgs/hcl/javascript/src/wallet
Successfully enrolled admin user "hcl-admin-org1" and imported it into the wallet
```
```
Run register user for hcl USER for org1
(node:4410) ExperimentalWarning: The fs.promises API is experimental
Wallet path: /home/masoolbabairfan/Desktop/HLF-NFT/NFT-2orgs/hcl/javascript/src/wallet
Successfully registered and enrolled admin user "hcl-user-org1" and imported it into the wallet

```
```
run enroll admin for hcl ADMIN fo org2
(node:4396) ExperimentalWarning: The fs.promises API is experimental
Wallet path: /home/masoolbabairfan/Desktop/HLF-NFT/NFT-2orgs/hcl/javascript/src/wallet
Successfully enrolled admin user "hcl-admin-org2" and imported it into the wallet

```
```
Run register user for hcl USER for org2
(node:4421) ExperimentalWarning: The fs.promises API is experimental
Wallet path: /home/masoolbabairfan/Desktop/HLF-NFT/NFT-2orgs/hcl/javascript/src/wallet
Successfully registered and enrolled admin user "hcl-user-org2" and imported it into the wallet

```
```
> ./node_modules/nodemon/bin/nodemon.js src/app.js

[nodemon] 1.19.4
[nodemon] to restart at any time, enter `rs`
[nodemon] watching dir(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node src/app.js app.js`
```

* Congractulations HCL token-erc-721 application up and running successfully.
* Starting access this application.

##### Stop Apllication and Blockchain Network

* To Stop Network
```
./stopFabric.sh
```

* To stop Api's -- Please navigate scren where node application running and give below command.
```
ctrl+c
```

## Start Blockchain Explorer

* To start and integrate explorer with fabric network,  follow the below commands.

```
cd blockchain-explorer
```

```
docker-compose up -d
```
## Stop Blockchain Explorer

```
cd blockchain-explorer
```
* Blockchain explorer Url:- http://localhost:8080/#

```
user: exploreradmin
password; exploreradminpw
```

```
docker-compose down
```
* Blockchain explorer clear volumes
```
docker-compose down -v
```
## Couchdb 
* Can access couchdb url :- http://localhost:5984/_utils/

## Initialize the contract

We can now initialize the contract. Note that we need to call the initialize function before being able to use any functions of the contract. Initialize() can be called only once.

Request payload from Org1

```
Method: POST
Url: http://ipaddress:8081/initialize_contract 
{
    "name": "HCL",
    "symbol": "HCL_symbol",
    "nameKey": "1"
}
```
Response:
```
true
```
## Mint a non-fungible token
Now that we have initialized the contract and created the identity of the minter, we can invoke the smart contract to mint a non-fungible token. we'll presume as the minter identity from Org1.

Reuqest payload:

```
Method: POST
Url: http://ipaddress:8081/MintWithTokenURI
{
    "tokenId": "101",
    "tokenURI": "https://example.com/nft101.json",
    "nameKey": "1"
}
```
Response:

```
{
    "tokenId": 101,
    "owner": "x509::/OU=client/OU=org1/OU=department1/CN=hcl-user-org1::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com",
    "tokenURI": "https://example.com/nft101.json"
}
```
The mint function validated that the client is a member of the minter organization, and then create a new non-fungible token for the minter. We can check the minter client's account balance by calling the ClientAccountBalance function.

Reuqest payload:

```
Method: GET
Url: http://ipaddress:8081/ClientAccountBalance_org1

```
The function queries the balance of the account associated with the minter client ID from Org1 and returns:
```
1
```
We can also check the owner of the issued token by calling the OwnerOf function.

Request payload:

```
Method: GET
Url: http://ipaddress:8081/OwnerOf
{
    "tokenId": "101",
    "nameKey": "1"
}
```
The function queries the owner of the non-fungible token associated with the token ID and returns:

```
x509::/OU=client/OU=org1/OU=department1/CN=hcl-user-org1::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com
```
## Transfer a non-fungible token
The minter intends to transfer a non-fungible token to the Org2 recipient, but first the Org2 recipient needs to provide their own account ID as the payment address. A client can derive their account ID from their own public certificate, but to be sure the account ID is accurate, the contract has a ClientAccountID utility function that simply looks at the callers certificate and returns the calling client's ID, which will be used as the account ID.

The Org2 recipient user can retrieve their own account ID:

Request payload:
```
Method: GET
Url: http://ipaddress:8081/ClientAccountID_org2

```
The function returns of recipient's client ID. The result shows that the subject and issuer is indeed the recipient user from Org2:

Response:
```
x509::/OU=client/OU=org2/OU=department1/CN=hcl-user-org2::/C=US/ST=California/L=San Francisco/O=org2.example.com/CN=ca.org2.example.com

```
After the Org2 recipient provides their account ID to the minter, the minter can initiate a transfer from their account to the recipient's account.

To transfer a non-fungible token, minter also needs to provide it's own account ID.  Request the transfer of a non-fungible token 101 to the recipient account:

```
Method: POST
Url: http://ipaddress:8081/TransferFrom
{
    "from": "x509::/OU=client/OU=org1/OU=department1/CN=hcl-user-org1::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com",
    "to": "x509::/OU=client/OU=org2/OU=department1/CN=hcl-user-org2::/C=US/ST=California/L=San Francisco/O=org2.example.com/CN=ca.org2.example.com",
    "tokenId": "101",
    "nameKey": "1"
}

```
Response:
```
true

```
The TransferFrom function validates ownership of the given non-fungible token. It will then change the ownership of the non-fungible token from the current owner to the recipient. It will also debit the caller's account and credit the recipient's account. Note that the sample contract will automatically create an account with zero balance for the recipient, if one does not yet exist.

let's request the minter's account balance again from Org1:

Request payload: 
```
Method: GET
Url: http://ipaddress:8081/ClientAccountBalance_org1

```
Response:
```
0

```
let's request the minter's account balance again from Org2:

Request payload: 
```
Method:GET

Url: http://ipaddress:8081/ClientAccountBalance_org2

```
Response:
```
1

```
let's check the current owner of the token.
Request payload:

```
Method:GET
Url: http://ipaddress:8081/OwnerOf
{
    "tokenId": "101",
    "nameKey": "1"
}
```
The function queries the owner of the non-fungible token associated with the token ID and returns:

```
x509::/OU=client/OU=org2/OU=department1/CN=hcl-user-org2::/C=US/ST=California/L=San Francisco/O=org2.example.com/CN=ca.org2.example.com
```
Congratulations, you've transferred a non-fungible token! The Org2 recipient can now transfer the token to other registered users in the same manner.

## License <a name="license"></a>

Hyperledger Project source code files are made available under the Apache
License, Version 2.0 (Apache-2.0), located in the [LICENSE](LICENSE) file.
Hyperledger Project documentation files are made available under the Creative
Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
