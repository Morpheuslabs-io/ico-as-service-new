/**
 * Issued by Morpheus Labs ICO as a Service Wizard
 */
pragma solidity ^0.4.24;
import "./ERC20.sol";

/**
 * A token that defines fractional units as decimals.
 */
contract FractionalERC20Ext is ERC20 {

  uint public decimals;
  uint public minCap;

}