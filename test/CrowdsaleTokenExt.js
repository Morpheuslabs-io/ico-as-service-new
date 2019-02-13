const CrowdsaleToken = artifacts.require('./CrowdsaleTokenExt.sol')

contract('CrowdsaleToken', function ([owner, donor]) {
    let CrowdsaleTokenInst
    let CrowdsaleTokenParam = {}

    beforeEach('setup contract for each test', async function () {
      CrowdsaleTokenInst = await CrowdsaleToken.new()

      CrowdsaleTokenParam = {
        name: 'Trung', 
        symbol: 'TTT', 
        initialSupply: 1000, 
        decimals: 18,
        mintable: true,
        globalMinCap: 10000
      }
    })

    it('has an owner', async function () {
      assert.equal(await CrowdsaleTokenInst.owner(), owner)
    })

    it('setParam first time', async function () {

      assert.equal(await CrowdsaleTokenInst.isParamSet(), false)

      await CrowdsaleTokenInst.setParam(CrowdsaleTokenParam.name, CrowdsaleTokenParam.symbol, CrowdsaleTokenParam.initialSupply, CrowdsaleTokenParam.decimals, CrowdsaleTokenParam.mintable, CrowdsaleTokenParam.globalMinCap);
      
      assert.equal(await CrowdsaleTokenInst.isParamSet(), true)

      assert.equal(await CrowdsaleTokenInst.name(), CrowdsaleTokenParam.name)
      assert.equal(await CrowdsaleTokenInst.symbol(), CrowdsaleTokenParam.symbol)
      assert.equal(await CrowdsaleTokenInst.totalSupply(), CrowdsaleTokenParam.initialSupply)
      assert.equal(await CrowdsaleTokenInst.decimals(), CrowdsaleTokenParam.decimals)
      assert.equal(await CrowdsaleTokenInst.minCap(), CrowdsaleTokenParam.globalMinCap,)
      
    })

    it('setParam second time', async function () {
      
      assert.equal(await CrowdsaleTokenInst.isParamSet(), false)

      await CrowdsaleTokenInst.setParam(CrowdsaleTokenParam.name, CrowdsaleTokenParam.symbol, CrowdsaleTokenParam.initialSupply, CrowdsaleTokenParam.decimals, CrowdsaleTokenParam.mintable, CrowdsaleTokenParam.globalMinCap);

      try {
        await CrowdsaleTokenInst.setParam(CrowdsaleTokenParam.name, CrowdsaleTokenParam.symbol, CrowdsaleTokenParam.initialSupply, CrowdsaleTokenParam.decimals, CrowdsaleTokenParam.mintable, CrowdsaleTokenParam.globalMinCap);
        
        assert.fail("The transaction should have thrown an error");
      }
      catch (err) {
          assert.include(err.message, "revert", "The error message should contain 'revert'");
      }
    })

    it('setParam failed if not mintable and no initial supply', async function () {
      
      assert.equal(await CrowdsaleTokenInst.isParamSet(), false)

      try {
        await CrowdsaleTokenInst.setParam(CrowdsaleTokenParam.name, CrowdsaleTokenParam.symbol, 0, CrowdsaleTokenParam.decimals, false, CrowdsaleTokenParam.globalMinCap);
        
        assert.fail("The transaction should have thrown an error");
      }
      catch (err) {
          assert.include(err.message, "revert", "The error message should contain 'revert'");
      }
    })

})