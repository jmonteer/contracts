const { expect, assert } = require("chai");
const BN = ethers.BigNumber
const OptionType = {Invalid: 0, Put: 1, Call: 2};
const MAX_INTEGER = BN.from('2').pow(BN.from('256')).sub(BN.from('1'))

module.exports.test = () => {
  const WETH_TOKEN_ADDRESS = ""; 
  const WBTC_TOKEN_ADDRESS = ""; 
  const USDC_TOKEN_ADDRESS = ""; 
  const HEGIC_TOKEN_ADDRESS = "";

  describe("HegicPool", () => {  
    behavesLikeHegicStaking({
      name: "USDCStakingLot",
      underlyingToken: USDC_TOKEN_ADDRESS,
    });

    behavesLikeHegicStaking({
      name: "WETHStakingLot",
      underlyingToken: WETH_TOKEN_ADDRESS
    });

    behavesLikeHegicStaking({
      name: "WBTCStakingLot",
      underlyingToken: WBTC_TOKEN_ADDRESS
    });
  });

  function behavesLikeHegicStaking(params) {
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
            hegicStaking = hegicStakingWBTC;
            underlyingToken = WBTC;
          } else if (params.underlyingToken == WETH_TOKEN_ADDRESS) {
            hegicStaking = hegicStakingWETH;
            underlyingToken = WETH;
          } else if (params.underlyingToken == USDC_TOKEN_ADDRESS) {
            hegicStaking = hegicStakingUSDC;
            underlyingToken = USDC;
          }

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
      
      it("should buy a lot");

      it("should give all the profit to user1");

      it("should save profit after transfer");

      it("should buy another lot and distribute profit");

      it("should zero profit after claim");

      it("shouldn't allow to claim twice")

      it("should have same profit after selling");

      it("should claim saved profit after selling");

      it("should buy 1500th lots")

      it("shouldn't buy over 1500 lots");
    });
  }
}