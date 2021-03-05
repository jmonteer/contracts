const { expect, assert } = require("chai");
const BN = ethers.BigNumber
const OptionType = {Invalid: 0, Put: 1, Call: 2};
const MAX_INTEGER = BN.from('2').pow(BN.from('256')).sub(BN.from('1'))

module.exports.test = () => {
  const WETH_TOKEN_ADDRESS = ""; 
  const WBTC_TOKEN_ADDRESS = ""; 
  const USDC_TOKEN_ADDRESS = ""; 
  
  describe("HegicOptions", () => {  
    behavesLikeHegicOptions({
      name: "WETH CALLs",
      underlyingToken: WETH_TOKEN_ADDRESS,
      callToken: WETH_TOKEN_ADDRESS,
      putToken: USDC_TOKEN_ADDRESS,
      type: OptionType.Call,
      testPoints: [1, 1400, 1700, 2000, 5000, 10000]
    });

    behavesLikeHegicOptions({
      name: "WETH PUTs",
      underlyingToken: WETH_TOKEN_ADDRESS,
      callToken: WETH_TOKEN_ADDRESS,
      putToken: USDC_TOKEN_ADDRESS,
      type: OptionType.Put,
      testPoints: [1, 1400, 1700, 2000, 5000, 10000]
    });

    behavesLikeHegicOptions({
      name: "WBTC CALLs",
      underlyingToken: WBTC_TOKEN_ADDRESS,
      callToken: WBTC_TOKEN_ADDRESS,
      putToken: USDC_TOKEN_ADDRESS,
      type: OptionType.Call,
      testPoints: [1, 40000, 45000, 50000, 55000, 100000]
    });

    behavesLikeHegicOptions({
      name: "WBTC PUTs",
      underlyingToken: WBTC_TOKEN_ADDRESS,
      callToken: WBTC_TOKEN_ADDRESS,
      putToken: USDC_TOKEN_ADDRESS,
      type: OptionType.Put,
      testPoints: [1, 40000, 45000, 50000, 55000, 100000]
    });
  });

  function behavesLikeHegicOptions(params) {

    describe(`${params.name}`, function() {
      let initSnapshotId;
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
    
          if(params.underlyingToken == WBTC_TOKEN_ADDRESS) {
            hegicOptions = hegicOptionsWBTC;
            hegicPoolCalls = hegicPoolWBTC;
            hegicPoolPuts = hegicPoolUSDC;
            underlyingToken = WBTC;
          } else if (params.underlyingToken == WETH_TOKEN_ADDRESS) {
            hegicOptions = hegicOptionsWETH;
            hegicPoolCalls = hegicPoolWBTC;
            hegicPoolPuts = hegicPoolUSDC;
            underlyingToken = WETH;
          }
          stableToken = USDC;
          optionType = params.optionType;
          
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

    it("should be owned by deployer");

    it("should be the owner of the pool contract");

    it("should provide funds to the pool");

    it("should create an option");

    it("should exercise an option");

    it("shouldn't exercise other options");

    it("shouldn't unlock an active option");

    it("shouldn't exercise an expired option");

    it("shouldn't unlock an exercised option");

    it("should unlock expired options");

    it("shouldn't create an option if pool is maxed out");

    it("shouldn't change users' share when an option is created");

    it("should unfreeze LP's profit correctly after an option is unlocked");

    it("shouldn't pay profit when option is OTM");

    for(const testPoint of params.testPoints)
      describe(`should behave correctly for $${testPoint} strike`, () => {
        it("should behave correctly when exercised -100% strike");
        it("should behave correctly when exercised -10% strike");
        it("should behave correctly when exercised +0% strike");
        it("should behave correctly when exercised +10% strike");
        it("should behave correctly when exercised +150% strike");
      });
    });
  }
}