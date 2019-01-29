/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;

/**
 * Finalize agent defines what happens at the end of succeseful crowdsale.
 *
 * - Allocate tokens for founders, bounties and community
 * - Make tokens transferable
 * - etc.
 */
contract FinalizeAgent {

  bool public reservedTokensAreDistributed = false;

  function isFinalizeAgent() public constant returns (bool) {
    return true;
  }

  /** Return true if we can run finalizeCrowdsale() properly.
   *
   * This is a safety check function that doesn't allow crowdsale to begin
   * unless the finalizer has been set up properly.
   */
  function isSane() public constant returns (bool) {
    return true;
  }

  function distributeReservedTokens(uint reservedTokensDistributionBatch) public {

  }

  /** Called once by crowdsale finalize() if the sale was success. */
  function finalizeCrowdsale() public {

  }

}