const { expect, assert } = require("chai");
const { ethers } = require("ethers");
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
      volRates: [5000, 7500, 15000],
      // amounts: [0, 1, 10, 100],
      amounts: [1],
      testPoints: [1700],
      // testPoints: [1, 1400, 1700, 2000, 5000, 10000],
      utilisationRates: [0, 40, 75],
      periods: [1, 86400, 172800, 86400*8, 86400*30]
    });

    // behavesLikeHegicOptionsPricer({
    //   name: "WETH - PUT",
    //   underlyingToken: WETH_TOKEN_ADDRESS,
    //   callToken: WETH_TOKEN_ADDRESS,
    //   putToken: USDC_TOKEN_ADDRESS,
    //   type: OptionType.Put,
    //   volRates: [5000, 7500, 15000],
    //   amounts: [0, 1, 10, 100],
    //   testPoints: [1, 1400, 1700, 2000, 5000, 10000],
    //   utilisationRates: [0, 40, 75],
    //   periods: [1, 86400, 172800, 86400*8, 86400*30]
    // });
  });

  function behavesLikeHegicOptionsPricer(params) {
    let initSnapshotId;
    let midSnapshot;

    let currentPrice;
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
    
          if(params.underlyingToken == WETH_TOKEN_ADDRESS) {
            hegicOptionsPricer = hegicOptionsPricerWETH;
            priceProvider = priceProviderWETH;
            hegicPool = hegicPoolWETH;
            underlyingToken = WETH;
            decimals = 18;
          } else if(params.underlyingToken == WBTC_TOKEN_ADDRESS) {
            hegicOptionsPricer = hegicOptionsPricerWBTC;
            priceProvider = priceProviderWBTC;
            hegicPool = hegicPoolWBTC;
            underlyingToken = WBTC;
            decimals = 8;
          }

          // set users
          const accountsList = await accounts()
          owner = accountsList[0];
          users = accountsList.slice(1, accountsList.length);
          user1 = users[0];
          user2 = users[1];
          user3 = users[2];
          user4 = users[3];

          for(const u of accountsList){
            await underlyingToken.mintTo(u.address, ethers.utils.parseEther('100'));
            await underlyingToken.connect(u).approve(hegicPool.address, ethers.utils.parseEther('100').mul(BN.from('100')))
          }
          initSnapshotId = await takeSnapshot();
    });

    after(async () => {
      await revertToSnapShot(initSnapshotId);
    })

    getExpectedOptionPrice = async (params) => {
      const settlementFee = params.amount.div(BN.from('100'));
      let periodFee;
      let ivRate;
      if(params.period < 86400*7) {
        ivRate = params.volRates[0];
      } else if (params.period < 86400*28) {
        ivRate = params.volRates[1];
      } else {
        ivRate = params.volRates[2];
      }
      iv = BN.from(ivRate.toString()).mul(calcSQRT(BN.from((params.period).toString())))
      console.log("Expected:", BN.from((params.period).toString()).toString());
      console.log("Expected:", calcSQRT(BN.from((params.period).toString())).toString());
      
      const poolBalance = await hegicPool.totalBalance(); 
      const lockedAmount = await hegicPool.lockedAmount();
      const utilization = poolBalance.eq(BN.from('0')) ? BN.from('0') : lockedAmount.mul(ethers.utils.parseUnits('100', 8)).div(poolBalance);
      const utilizationRate = await hegicOptionsPricer.utilizationRate();
      if(utilization.gt(ethers.utils.parseUnits('40', 8))) {
        iv = iv.add(iv.mul(utilization.sub(ethers.utils.parseUnits('40', 8))).mul(utilizationRate)).div(ethers.utils.parseUnits('40', 16))
      }

      if(params.optionType == OptionType.Put) {
        return [settlementFee, (params.amount).mul(iv).mul(params.strike).div(params.currentPrice).div(ethers.utils.parseUnits('1', 8+decimals-6))]
      } else if(params.optionType == OptionType.Call) {
        return [settlementFee, (params.amount).mul(iv).mul(params.currentPrice).div(params.strike).div(ethers.utils.parseUnits('1', 8))]
      }
    }

    calcSQRT = (x) => {
      result = x;
      k = x.div(BN.from('2')).add(BN.from('1'));
      while (k < result) [result, k] = [k, x.div(k).add(k).div(BN.from('2'))];
      return result;
    }

    it("should be owned by deployer", async () => {
      expect(await hegicOptionsPricer.owner()).to.equal(owner.address);
    });

    it("should change impliedVolRate", async () => {
      const newVolRate = params.volRates;
      await hegicOptionsPricer.connect(owner).setImpliedVolRate(newVolRate);
      expect(await hegicOptionsPricer.impliedVolRate(0)).to.equal(newVolRate[0]);
      expect(await hegicOptionsPricer.impliedVolRate(1)).to.equal(newVolRate[1]);
      expect(await hegicOptionsPricer.impliedVolRate(2)).to.equal(newVolRate[2]);
    });

    it("snapshot", async () => {
      midSnapshot = await takeSnapshot();

    })
    for(let utilRate of params.utilisationRates)
      describe(`for utilisation rate over ${utilRate}%`, () => {
        it("should get to utilisation rate", async () => {
          await revertToSnapShot(midSnapshot);
          await hegicPool.connect(user1).provideFrom(user1.address, ethers.utils.parseUnits('1', decimals), false, 0);
          const poolBalance = await hegicPool.totalBalance(); 
          const lockedAmount = await hegicPool.lockedAmount();
          const utilization = poolBalance.eq(BN.from('0')) ? BN.from('0') : lockedAmount.mul(ethers.utils.parseUnits('100', 8)).div(poolBalance);

          console.log(utilization.toString())
          
        })
        for(let period of params.periods) 
        describe(`for period = ${period} seconds (${period/3600/24} days)`, () => {
          for(let _amount of params.amounts)
            describe(`for a size = ${_amount}`, () => {
              for(let testPoint of params.testPoints)
              it(`should return correct pricing for $${testPoint} strike`, async () => {
                const strike = ethers.utils.parseUnits(testPoint.toString(),8);
                const amount = ethers.utils.parseUnits(_amount.toString(), decimals);
                const currentPrice = await priceProvider.latestAnswer();
                if(currentPrice.eq(strike)){
                  const expectedPrice = await getExpectedOptionPrice({amount, period, strike, currentPrice, optionType: params.type, volRates: params.volRates})
                  console.log("expected:",expectedPrice.toString());
                  console.log("real:",(await hegicOptionsPricer.fees(period, amount, strike, params.type)).toString());
                  const realPrice = await hegicOptionsPricer.fees(period, amount, strike, params.type);
                  expect(expectedPrice[0]).to.equal(realPrice[0]);
                  expect(expectedPrice[1]).to.equal(realPrice[1]);
                } else {
                  await expect(hegicOptionsPricer.fees(period, amount, strike, params.type))
                  .to.be.reverted
                }
              });
            })
        })
      })

    it("show data table")
    });
  }
}