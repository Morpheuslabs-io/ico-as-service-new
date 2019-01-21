exports.testData = {
  step2: {
    decimals: 18,
    name: "Trung",
    ticker: "TTT",
    reserved_token: [
      {address: "0x175FeA8857f7581B971C5a41F27Ea4BB43356298", dimension: "tokens", tokenAmount: 10},
      {address: "0xFb2e63ABeBCB0A75c03A6BE27b89fC5E38751986", dimension: "tokens", tokenAmount: 20}
    ]
  },
  step3: {
    enableWhitelisting: "yes",
    gasPrice: "3.01",
    mincap: "1",
    wallet_address: "0xFb2e63ABeBCB0A75c03A6BE27b89fC5E38751986",
    tiers: [
      {
        allowModifying: "no",
        endDate: "2019-01-22",
        endTime: "16:10:29",
        lockDate: "2019-01-22",
        rate: "10",
        sequence: 1,
        startDate: "2019-01-22",
        startTime: "16:10:29",
        supply: "1000",
        tierName: "Tier 1",
        unlockDate: "2019-01-22",
        whitelist: [
          {w_address: "0x00154b7eb2905b1062Bf2D184397df2688a73ff5", w_min: 20, w_max: 200},
          {w_address: "0x00157EB37921534907dCE1E57b709cEE1A75f0Bc", w_min: 5, w_max: 50}
        ]
      }
    ]    
  }
}