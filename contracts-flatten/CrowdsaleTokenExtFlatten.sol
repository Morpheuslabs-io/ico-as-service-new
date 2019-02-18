/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;

contract Ownable {
  address public owner;

  bool public isParamSet = false;

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier paramNotSet() {
    require(isParamSet == false);
    _;
  }

  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @return the address of the owner.
   */
  function owner() public view returns (address) {
    return owner;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(isOwner(), "Not owner");
    _;
  }

  /**
   * @return true if `msg.sender` is the owner of the contract.
   */
  function isOwner() public view returns (bool) {
    return msg.sender == owner;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    _transferOwnership(newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address newOwner) internal {
    require(newOwner != address(0), "New owner address is 0");
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }
}
contract SafeMath {
  function safeMul(uint a, uint b) internal returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function safeDiv(uint a, uint b) internal returns (uint) {
    assert(b > 0);
    uint c = a / b;
    assert(a == b * c + a % b);
    return c;
  }

  function safeSub(uint a, uint b) internal returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function safeAdd(uint a, uint b) internal returns (uint) {
    uint c = a + b;
    assert(c >= a && c >= b);
    return c;
  }

  function max64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a >= b ? a : b;
  }

  function min64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a < b ? a : b;
  }

  function max256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a >= b ? a : b;
  }

  function min256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a < b ? a : b;
  }

}
contract ERC20Basic {
  uint256 public totalSupply;

  function balanceOf(address who) public view returns (uint256);

  function transfer(address to, uint256 value) public returns (bool);

  event Transfer(address indexed from, address indexed to, uint256 value);
}
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) public view returns (uint256);

  function transferFrom(address from, address to, uint256 value) public returns (bool);

  function approve(address spender, uint256 value) public returns (bool);

  event Approval(address indexed owner, address indexed spender, uint256 value);
}
contract Recoverable is Ownable {

  /// @dev This will be invoked by the owner, when owner wants to rescue tokens
  /// @param token Token which will we rescue to the owner from the contract
  function recoverTokens(ERC20Basic token) onlyOwner public {
    token.transfer(owner, tokensToBeReturned(token));
  }

  /// @dev Interface function, can be overwritten by the superclass
  /// @param token Token which balance we will check and return
  /// @return The amount of tokens (in smallest denominator) the contract owns
  function tokensToBeReturned(ERC20Basic token) public returns (uint) {
    return token.balanceOf(this);
  }
}
contract StandardToken is ERC20, SafeMath {

  /* Token supply got increased and a new owner received these tokens */
  event Minted(address receiver, uint amount);

  /* Actual balances of token holders */
  mapping(address => uint) balances;

  /* approve() allowances */
  mapping(address => mapping(address => uint)) allowed;

  /* Interface declaration */
  function isToken() public constant returns (bool weAre) {
    return true;
  }

  function transfer(address _to, uint _value) public returns (bool success) {
    balances[msg.sender] = safeSub(balances[msg.sender], _value);
    balances[_to] = safeAdd(balances[_to], _value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
    uint _allowance = allowed[_from][msg.sender];

    balances[_to] = safeAdd(balances[_to], _value);
    balances[_from] = safeSub(balances[_from], _value);
    allowed[_from][msg.sender] = safeSub(_allowance, _value);
    Transfer(_from, _to, _value);
    return true;
  }

  function balanceOf(address _owner) public constant returns (uint balance) {
    return balances[_owner];
  }

  function approve(address _spender, uint _value) public returns (bool success) {
    if ((_value != 0) && (allowed[msg.sender][_spender] != 0)) revert();

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender) public constant returns (uint remaining) {
    return allowed[_owner][_spender];
  }

}
contract StandardTokenExt is StandardToken, Recoverable {

  /* Interface declaration */
  function isToken() public view returns (bool weAre) {
    return true;
  }
}
contract ReleasableToken is StandardTokenExt {

  /* The finalizer contract that allows unlift the transfer limits on this token */
  address public releaseAgent;

  /** A crowdsale contract can release us to the wild if ICO success. If false we are are in transfer lock up period.*/
  bool public released = false;

  /** Map of agents that are allowed to transfer tokens regardless of the lock down period. These are crowdsale contracts and possible the team multisig itself. */
  mapping(address => bool) public transferAgents;

  /**
   * Limit token transfer until the crowdsale is over.
   */
  modifier canTransfer(address _sender) {
    if (!released) {
      require(transferAgents[_sender]);
    }
    _;
  }

  /** The function can be called only before or after the tokens have been releasesd */
  modifier inReleaseState(bool releaseState) {
    require(releaseState == released);
    _;
  }

  /** The function can be called only by a whitelisted release agent. */
  modifier onlyReleaseAgent() {
    require(msg.sender == releaseAgent);
    _;
  }

  /**
   * Set the contract that can call release and make the token transferable.
   * Design choice. Allow reset the release agent to fix fat finger mistakes.
   */
  function setReleaseAgent(address addr) onlyOwner inReleaseState(false) public {
    // We don't do interface check here as we might want to a normal wallet address to act as a release agent
    releaseAgent = addr;
  }

  /**
   * Owner can allow a particular address (a crowdsale contract) to transfer tokens despite the lock up period.
   */
  function setTransferAgent(address addr, bool state) onlyOwner inReleaseState(false) public {
    transferAgents[addr] = state;
  }

  /**
   * One way function to release the tokens to the wild.
   * Can be called only from the release agent that is the final ICO contract. It is only called if the crowdsale has been success (first milestone reached).
   */
  function releaseTokenTransfer() public onlyReleaseAgent {
    released = true;
  }

  function transfer(address _to, uint _value) public canTransfer(msg.sender) returns (bool success) {
    // Call StandardToken.transfer()
    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint _value) public canTransfer(_from) returns (bool success) {
    // Call StandardToken.transferForm()
    return super.transferFrom(_from, _to, _value);
  }
}

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
contract CrowdsaleTokenExt is ReleasableToken, MintableTokenExt {

    event ClaimedTokens(address indexed _token, address indexed _controller, uint _amount);

    string public name;

    string public symbol;

    uint public decimals;

    /* Minimum ammount of tokens every buyer can buy. */
    uint public minCap;

    constructor() {

    }

    /**
     * Construct the token.
     * This token must be created through a team multisig wallet, so that it is owned by that wallet.
     * @param _name Token name
     * @param _symbol Token symbol - should be all caps
     * @param _initialSupply How many tokens we start with
     * @param _decimals Number of decimal places
     * @param _mintable Are new tokens created over the crowdsale or do we distribute only the initial supply? Note that when the token becomes transferable the minting always ends.
     */
    function setParam(string _name, string _symbol, uint _initialSupply, uint _decimals, bool _mintable, uint _globalMinCap) public onlyOwner paramNotSet {

        // No more new supply allowed after the token creation
        if (!_mintable) {
            mintingFinished = true;
            if (_initialSupply == 0) {
                revert();
                // Cannot create a token without supply and no minting
            }
        }

        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply;
        decimals = _decimals;
        minCap = _globalMinCap;

        isParamSet = true;

        if (totalSupply > 0) {
            
            // Create initially all balance on the team multisig
            balances[owner] = totalSupply;

            Transfer(0, owner, totalSupply);
            Minted(owner, totalSupply);
        }
    }

    /**
     * When token is released to be transferable, enforce no new tokens can be created.
     */
    function releaseTokenTransfer() public onlyReleaseAgent {
        mintingFinished = true;
        super.releaseTokenTransfer();
    }

    /**
     * Claim tokens that were accidentally sent to this contract.
     * @param _token The address of the token contract that you want to recover.
     */
    function claimTokens(address _token) public onlyOwner {
        require(_token != address(0));

        ERC20 token = ERC20(_token);
        uint balance = token.balanceOf(this);
        token.transfer(owner, balance);

        ClaimedTokens(_token, owner, balance);
    }
}

