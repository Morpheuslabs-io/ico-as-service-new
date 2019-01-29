/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;
import "./StandardTokenExt.sol";
import "./SafeMath.sol";

/**
 * A token that can increase its supply by another contract.
 *
 * This allows uncapped crowdsale by dynamically increasing the supply when money pours in.
 * Only mint agents, contracts whitelisted by owner, can mint new tokens.
 *
 */
contract MintableTokenExt is StandardTokenExt {

  bool public mintingFinished = false;

  /** List of agents that are allowed to create new tokens */
  mapping(address => bool) public mintAgents;

  event MintingAgentChanged(address addr, bool state);

  /** inPercentageUnit is percents of tokens multiplied to 10 up to percents decimals.
  * For example, for reserved tokens in percents 2.54%
  * inPercentageUnit = 254
  * inPercentageDecimals = 2
  */
  struct ReservedTokensData {
    uint inTokens;
    uint inPercentageUnit;
    uint inPercentageDecimals;
    bool isReserved;
    bool isDistributed;
  }

  mapping(address => ReservedTokensData) public reservedTokensList;
  address[] public reservedTokensDestinations;
  uint public reservedTokensDestinationsLen = 0;
  bool reservedTokensDestinationsAreSet = false;

  modifier onlyMintAgent() {
    // Only crowdsale contracts are allowed to mint new tokens
    require (mintAgents[msg.sender]);
    _;
  }

  /** Make sure we are not done yet. */
  modifier canMint() {
    require (!mintingFinished);
    _;
  }

  function finalizeReservedAddress(address addr) public onlyMintAgent canMint {
    ReservedTokensData storage reservedTokensData = reservedTokensList[addr];
    reservedTokensData.isDistributed = true;
  }

  function isAddressReserved(address addr) public constant returns (bool isReserved) {
    return reservedTokensList[addr].isReserved;
  }

  function areTokensDistributedForAddress(address addr) public constant returns (bool isDistributed) {
    return reservedTokensList[addr].isDistributed;
  }

  function getReservedTokens(address addr) public constant returns (uint inTokens) {
    return reservedTokensList[addr].inTokens;
  }

  function getReservedPercentageUnit(address addr) public constant returns (uint inPercentageUnit) {
    return reservedTokensList[addr].inPercentageUnit;
  }

  function getReservedPercentageDecimals(address addr) public constant returns (uint inPercentageDecimals) {
    return reservedTokensList[addr].inPercentageDecimals;
  }

  function setReservedTokensListMultiple(
    address[] addrs,
    uint[] inTokens,
    uint[] inPercentageUnit,
    uint[] inPercentageDecimals
  ) public canMint onlyOwner {
    assert(!reservedTokensDestinationsAreSet);
    assert(addrs.length == inTokens.length);
    assert(inTokens.length == inPercentageUnit.length);
    assert(inPercentageUnit.length == inPercentageDecimals.length);
    for (uint iterator = 0; iterator < addrs.length; iterator++) {
      if (addrs[iterator] != address(0)) {
        setReservedTokensList(addrs[iterator], inTokens[iterator], inPercentageUnit[iterator], inPercentageDecimals[iterator]);
      }
    }
    reservedTokensDestinationsAreSet = true;
  }

  /**
   * Create new tokens and allocate them to an address.
   * Only callably by a crowdsale contract (mint agent).
   */
  function mint(address receiver, uint amount) onlyMintAgent canMint public {
    totalSupply = safeAdd(totalSupply, amount);
    balances[receiver] = safeAdd(balances[receiver], amount);

    // This will make the mint transaction apper in EtherScan.io
    // We can remove this after there is a standardized minting event
    Transfer(0, receiver, amount);
  }

  /**
   * Owner can allow a crowdsale contract to mint new tokens.
   */
  function setMintAgent(address addr, bool state) onlyOwner canMint public {
    mintAgents[addr] = state;
    MintingAgentChanged(addr, state);
  }

  /**
   * Owner can allow a crowdsale contract to mint new tokens.
   */
  function setMintAgentMany(address[] addrList) onlyOwner canMint public {
    for (uint i = 0; i < addrList.length; i++) {
      setMintAgent(addrList[i], true);
    }
  }

  function setReservedTokensList(address addr, uint inTokens, uint inPercentageUnit, uint inPercentageDecimals) private canMint onlyOwner {
    assert(addr != address(0));
    if (!isAddressReserved(addr)) {
      reservedTokensDestinations.push(addr);
      reservedTokensDestinationsLen++;
    }

    reservedTokensList[addr] = ReservedTokensData({
      inTokens : inTokens,
      inPercentageUnit : inPercentageUnit,
      inPercentageDecimals : inPercentageDecimals,
      isReserved : true,
      isDistributed : false
      });
  }
}