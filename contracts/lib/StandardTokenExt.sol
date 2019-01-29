/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;
import "./Recoverable.sol";
import "./StandardToken.sol";

/**
 * Standard EIP-20 token with an interface marker.
 * @notice Interface marker is used by crowdsale contracts to validate that addresses point a good token contract.
 */
contract StandardTokenExt is StandardToken, Recoverable {

  /* Interface declaration */
  function isToken() public view returns (bool weAre) {
    return true;
  }
}