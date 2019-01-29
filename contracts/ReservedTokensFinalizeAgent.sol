/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;

import "./lib/FinalizeAgent.sol";
import "./lib/SafeMath.sol";
import "./CrowdsaleTokenExt.sol";
import "./MintedTokenCappedCrowdsaleExt.sol";
import "./lib/Ownable.sol";


/**
 * The default behavior for the crowdsale end.
 * Unlock tokens.
 */
contract ReservedTokensFinalizeAgent is FinalizeAgent, Ownable, SafeMath {
    CrowdsaleTokenExt public token;
    CrowdsaleExt public crowdsale;

    uint public distributedReservedTokensDestinationsLen = 0;

    constructor() public {
        
    }

    function setParam(CrowdsaleTokenExt _token, CrowdsaleExt _crowdsale) public onlyOwner paramNotSet {

        require(_token != address(0));
        require(_crowdsale != address(0));

        token = _token;
        crowdsale = _crowdsale;

        isParamSet = true;
    }

    /** Check that we can release the token */
    function isSane() public constant returns (bool) {
        return (token.releaseAgent() == address(this));
    }

    //distributes reserved tokens. Should be called before finalization
    function distributeReservedTokens(uint reservedTokensDistributionBatch) public {
        assert(msg.sender == address(crowdsale));

        assert(reservedTokensDistributionBatch > 0);
        assert(!reservedTokensAreDistributed);
        assert(distributedReservedTokensDestinationsLen < token.reservedTokensDestinationsLen());


        // How many % of tokens the founders and others get
        uint tokensSold = 0;
        for (uint8 i = 0; i < crowdsale.joinedCrowdsalesLen(); i++) {
            CrowdsaleExt tier = CrowdsaleExt(crowdsale.joinedCrowdsales(i));
            tokensSold = safeAdd(tokensSold, tier.tokensSold());
        }

        uint startLooping = distributedReservedTokensDestinationsLen;
        uint batch = safeSub(token.reservedTokensDestinationsLen(), distributedReservedTokensDestinationsLen);
        if (batch >= reservedTokensDistributionBatch) {
            batch = reservedTokensDistributionBatch;
        }
        uint endLooping = startLooping + batch;

        // move reserved tokens
        for (uint j = startLooping; j < endLooping; j++) {
            address reservedAddr = token.reservedTokensDestinations(j);
            if (!token.areTokensDistributedForAddress(reservedAddr)) {
                uint allocatedBonusInPercentage;
                uint allocatedBonusInTokens = token.getReservedTokens(reservedAddr);
                uint percentsOfTokensUnit = token.getReservedPercentageUnit(reservedAddr);
                uint percentsOfTokensDecimals = token.getReservedPercentageDecimals(reservedAddr);

                if (percentsOfTokensUnit > 0) {
                    allocatedBonusInPercentage = tokensSold * percentsOfTokensUnit / 10 ** percentsOfTokensDecimals / 100;
                    token.mint(reservedAddr, allocatedBonusInPercentage);
                }

                if (allocatedBonusInTokens > 0) {
                    token.mint(reservedAddr, allocatedBonusInTokens);
                }

                token.finalizeReservedAddress(reservedAddr);
                distributedReservedTokensDestinationsLen++;
            }
        }

        if (distributedReservedTokensDestinationsLen == token.reservedTokensDestinationsLen()) {
            reservedTokensAreDistributed = true;
        }
    }

    /** Called once by crowdsale finalize() if the sale was success. */
    function finalizeCrowdsale() public {
        assert(msg.sender == address(crowdsale));

        if (token.reservedTokensDestinationsLen() > 0) {
            assert(reservedTokensAreDistributed);
        }

        token.releaseTokenTransfer();
    }

}