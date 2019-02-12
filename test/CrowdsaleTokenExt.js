const CrowdsaleToken = artifacts.require('./CrowdsaleTokenExt.sol')

contract('CrowdsaleToken', function ([owner, donor]) {
    let CrowdsaleTokenInst

    beforeEach('setup contract for each test', async function () {
      CrowdsaleTokenInst = await CrowdsaleToken.new()
    })

    it('has an owner', async function () {
      assert.equal(await CrowdsaleTokenInst.owner(), owner)
    })

    it('setParam first time', async function () {
      
      let name='Trung', symbol = 'TTT', initialSupply = 1000, decimals = 18, mintable=true, globalMinCap = 10000;

      assert.equal(await CrowdsaleTokenInst.isParamSet(), false)

      await CrowdsaleTokenInst.setParam(name, symbol, initialSupply, decimals, mintable, globalMinCap);
      
      assert.equal(await CrowdsaleTokenInst.isParamSet(), true)

      assert.equal(await CrowdsaleTokenInst.name(), name)
      assert.equal(await CrowdsaleTokenInst.symbol(), symbol)
      assert.equal(await CrowdsaleTokenInst.totalSupply(), initialSupply)
      assert.equal(await CrowdsaleTokenInst.decimals(), decimals)
      assert.equal(await CrowdsaleTokenInst.minCap(), globalMinCap)
      
    })

    it('setParam second time', async function () {
      
      let name='Trung', symbol = 'TTT', initialSupply = 1000, decimals = 18, mintable=true, globalMinCap = 10000;

      assert.equal(await CrowdsaleTokenInst.isParamSet(), false)

      await CrowdsaleTokenInst.setParam(name, symbol, initialSupply, decimals, mintable, globalMinCap);

      try {
        await CrowdsaleTokenInst.setParam(name, symbol, initialSupply, decimals, mintable, globalMinCap);
        
        assert.fail("The transaction should have thrown an error");
      }
      catch (err) {
          assert.include(err.message, "revert", "The error message should contain 'revert'");
      }
    })

    it('setParam failed if not mintable and no initial supply', async function () {
      
      let name='Trung', symbol = 'TTT', initialSupply = 0, decimals = 18, mintable=false, globalMinCap = 10000;

      assert.equal(await CrowdsaleTokenInst.isParamSet(), false)

      try {
        await CrowdsaleTokenInst.setParam(name, symbol, initialSupply, decimals, mintable, globalMinCap);
        
        assert.fail("The transaction should have thrown an error");
      }
      catch (err) {
          assert.include(err.message, "revert", "The error message should contain 'revert'");
      }
    })

})