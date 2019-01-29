/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;
import "./lib/SafeMath.sol";
import "./lib/Ownable.sol";
import "./lib/PricingStrategy.sol";

/**
 * Fixed crowdsale pricing - everybody gets the same price.
 */
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
