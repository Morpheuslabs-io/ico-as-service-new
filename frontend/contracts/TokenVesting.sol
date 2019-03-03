pragma solidity ^0.4.19;

import "./CrowdsaleTokenExt.sol";

/**
* @title VestingVault Contract that will hold vested tokens
* @notice Tokens for vested contributors will be hold in this contract and administrator will release after business days
*/
contract TokenVesting is Ownable, SafeMath {

  struct Grant {
    uint value;       // vested amount
    uint level;
    uint transferred; // transferred amount
  }

  CrowdsaleTokenExt public token;

  mapping (address => Grant) public grants;

  uint public start;
  uint public end;
  uint public slide;
  uint public totalVestedTokens;
  bool public locked;

  // array of vested users addresses
  address[] public vestedAddresses;

  event StartVesting(uint256 _time);
  event NewGrant(address _holder, uint _amount);
  event NewRelease(address _holder, uint _amount);
  event WithdrawAll(uint _amount);
  event LockedVault(address _address);

  modifier isOpen() {
    require(locked == false, "Vault is already locked");
    _;
  }

  constructor (CrowdsaleTokenExt _token) public {
    require(address(_token) != 0, "Token address should not be zero");

    token = _token;
    locked = false;
  }

  /**
   * @dev Function to set vesting start time
   * @param _start epoch time that vesting starts from
   @ @param _slide seconds amound of vesting slide
   */
  function startVesting(uint256 _start, uint256 _slide) public onlyOwner isOpen {
    require(_start > now, "Start time should be valid");
    start = _start;
    slide = _slide;
    end = _start + 2 * slide;

    emit StartVesting(_start);
  }

  /**
   * @dev Add vested contributor information
   * @param _to Withdraw address that tokens will be sent
   * @param _value Amount to hold for vesting period
   * @param _level Indicator that will represent vesting level for 0.03 and 0.05 eur tier; has 1 or 2
   */
  function grant(address _to, uint _value, uint _level) external onlyOwner isOpen {
    require(_to != address(0), "Address should not be zero");
    require(_value > 0, "Vested amount should be greater than zero");
    require(_level != 0, "Invalid vesting level");

    // make sure a single address can be granted tokens only once.
    require(grants[_to].value == 0, "Already added to vesting vault");

    grants[_to] = Grant({
      value: _value,
      level: _level,
      transferred: 0
      });

    vestedAddresses.push(_to);

    emit NewGrant(_to, _value);
    totalVestedTokens = safeAdd(totalVestedTokens, _value);
  }

  /**
   * @dev Get token amount for a token holder available to transfer at specific time
   * @param _holder Address that represents holders withdraw address
   * @param _time Time at the moment
   * @return Int value that represents token amount that is available to release at the moment
   */
  function transferableTokens(address _holder, uint256 _time) public view returns (uint256) {
    Grant storage grantInfo = grants[_holder];

    if (grantInfo.value == 0) {
      return 0;
    }

    return calculateTransferableTokens(grantInfo, _time);
  }

  /**
   * @dev Internal function to calculate available amount at specific time
   */
  function calculateTransferableTokens(Grant _grant, uint256 _time) private view returns (uint256) {
    // before cliff date (first vesting slide)
    if (start + slide > _time) {
      return 0;
    }

    // after vesting period ends
    if (end < _time) {
      return _grant.value;
    }

    if ((start + slide <= _time) && (_time < start + 2 * slide)) {
      if (_grant.level == 1) {
        // 20% of tokens will be available after 1 slide for contributors purchased at price 0.03 eur
        return safeDiv(safeMul(_grant.value, 20), 100);
      } else if (_grant.level == 2) {
        // 33% of tokens will be available after 1 slide for contributors purchased at price 0.05 eur
        return safeDiv(safeMul(_grant.value, 33), 100);
      }
    }
  }

  /**
   * @dev Claim vested token
   * @notice this will be eligible after first 90 days and after next 180 days
   */
  function claim() public {
    Grant storage grantInfo = grants[msg.sender];
    require(grantInfo.value > 0, "Grant does not exist");

    uint256 vested = calculateTransferableTokens(grantInfo, now);
    require(vested > 0, "There is no vested tokens");

    uint256 transferable = safeSub(vested, grantInfo.transferred);
    require(transferable > 0, "There is no remaining balance for this address");

    grantInfo.transferred = safeAdd(grantInfo.transferred, transferable);
    totalVestedTokens = safeSub(totalVestedTokens, transferable);

    token.transfer(msg.sender, transferable);

    emit NewRelease(msg.sender, transferable);
  }

  /**
   * @dev Function to release tokens for team
   */
  function withdraw(address teamWallet) public {
    uint amount = token.balanceOf(address(this));
    token.transfer(teamWallet, amount);

    emit WithdrawAll(amount);
  }

  /**
   * @dev Function to lock vault not to be able to alloc more
   */
  function lockVault() public {
    locked = true;
  }
}