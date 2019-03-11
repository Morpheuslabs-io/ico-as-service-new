const Web3 = require("web3");
// const getConfig = require('../config')
const moment = require("moment");
const config = require('./config');
// const toDate = require('./timestampToDate')
let INFURA_ENDPOINT;
const NODE_ENV = process.env.NODE_ENV || "RINKEBY";

if (NODE_ENV === "RINKEBY") {
  INFURA_ENDPOINT = config.testnet.infuraUrl;
} else {
  INFURA_ENDPOINT = config.mainnet.infuraUrl;
}

console.log('Env: ', NODE_ENV);

function toDate(timeStamp) {
  return new Date(timeStamp * 1000);
}

/**
 * Find nearest block to given timestamp, expect timestamp in seconds
 */
async function getBlockFromTime(
  targetTimestamp,
  lowerLimitStamp,
  higherLimitStamp
) {
  // target timestamp or last midnight
  targetTimestamp =
    targetTimestamp ||
    moment
      .utc()
      .startOf("day")
      .unix();

  //   const config = await getConfig()
  const web3 = new Web3(INFURA_ENDPOINT);

  // decreasing average block size will decrease precision and also
  // decrease the amount of requests made in order to find the closest
  // block
  let averageBlockTime = 17;

  // get current block number
  let blockNumber = (await web3.eth.getBlockNumber()) - 1;
  let block = await web3.eth.getBlock(blockNumber);

  let requestsMade = 0;

  while (block.timestamp > targetTimestamp) {
    let decreaseBlocks = (block.timestamp - targetTimestamp) / averageBlockTime;
    decreaseBlocks = parseInt(decreaseBlocks);

    if (decreaseBlocks < 1) {
      break;
    }

    blockNumber -= decreaseBlocks;

    block = await web3.eth.getBlock(blockNumber);
    requestsMade += 1;
  }

  // if we undershoot the day
  if (lowerLimitStamp && block.timestamp < lowerLimitStamp) {
    while (block.timestamp < lowerLimitStamp) {
      blockNumber += 1;

      block = await web3.eth.getBlock(blockNumber);
      requestsMade += 1;
    }
  }

  if (higherLimitStamp) {
    // if we ended with a block higher than we can
    // walk block by block to find the correct one
    if (block.timestamp >= higherLimitStamp) {
      while (block.timestamp >= higherLimitStamp) {
        blockNumber -= 1;

        block = await web3.eth.getBlock(blockNumber);
        requestsMade += 1;
      }
    }

    // if we ended up with a block lower than the upper limit
    // walk block by block to make sure it's the correct one
    if (block.timestamp < higherLimitStamp) {
      while (block.timestamp < higherLimitStamp) {
        blockNumber += 1;

        const tempBlock = await web3.eth.getBlock(blockNumber);

        // can't be equal or higher than upper limit as we want
        // to find the last block before that limit
        console.log("temp ->", tempBlock.timeStamp);
        console.log("higherLimitStamp ->", higherLimitStamp);
        if (tempBlock.timestamp >= higherLimitStamp) {
          break;
        }

        block = tempBlock;

        requestsMade += 1;
      }
    }
  }

  //   console.log("tgt timestamp   ->", targetTimestamp);
  //   console.log("tgt date        ->", toDate(targetTimestamp));
  //   console.log("");

  //   console.log("block timestamp ->", block.timestamp);
  //   console.log("block timestamp ->", block.number);
  //   console.log("block date      ->", toDate(block.timestamp));
  //   console.log("");
  //   console.log("requests made   ->", requestsMade);
  return block.number;
}

function isValidAddress(addr) {
  const web3 = new Web3(INFURA_ENDPOINT);
  return web3.utils.isAddress(addr);
}

module.exports = { getBlockFromTime, isValidAddress };
