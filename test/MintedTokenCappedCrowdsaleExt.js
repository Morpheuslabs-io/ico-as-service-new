const Crowdsale = artifacts.require('./MintedTokenCappedCrowdsaleExt.sol')
const CrowdsaleToken = artifacts.require('./CrowdsaleTokenExt.sol')
const FlatPricing = artifacts.require('./FlatPricingExt.sol')

contract('Crowdsale', function ([owner, donor]) {
    let CrowdsaleInst
    let CrowdsaleParam = {}
    let FlatPricingInst
    let CrowdsaleTokenInst

    beforeEach('setup contract for each test', async function () {
      FlatPricingInst = await FlatPricing.new()
      CrowdsaleTokenInst = await CrowdsaleToken.new()
      CrowdsaleInst = await Crowdsale.new()

      CrowdsaleParam = {
        name: 'TrungSale', 
        token: CrowdsaleTokenInst.address,
        pricingStrategy: FlatPricingInst.address, 
        multisigWallet: '0x175FeA8857f7581B971C5a41F27Ea4BB43356298'.toLowerCase(), 
        start: new Date('2019-02-14').getTime(), 
        end: new Date('2019-02-15').getTime(), 
        minimumFundingGoal: 1, 
        isWhiteListed: true, 
        maximumSellableTokens: 1000
      }
    })

    doSetParam = async function() {
      await CrowdsaleInst.setParam(CrowdsaleParam.name, CrowdsaleParam.token, CrowdsaleParam.pricingStrategy, CrowdsaleParam.multisigWallet, CrowdsaleParam.start, CrowdsaleParam.end, CrowdsaleParam.minimumFundingGoal, CrowdsaleParam.isWhiteListed, CrowdsaleParam.maximumSellableTokens); 
    }

    it('has an owner', async function () {
      assert.equal(await CrowdsaleInst.owner(), owner)
    })

    it('setParam first time', async function () {

      assert.equal(await CrowdsaleInst.isParamSet(), false)
      
      await CrowdsaleInst.setParam(CrowdsaleParam.name, CrowdsaleParam.token, CrowdsaleParam.pricingStrategy, CrowdsaleParam.multisigWallet, CrowdsaleParam.start, CrowdsaleParam.end, CrowdsaleParam.minimumFundingGoal, CrowdsaleParam.isWhiteListed, CrowdsaleParam.maximumSellableTokens); 
      
      assert.equal(await CrowdsaleInst.isParamSet(), true)

      assert.equal(await CrowdsaleInst.name(), CrowdsaleParam.name)
      assert.equal(await CrowdsaleInst.token(), CrowdsaleParam.token)
      assert.equal(await CrowdsaleInst.pricingStrategy(), CrowdsaleParam.pricingStrategy)
      assert.equal(await CrowdsaleInst.multisigWallet(), CrowdsaleParam.multisigWallet)
      assert.equal(await CrowdsaleInst.startsAt(), CrowdsaleParam.start)
      assert.equal(await CrowdsaleInst.endsAt(), CrowdsaleParam.end)
      assert.equal(await CrowdsaleInst.minimumFundingGoal(), CrowdsaleParam.minimumFundingGoal)
      assert.equal(await CrowdsaleInst.isWhiteListed(), CrowdsaleParam.isWhiteListed)
      assert.equal(await CrowdsaleInst.maximumSellableTokens(), CrowdsaleParam.maximumSellableTokens)
    })

    it('setParam second time', async function () {
      
      assert.equal(await CrowdsaleInst.isParamSet(), false)

      await CrowdsaleInst.setParam(CrowdsaleParam.name, CrowdsaleParam.token, CrowdsaleParam.pricingStrategy, CrowdsaleParam.multisigWallet, CrowdsaleParam.start, CrowdsaleParam.end, CrowdsaleParam.minimumFundingGoal, CrowdsaleParam.isWhiteListed, CrowdsaleParam.maximumSellableTokens); 
      
      assert.equal(await CrowdsaleInst.isParamSet(), true)

      try {
        await CrowdsaleInst.setParam(CrowdsaleParam.name, CrowdsaleParam.token, CrowdsaleParam.pricingStrategy, CrowdsaleParam.multisigWallet, CrowdsaleParam.start, CrowdsaleParam.end, CrowdsaleParam.minimumFundingGoal, CrowdsaleParam.isWhiteListed, CrowdsaleParam.maximumSellableTokens); 
        
        assert.fail("The transaction should have thrown an error");
      }
      catch (err) {
          assert.include(err.message, "revert", "The error message should contain 'revert'");
      }
    })
})