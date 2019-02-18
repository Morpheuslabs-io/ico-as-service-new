/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;

contract PricingStrategy {

  address public tier;

  /** Interface declaration. */
  function isPricingStrategy() public constant returns (bool) {
    return true;
  }

  /** Self check if all references are correctly set.
   * Checks that pricing strategy matches crowdsale parameters.
   */
  function isSane(address crowdsale) public constant returns (bool) {
    return true;
  }

  /**
   * @dev Pricing tells if this is a presale purchase or not.
   * @param purchaser Address of the purchaser
   * @return False by default, true if a presale purchaser
   */
  function isPresalePurchase(address purchaser) public constant returns (bool) {
    return false;
  }

  /* How many weis one token costs */
  function updateRate(uint newOneTokenInWei) public {}

  /**
   * When somebody tries to buy tokens for X eth, calculate how many tokens they get.
   * @param value - What is the value of the transaction send in as wei
   * @param tokensSold - how much tokens have been sold this far
   * @param weiRaised - how much money has been raised this far in the main token sale - this number excludes presale
   * @param msgSender - who is the investor of this transaction
   * @param decimals - how many decimal units the token has
   * @return Amount of tokens the investor receives
   */
  function calculatePrice(uint value, uint weiRaised, uint tokensSold, address msgSender, uint decimals) public constant returns (uint tokenAmount) {}
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
contract FlatPricingExt is PricingStrategy, Ownable, SafeMath {

    /* How many weis one token costs */
    uint public oneTokenInWei;

    // Crowdsale rate has been changed
    event RateChanged(uint newOneTokenInWei);

    modifier onlyTier() {
        require (msg.sender == address(tier));
        _;
    }

    function setTier(address _tier) public onlyOwner {
        assert(_tier != address(0));
        assert(tier == address(0));
        tier = _tier;
    }

    constructor() public {
        
    }

    function setParam(uint _oneTokenInWei) public onlyOwner paramNotSet {
        require(_oneTokenInWei > 0);
        oneTokenInWei = _oneTokenInWei;

        isParamSet = true;
    }

    function updateRate(uint newOneTokenInWei) public onlyTier {
        oneTokenInWei = newOneTokenInWei;
        RateChanged(newOneTokenInWei);
    }

    /**
     * Calculate the current price for buy in amount.
     *
     */
    function calculatePrice(uint value, uint weiRaised, uint tokensSold, address msgSender, uint decimals) public constant returns (uint) {
        uint multiplier = 10 ** decimals;
        // return value.times(multiplier) / oneTokenInWei;
        return safeDiv(safeMul(value, multiplier), oneTokenInWei);
    }
}

