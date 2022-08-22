#!/bin/bash
echo

echo "hcl Business network has been statted"


echo "  _   _  ____ _       _   _      _                      _      ____  _             _   ";
echo " | | | |/ ___| |     | \ | | ___| |___      _____  _ __| | __ / ___|| |_ __ _ _ __| |_ ";
echo " | |_| | |   | |     |  \| |/ _ \ __\ \ /\ / / _ \| '__| |/ / \___ \| __/ _\` | '__| __|";
echo " |  _  | |___| |___  | |\  |  __/ |_ \ V  V / (_) | |  |   <   ___) | || (_| | |  | |_ ";
echo " |_| |_|\____|_____| |_| \_|\___|\__| \_/\_/ \___/|_|  |_|\_\ |____/ \__\__,_|_|   \__|";
echo "                                                                                       ";


sleep 3
CHANNEL_NAME="$1"
DELAY="$2"
MAX_RETRY="$3"
VERBOSE="$4"
: ${CHANNEL_NAME:="hcl-channel"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}

# import utils
. scripts/envVar.sh

if [ ! -d "channel-artifacts" ]; then
	mkdir channel-artifacts
fi

createChannelTx() {

	set -x
	configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
	res=$?
	set +x
	if [ $res -ne 0 ]; then
		echo "Failed to generate channel configuration transaction..."
		exit 1
	fi
	echo

}

createAncorPeerTx() {

	for orgmsp in Org1MSP Org2MSP; do

	echo "#######    Generating anchor peer update for ${orgmsp}  ##########"
	set -x
	configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/${orgmsp}anchors.tx -channelID $CHANNEL_NAME -asOrg ${orgmsp}
	res=$?
	set +x
	if [ $res -ne 0 ]; then
		echo "Failed to generate anchor peer update for ${orgmsp}..."
		exit 1
	fi
	echo
	done
}

createChannel() {
	setGlobals 0 1
	# Poll in case the raft leader is not set yet
	local rc=1
	local COUNTER=1
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
		sleep $DELAY
		set -x
		peer channel create -o localhost:7050 -c $CHANNEL_NAME --ordererTLSHostnameOverride orderer.example.com -f ./channel-artifacts/${CHANNEL_NAME}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
		set +x
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo
	echo "===================== Channel '$CHANNEL_NAME' created ===================== "
	echo
}

# queryCommitted ORG
joinChannel() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block >&log.txt
    res=$?
    set +x
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	echo
	verifyResult $res "After $MAX_RETRY attempts, peer${PEER}.org${ORG} has failed to join channel '$CHANNEL_NAME' "
}
######################### MY CHANGES #####################################################
# joinChannel () {
# 	for org in 1 2 3; do
# 	    for peer in 0 1; do
# 		joinChannelWithRetry $peer $org
# 		echo "===================== peer${peer}.${ORG_NAME} joined channel '$CHANNEL_NAME' ===================== "
# 		sleep $DELAY
# 		echo
# 	    done
# 	done
# }
######################### MY CHANGES #####################################################

updateAnchorPeers() {
  PEER=$1
  ORG=$2
  setGlobals $PEER $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
		peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
    res=$?
    set +x
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
  verifyResult $res "Anchor peer update failed"
  echo "===================== Anchor peers updated for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME' ===================== "
  sleep $DELAY
  echo
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute End-2-End Scenario ==========="
    exit 1
  fi
}

FABRIC_CFG_PATH=${PWD}/configtx

## Create channeltx
echo "### Generating channel configuration transaction '${CHANNEL_NAME}.tx' ###"
createChannelTx

## Create anchorpeertx
echo "### Generating channel configuration transaction '${CHANNEL_NAME}.tx' ###"
createAncorPeerTx

FABRIC_CFG_PATH=$PWD/../config/

## Create channel	
echo "Creating channel "$CHANNEL_NAME
createChannel

## Join all the peers to the channel
echo  "Having all peers join the channel..."
joinChannel 0 1
joinChannel 0 2
echo "Updating anchor peers for org1..."
updateAnchorPeers 0 1
echo "Updating anchor peers for org2..."
updateAnchorPeers 0 2
echo
echo "========= Channel successfully joined =========== "
echo

exit 0
