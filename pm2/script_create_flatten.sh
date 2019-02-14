rm -rf ../contracts-flatten/*.*

./flat -input ../contracts/CrowdsaleTokenExt.sol -output ../contracts-flatten/CrowdsaleTokenExtFlatten.sol

./flat -input ../contracts/FlatPricingExt.sol -output ../contracts-flatten/FlatPricingExtFlatten.sol

./flat -input ../contracts/MintedTokenCappedCrowdsaleExt.sol -output ../contracts-flatten/MintedTokenCappedCrowdsaleExtFlatten.sol

./flat -input ../contracts/ReservedTokensFinalizeAgent.sol -output ../contracts-flatten/ReservedTokensFinalizeAgentFlatten.sol

./flat -input ../contracts/TokenVesting.sol -output ../contracts-flatten/TokenVestingFlatten.sol
