const FinalizedAgent = artifacts.require('./ReservedTokensFinalizeAgent.sol')

contract('FinalizedAgent', function ([owner, donor]) {
    let FinalizedAgentInst
    let FinalizedAgentParam = {}

    beforeEach('setup contract for each test', async function () {
      FinalizedAgentInst = await FinalizedAgent.new()

      FinalizedAgentParam = {
        tokenAddr: '0x01f237a674c5b3c073052daa4dd8c71dbc5ec36a',
        crowdsaleAddr: '0x01f237a674c5b3c073052daa4dd8c71dbc5ec36a'
      }
    })

    it('has an owner', async function () {
      assert.equal(await FinalizedAgentInst.owner(), owner)
    })

    it('setParam first time', async function () {

      assert.equal(await FinalizedAgentInst.isParamSet(), false)

      await FinalizedAgentInst.setParam(FinalizedAgentParam.tokenAddr, FinalizedAgentParam.crowdsaleAddr);
      
      assert.equal(await FinalizedAgentInst.isParamSet(), true)

      assert.equal(await FinalizedAgentInst.token(), FinalizedAgentParam.tokenAddr)
      assert.equal(await FinalizedAgentInst.crowdsale(), FinalizedAgentParam.crowdsaleAddr)
    })

    it('setParam second time', async function () {
      
      assert.equal(await FinalizedAgentInst.isParamSet(), false)

      await FinalizedAgentInst.setParam(FinalizedAgentParam.tokenAddr, FinalizedAgentParam.crowdsaleAddr);
      
      assert.equal(await FinalizedAgentInst.isParamSet(), true)

      try {
        await FinalizedAgentInst.setParam(FinalizedAgentParam.tokenAddr, FinalizedAgentParam.crowdsaleAddr);
        
        assert.fail("The transaction should have thrown an error");
      }
      catch (err) {
          assert.include(err.message, "revert", "The error message should contain 'revert'");
      }
    })
})