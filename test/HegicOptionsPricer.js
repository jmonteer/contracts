const { expect, assert } = require("chai");
const BN = ethers.BigNumber
const OptionType = {Invalid: 0, Put: 1, Call: 2};
const MAX_INTEGER = BN.from('2').pow(BN.from('256')).sub(BN.from('1'))

module.exports.test = () => {
  const WETH_TOKEN_ADDRESS = ""; 
  const WBTC_TOKEN_ADDRESS = ""; 
  const USDC_TOKEN_ADDRESS = ""; 

  describe("HegicOptionsPricer", () => {  
    behavesLikeHegicOptionsPricer({
      name: "WETH - CALL",
      underlyingToken: WETH_TOKEN_ADDRESS,
      callToken: WETH_TOKEN_ADDRESS,
      putToken: USDC_TOKEN_ADDRESS,
      type: OptionType.Call,
      testPoints: [1, 1400, 1700, 2000, 5000, 10000],
      utilisationRates: [0, 40, 75]
    });

    behavesLikeHegicOptionsPricer({
      name: "WETH - PUT",
      underlyingToken: WETH_TOKEN_ADDRESS,
      callToken: WETH_TOKEN_ADDRESS,
      putToken: USDC_TOKEN_ADDRESS,
      type: OptionType.Put,
      testPoints: [1, 1400, 1700, 2000, 5000, 10000],
      utilisationRates: [0, 40, 75]
    });
  });

  function behavesLikeHegicOptionsPricer(params) {
    let initSnapshotId;
    describe(`${params.name}`, function() {
      before(async () => {
          // set up contracts
          const allContracts = await contracts();
          WBTC = allContracts.wbtcToken;
          USDC = allContracts.usdcToken;
          WETH = allContracts.wethToken;
          hegicPoolUSDC = allContracts.hegicPoolUSDC;
          hegicPoolWETH = allContracts.hegicPoolWETH;
          hegicPoolWBTC = allContracts.hegicPoolWBTC;
          hegicOptionsWBTC = allContracts.hegicOptionsWBTC;
          hegicOptionsWETH = allContracts.hegicOptionsWETH;
          hegicStakingUSDC = allContracts.hegicStakingUSDC;
          hegicStakingWETH = allContracts.hegicStakingWETH;
          hegicStakingWBTC = allContracts.hegicStakingWBTC;
          priceProviderWETH = allContracts.priceProviderWETH;
          priceProviderWBTC = allContracts.priceProviderWBTC;
          hegicOptionsPricerWETH = allContracts.hegicOptionsPricerWETH;
          hegicOptionsPricerWBTC = allContracts.hegicOptionsPricerWBTC;
    
          // set users
          const accountsList = await accounts()
          owner = accountsList[0];
          users = accountsList.slice(1, accountsList.length);
          user1 = users[0];
          user2 = users[1];
          user3 = users[2];
          user4 = users[3];

          initSnapshotId = await takeSnapshot();
    });

    after(async () => {
      await revertToSnapShot(initSnapshotId);
    })

    getExpectedOptionPrice = async (params) => {

    }

    it("should be owned by deployer", async () => {
      
    });

    it("should change impliedVolRate");

    for(const utilRate of params.utilisationRates)
    describe(`for utilisation rate over ${utilRate}%`, () => {
      for(const testPoint of params.testPoints)
      it(`should return correct pricing for $${testPoint} strike`);
    })

    it("show data table")
    });
  }
}