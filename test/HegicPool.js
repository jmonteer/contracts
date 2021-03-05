const { expect, assert } = require("chai");

const BN = ethers.BigNumber
const OptionType = {Invalid: 0, Put: 1, Call: 2};
const MAX_INTEGER = BN.from('2').pow(BN.from('256')).sub(BN.from('1'))
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

module.exports.test = () => {
  const WETH_TOKEN_ADDRESS = ""; 
  const WBTC_TOKEN_ADDRESS = ""; 
  const USDC_TOKEN_ADDRESS = ""; 

  describe("HegicPool", () => {  
    behavesLikeHegicPool({
      name: "USDCPool",
      underlyingToken: USDC_TOKEN_ADDRESS,
      decimals: 6
    });

    behavesLikeHegicPool({
      name: "WETHPool",
      underlyingToken: WETH_TOKEN_ADDRESS,
      decimals: 18
    });

    behavesLikeHegicPool({
      name: "WBTCPool",
      underlyingToken: WBTC_TOKEN_ADDRESS,
      decimals: 8
    });
  });

  function behavesLikeHegicPool(params) {
    const firstProvide = ethers.utils.parseUnits(Math.round(Math.random()*10+1).toString(), params.decimals)
    const secondProvide = ethers.utils.parseUnits(Math.round(Math.random()*10+1).toString(), params.decimals)
    const thirdProvide = ethers.utils.parseUnits(Math.round(Math.random()*10+1).toString(), params.decimals)
    const firstWithdraw = firstProvide;
    const profit = ethers.utils.parseUnits(Math.round(Math.random()*10+1).toString(), params.decimals)
    
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
            hegicPool = hegicPoolWBTC;
            underlyingToken = WBTC;
          } else if (params.underlyingToken == WETH_TOKEN_ADDRESS) {
            hegicPool = hegicPoolWETH;
            underlyingToken = WETH;
          } else if (params.underlyingToken == USDC_TOKEN_ADDRESS) {
            hegicPool = hegicPoolUSDC;
            underlyingToken = USDC;
          }
          
          decimals = params.decimals;
          // set users
          const accountsList = await accounts()
          owner = accountsList[0];
          users = accountsList.slice(1, accountsList.length);
          user1 = users[0];
          user2 = users[1];
          user3 = users[2];
          user4 = users[3];

          initSnapshotId = await takeSnapshot();

          for(const u of accountsList){
            await underlyingToken.mintTo(u.address, ethers.utils.parseEther('100'));
            await underlyingToken.connect(u).approve(hegicPool.address, ethers.utils.parseEther('100').mul(BN.from('100')))
          }
      });

      after(async () => {
        await revertToSnapShot(initSnapshotId);
      })

      it("should set up lockup period correctly during BETA period", async () => {
        expect(await hegicPool.lockupPeriod()).to.equal(BN.from((14*24*3600).toString()));
        const newLockupPeriod = BN.from((40*24*3600).toString());
        await hegicPool.setLockupPeriod(newLockupPeriod);
        expect(await hegicPool.lockupPeriod()).to.equal(newLockupPeriod);
      });

      it("should not set up new lockup period if >60 days", async () => {
        const newLockupPeriod = BN.from((60*24*3600+1).toString());
        expect(hegicPool.setLockupPeriod(newLockupPeriod)).to.be.revertedWith('revert Lockup period is too long');
      });

      // it("should not create a hedge tranche for an uninvited guest", async () => {

      // });

      // it("should add guests to hedging functionality");

      it("should create a tranche for the first provider correctly (no hedging)", async () => {
        const user = user1;
        const amount = firstProvide;
        const hedging = false;
        const minShare = 0;

        const expectedShare = amount.mul(await hegicPool.INITIAL_RATE());
        const expectedId = (await hegicPool.totalSupply());

        await expect(hegicPool.connect(user).provideFrom(user.address, amount, hedging, minShare))
        .to.emit(hegicPool, "Provide")
        .withArgs(user.address, amount, expectedShare, hedging)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(user.address, hegicPool.address, amount)
        .to.emit(hegicPool, "Transfer")
        .withArgs(ethers.constants.AddressZero, user.address, expectedId);;
      });
      
      it("should create a hedged tranche for the first provider correctly", async () => {
        const user = user1;
        const amount = firstProvide;
        const hedging = true;
        const minShare = 0;

        const expectedShare = amount.mul(await hegicPool.INITIAL_RATE());
        const expectedId = (await hegicPool.totalSupply());
        await expect(hegicPool.connect(user).provideFrom(user.address, amount, hedging, minShare))
        .to.emit(hegicPool, "Provide")
        .withArgs(user.address, amount, expectedShare, hedging)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(user.address, hegicPool.address, amount)
        .to.emit(hegicPool, "Transfer")
        .withArgs(ethers.constants.AddressZero, user.address, expectedId);
      });

      it("should create hedged tranche for the second provider correctly", async () => {
        const user = user2;
        const amount = secondProvide;
        const hedging = false;
        const minShare = 0;

        const share = hedging ? await hegicPool.hedgedShare() : await hegicPool.unhedgedShare();
        const balance = hedging ? await hegicPool.hedgedBalance() : await hegicPool.unhedgedBalance();

        const expectedShare = amount.mul(share).div(balance);
        
        const expectedId = (await hegicPool.totalSupply());
        await expect(hegicPool.connect(user).provideFrom(user.address, amount, hedging, minShare))
        .to.emit(hegicPool, "Provide")
        .withArgs(user.address, amount, expectedShare, hedging)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(user.address, hegicPool.address, amount)
        .to.emit(hegicPool, "Transfer")
        .withArgs(ethers.constants.AddressZero, user.address, expectedId);
      });
    
      // calcTotalShareOf = async (user) => {
      //   const tranchesBalance = await hegicPool.balanceOf(user.address);
      //   let unhedgedShare = BN.from('0');
      //   let hedgedShare = BN.from('0');
      //   for(let i = 0; i < tranchesBalance.toNumber(); i++ ){
      //     const trancheId = await hegicPool.tokenOfOwnerByIndex(user.address, i);
      //     const tranche = await hegicPool.tranches(trancheId);
      //     if(tranche.hedged) 
      //       unhedgedShare = unhedgedShare.add(tranche.share);
      //     else
      //       hedgedShare = hedgedShare.add(tranche.share);
      //   }
      //   return unhedgedShare.add(hedgedShare);
      // }

      getShareOf = async (trancheID) => {
        const tranche = await hegicPool.tranches(trancheID);
        const share = tranche.hedged ? await hegicPool.hedgedShare() : await hegicPool.unhedgedShare();
        const balance = tranche.hedged ? await hegicPool.hedgedBalance() : await hegicPool.unhedgedBalance();
        // console.log("tranche ID", trancheID);
        // console.log("tranche's share", tranche.share.toString());
        // console.log("hedged", tranche.hedged)
        // console.log("total share", share.toString());
        // console.log("total balance", balance.toString());

        const trancheShare = balance.mul(tranche.share).div(share);
        // console.log("share", trancheShare.toString())
        return trancheShare;
      }

      it("should distribute the profits correctly", async () => {
        const startShares = []
        const numberOfTranches = await hegicPool.totalSupply();

        for(let i = 0 ; i < numberOfTranches; i++) {
          startShares.push(await getShareOf(i));
        }
        
        const expectedProfits = [];
        const totalShare = (await hegicPool.unhedgedShare()).add(await hegicPool.hedgedShare());
        for(let i = 0 ; i < numberOfTranches; i++) {
          const tranche = await hegicPool.tranches(i);
          const share = tranche.share;
          if(tranche.hedged)
            expectedProfits.push(ethers.utils.parseUnits('10', decimals-2).mul(BN.from('100').sub(await hegicPool.hedgeFeeRate())).div(100).mul(share).div(totalShare).add(await getShareOf(i)))
          else
            expectedProfits.push(ethers.utils.parseUnits('10', decimals-2).mul(share).div(totalShare).add(await getShareOf(i)))
        }
        
        await hegicPool.connect(owner).lock(ethers.utils.parseUnits('1', decimals), ethers.utils.parseUnits('10', decimals-2))
        await hegicPool.connect(owner).unlock(0);

        const results = []
        for(let i = 0; i < numberOfTranches; i++) {
          results.push((await getShareOf(i)).sub(expectedProfits[i]).abs().lte(BN.from('1')));
          if(!results[results.length-1]) console.log((await getShareOf(i)).toString(), "vs", expectedProfits[i].toString())
        }

        for(const res of results)
          assert(res, "Incorrect profit value");
      });

      
      it("should create hedged tranche for the third provider correctly", async () => {
        const user = user3;
        const amount = thirdProvide;
        const hedging = true;
        const minShare = 0;

        const totalShare = await hegicPool.hedgedShare();
        const balance = await hegicPool.hedgedBalance();
        const expectedShare = amount.mul(totalShare).div(balance);
        
        const expectedId = await hegicPool.totalSupply();
        await expect(hegicPool.connect(user).provideFrom(user.address, amount, hedging, minShare))
        .to.emit(hegicPool, "Provide")
        .withArgs(user.address, amount, expectedShare, hedging)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(user.address, hegicPool.address, amount)
        .to.emit(hegicPool, "Transfer")
        .withArgs(ethers.constants.AddressZero, user.address, expectedId);
      });
      
      it("should close the first provider's tranche correctly", async () => {
        const user = user1;
        const trancheId = await hegicPool.tokenOfOwnerByIndex(user.address, 0);
        const amount = await getShareOf(trancheId);
        
        await expect(hegicPool.connect(user).withdraw(trancheId))
        .to.emit(hegicPool, "Withdraw")
        .withArgs(user.address, trancheId)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(hegicPool.address, user.address, amount);

      });

      it("should close the first provider's hedged tranche correctly", async () => {
        const user = user1;
        const trancheId = await hegicPool.tokenOfOwnerByIndex(user.address, 1);
        const amount = await getShareOf(trancheId);
        
        await expect(hegicPool.connect(user).withdraw(trancheId))
        .to.emit(hegicPool, "Withdraw")
        .withArgs(user.address, trancheId)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(hegicPool.address, user.address, amount);
      });

      // it("should not close the first provider's hedged tranched using the wrong function", async () => {
      //   const user = user1;
      //   const amount = firstWithdraw;
      //   const trancheId = await hegicPool.tokenOfOwnerByIndex(user.address, 0);
        
      //   expect(hegicPool.connect(user).withdraw(trancheId))
      //   .to.emit(hegicPool, "Withdraw")
      //   .withArgs(user.address, trancheId);
      // })

      it("should close the second provider's tranche correctly", async () => {
        const user = user2;
        const trancheId = await hegicPool.tokenOfOwnerByIndex(user.address, 0);
        const amount = await getShareOf(trancheId);
        
        await expect(hegicPool.connect(user).withdraw(trancheId))
        .to.emit(hegicPool, "Withdraw")
        .withArgs(user.address, trancheId)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(hegicPool.address, user.address, amount);
      });

      it("should close the third provider's tranche correctly", async () => {
        const user = user3;
        const trancheId = await hegicPool.tokenOfOwnerByIndex(user.address, 0);
        const amount = await getShareOf(trancheId);
        
        await expect(hegicPool.connect(user).withdraw(trancheId))
        .to.emit(hegicPool, "Withdraw")
        .withArgs(user.address, trancheId)
        .to.emit(underlyingToken, "Transfer")
        .withArgs(hegicPool.address, user.address, amount);
      });
    });
  }
}