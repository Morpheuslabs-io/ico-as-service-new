/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;

import "./CrowdsaleExt.sol";

/**
 * ICO crowdsale contract that is capped by amout of tokens.
 *
 * - Tokens are dynamically created during the crowdsale
 *
 *
 */
contract MintedTokenCappedCrowdsaleExt is CrowdsaleExt {

    /* Maximum amount of tokens this crowdsale can sell. */
    uint public maximumSellableTokens;

    constructor() payable {

    }

    function setParam(string _name, address _token, PricingStrategy _pricingStrategy, address _multisigWallet, uint _start, uint _end, uint _minimumFundingGoal, bool _isWhiteListed, uint _maximumSellableTokens) public onlyOwner paramNotSet {

        setParamInternal(_name, _token, _pricingStrategy, _multisigWallet, _start, _end, _minimumFundingGoal, _isWhiteListed);

        maximumSellableTokens = _maximumSellableTokens;
    }

    // Crowdsale maximumSellableTokens has been changed
    event MaximumSellableTokensChanged(uint newMaximumSellableTokens);

    /**
     * Called from invest() to confirm if the curret investment does not break our cap rule.
     */
    function isBreakingCap(uint tokensSoldTotal) public constant returns (bool limitBroken) {
        return tokensSoldTotal > maximumSellableTokens;
    }

    function isBreakingInvestorCap(address addr, uint tokenAmount) public constant returns (bool limitBroken) {
        assert(isWhiteListed);
        uint maxCap = earlyParticipantWhitelist[addr].maxCap;
        return (safeAdd(tokenAmountOf[addr], tokenAmount)) > maxCap;
    }

    function isCrowdsaleFull() public constant returns (bool) {
        return tokensSold >= maximumSellableTokens;
    }

    function setMaximumSellableTokens(uint tokens) public onlyOwner {
        assert(!finalized);
        assert(now <= startsAt);

        CrowdsaleExt lastTierCntrct = CrowdsaleExt(getLastTier());
        assert(!lastTierCntrct.finalized());

        maximumSellableTokens = tokens;
        MaximumSellableTokensChanged(maximumSellableTokens);
    }

    function updateRate(uint newOneTokenInWei) public onlyOwner {
        assert(!finalized);
        assert(now <= startsAt);

        CrowdsaleExt lastTierCntrct = CrowdsaleExt(getLastTier());
        assert(!lastTierCntrct.finalized());

        pricingStrategy.updateRate(newOneTokenInWei);
    }

    /**
     * Dynamically create tokens and assign them to the investor.
     */
    function assignTokens(address receiver, uint tokenAmount) private {
        MintableTokenExt mintableToken = MintableTokenExt(token);
        mintableToken.mint(receiver, tokenAmount);
    }

    function finalizeCrowdsale() public {

    }
}
