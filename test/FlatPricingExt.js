const FlatPricing = artifacts.require('./FlatPricingExt.sol')

contract('FlatPricing', function ([owner, donor]) {
    let FlatPricingInst
    let FlatPricingParam = {}

    beforeEach('setup contract for each test', async function () {
      FlatPricingInst = await FlatPricing.new()

      FlatPricingParam = {
        rate: 1000,
        tokenAddr: '0x01f237a674c5b3c073052daa4dd8c71dbc5ec36a'
      }
    })

    it('has an owner', async function () {
      assert.equal(await FlatPricingInst.owner(), owner)
    })

    it('setParam first time', async function () {

      assert.equal(await FlatPricingInst.isParamSet(), false)

      await FlatPricingInst.setParam(FlatPricingParam.rate);
      await FlatPricingInst.setTier(FlatPricingParam.tokenAddr);
      
      assert.equal(await FlatPricingInst.isParamSet(), true)

      assert.equal(await FlatPricingInst.oneTokenInWei(), FlatPricingParam.rate)
      assert.equal(await FlatPricingInst.tier(), FlatPricingParam.tokenAddr)
    })

    it('setParam second time', async function () {
      
      assert.equal(await FlatPricingInst.isParamSet(), false)

      await FlatPricingInst.setParam(FlatPricingParam.rate);
      await FlatPricingInst.setTier(FlatPricingParam.tokenAddr);

      assert.equal(await FlatPricingInst.isParamSet(), true)

      try {
        await FlatPricingInst.setParam(FlatPricingParam.rate);
        
        assert.fail("The transaction should have thrown an error");
      }
      catch (err) {
          assert.include(err.message, "revert", "The error message should contain 'revert'");
      }
    })
})