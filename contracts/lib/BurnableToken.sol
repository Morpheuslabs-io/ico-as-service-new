/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;
import "./StandardTokenExt.sol";

contract BurnableToken is StandardTokenExt {

    // @notice An address for the transfer event where the burned tokens are transferred in a faux Transfer event
    address public constant BURN_ADDRESS = 0;

    /** How many tokens we burned */
    event Burned(address burner, uint burnedAmount);

    /**
     * Burn extra tokens from a balance.
     *
     */
    function burn(uint burnAmount) public {
        address burner = msg.sender;
        balances[burner] = safeSub(balances[burner], burnAmount);
        totalSupply = safeSub(totalSupply, burnAmount);
        Burned(burner, burnAmount);

        // Inform the blockchain explores that track the
        // balances only by a transfer event that the balance in this
        // address has decreased
        Transfer(burner, BURN_ADDRESS, burnAmount);
    }
}
