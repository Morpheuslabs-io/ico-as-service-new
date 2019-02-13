/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;

import "./lib/MintableTokenExt.sol";
import "./lib/ReleasableToken.sol";

/**
 * A crowdsaled token.
 * An ERC-20 token designed specifically for crowdsales with investor protection and further development path.
 * - The token transfer() is disabled until the crowdsale is over
 * - The token contract gives an opt-in upgrade path to a new contract
 * - The same token can be part of several crowdsales through approve() mechanism
 * - The token can be capped (supply set in the constructor) or uncapped (crowdsale contract can mint new tokens)
 *
 */
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
