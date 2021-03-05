
let hegicOptionsWBTC,
    hegicOptionsWETH,
    hegicPoolUSDC,
    hegicPoolWBTC,
    hegicPoolWETH,
    hegicStakingUSDC,
    hegicStakingWBTC,
    hegicStakingWETH,
    wethToken,
    usdcToken,
    wbtcToken,
    priceProviderWBTC,
    priceProviderWETH,
    hegicOptionsPricerWBTC,
    hegicOptionsPricerWETH;
contracts = async () => {
    if(hegicOptionsWBTC &&
        hegicOptionsWETH &&
        hegicPoolUSDC &&
        hegicPoolWBTC &&
        hegicPoolWETH &&
        hegicStakingUSDC &&
        hegicStakingWBTC &&
        hegicStakingWETH &&
        wethToken &&
        usdcToken &&
        wbtcToken &&
        priceProviderWBTC &&
        priceProviderWETH &&
        hegicOptionsPricerWBTC &&
        hegicOptionsPricerWETH) {
            return { hegicOptionsWBTC, hegicOptionsWETH, hegicPoolUSDC, hegicPoolWBTC, hegicPoolWETH, hegicStakingUSDC, hegicStakingWBTC, hegicStakingWETH, wethToken, usdcToken, wbtcToken, priceProviderWBTC, priceProviderWETH, hegicOptionsPricerWBTC, hegicOptionsPricerWETH }
        }

    
    const users = await accounts();
    const deployer = users[0];
    
    // TOKENS
    const ERC20TokenContract = await ethers.getContractFactory("FakeERC20");
    wethToken = await ERC20TokenContract.deploy("FakeWETH", "fWETH", 18);
    await wethToken.deployed();
    
    wbtcToken = await ERC20TokenContract.deploy("FakeWBTC", "fWBTC", 8);
    await wbtcToken.deployed();
    
    usdcToken = await ERC20TokenContract.deploy("FakeUSDC", "fUSDC", 6);
    await usdcToken.deployed();
    
    hegicToken = await ERC20TokenContract.deploy("FakeHEGIC", "fHEGIC", 18);
    await hegicToken.deployed();
    const WETH_TOKEN_ADDRESS = wethToken.address;
    const USDC_TOKEN_ADDRESS = usdcToken.address;
    const WBTC_TOKEN_ADDRESS = wbtcToken.address;
    const HEGIC_TOKEN_ADDRESS = hegicToken.address; 

    // PRICE PROVIDERS
    const FakePriceProviderContract = await ethers.getContractFactory("FakePriceProvider");
    
    priceProviderWETH = await FakePriceProviderContract.deploy(ethers.utils.parseUnits("1700", 8));
    await priceProviderWETH.deployed();
    const WETH_PRICE_PROVIDER_ADDRESS = priceProviderWETH.address;

    priceProviderWBTC = await FakePriceProviderContract.deploy(ethers.utils.parseUnits("50000", 8));
    await priceProviderWBTC.deployed();
    const WBTC_PRICE_PROVIDER_ADDRESS = priceProviderWBTC.address;

    // HEGIC POOLS CONTRACTS
    const HegicPoolContract = await ethers.getContractFactory("HegicPool");

    hegicPoolWETH = await HegicPoolContract.deploy(WETH_TOKEN_ADDRESS, "writeWETH", "wWETH");
    await hegicPoolWETH.deployed();
    const WETH_LIQUIDITY_POOL_ADDRESS = hegicPoolWETH.address;

    hegicPoolUSDC = await HegicPoolContract.deploy(USDC_TOKEN_ADDRESS, "writeUSDC", "wUSDC");
    await hegicPoolUSDC.deployed();
    const USDC_LIQUIDITY_POOL_ADDRESS = hegicPoolUSDC.address;

    hegicPoolWBTC = await HegicPoolContract.deploy(WBTC_TOKEN_ADDRESS, "writeWBTC", "wWBTC");
    await hegicPoolWBTC.deployed();
    const WBTC_LIQUIDITY_POOL_ADDRESS = hegicPoolWBTC.address;

    // HEGIC STAKING CONTRACTS
    const HegicStakingContract = await ethers.getContractFactory("HegicStaking");

    hegicStakingWETH = await HegicStakingContract.deploy(HEGIC_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS, "Hegic WETH Lot", "hlWETH");
    await hegicStakingWETH.deployed();
    const HEGIC_WETH_STAKING_ADDRESS = hegicStakingWETH.address;

    hegicStakingWBTC = await HegicStakingContract.deploy(HEGIC_TOKEN_ADDRESS, WBTC_TOKEN_ADDRESS, "Hegic WBTC Lot", "hlWBTC");
    await hegicStakingWBTC.deployed();
    const HEGIC_WBTC_STAKING_ADDRESS = hegicStakingWBTC.address;

    hegicStakingUSDC = await HegicStakingContract.deploy(HEGIC_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS, "Hegic USDC Lot", "hlUSDC");
    await hegicStakingUSDC.deployed();
    const HEGIC_USDC_STAKING_ADDRESS = hegicStakingWETH.address;

    // HEGIC OPTIONS PRICER
    const HegicOptionsPricerContract = await ethers.getContractFactory("PriceCalculator");
    
    hegicOptionsPricerWETH = await HegicOptionsPricerContract.deploy([9000, 10000, 20000], WETH_PRICE_PROVIDER_ADDRESS, WETH_LIQUIDITY_POOL_ADDRESS, 6);
    await hegicOptionsPricerWETH.deployed();
    const HEGIC_WETH_OPTIONS_PRICER_ADDRESS = hegicOptionsPricerWETH.address;
    
    hegicOptionsPricerWBTC = await HegicOptionsPricerContract.deploy([9000, 10000, 20000], WBTC_PRICE_PROVIDER_ADDRESS, WBTC_LIQUIDITY_POOL_ADDRESS, 6);
    await hegicOptionsPricerWBTC.deployed();
    const HEGIC_WBTC_OPTIONS_PRICER_ADDRESS = hegicOptionsPricerWBTC.address;
    
    // HEGIC OPTIONS CONTRACTS
    const HegicOptionsContract = await ethers.getContractFactory("HegicOptions");
    hegicOptionsWETH = await HegicOptionsContract.deploy(WETH_PRICE_PROVIDER_ADDRESS, WETH_LIQUIDITY_POOL_ADDRESS, USDC_LIQUIDITY_POOL_ADDRESS, HEGIC_USDC_STAKING_ADDRESS, HEGIC_WETH_STAKING_ADDRESS, WETH_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS, "HegicOptions ETH", "HO_ETH");
    await hegicOptionsWETH.deployed();
    const HEGIC_WETH_OPTIONS_ADDRESS = hegicOptionsWETH.address;

    await hegicOptionsWETH.connect(deployer).updatePriceCalculator(HEGIC_WETH_OPTIONS_PRICER_ADDRESS);

    hegicOptionsWBTC = await HegicOptionsContract.deploy(WBTC_PRICE_PROVIDER_ADDRESS, WBTC_LIQUIDITY_POOL_ADDRESS, USDC_LIQUIDITY_POOL_ADDRESS, HEGIC_USDC_STAKING_ADDRESS, HEGIC_WBTC_STAKING_ADDRESS, WBTC_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS, "HegicOptions WBTC", "HO_WBTC");
    await hegicOptionsWBTC.deployed();
    const HEGIC_WBTC_OPTIONS_ADDRESS = hegicOptionsWBTC.address;

    await hegicOptionsWBTC.connect(deployer).updatePriceCalculator(HEGIC_WBTC_OPTIONS_PRICER_ADDRESS);

    // HEGIC FACADE
    const HegicFacadeContract = await ethers.getContractFactory("Facade");
    hegicFacade = await HegicFacadeContract.deploy();
    await hegicFacade.deployed();

    // await hegicFacade.append()
    return { hegicOptionsWBTC, hegicOptionsWETH, hegicPoolUSDC, hegicPoolWBTC, hegicPoolWETH, hegicStakingUSDC, hegicStakingWBTC, hegicStakingWETH, wethToken, usdcToken, wbtcToken, priceProviderWBTC, priceProviderWETH, hegicOptionsPricerWBTC, hegicOptionsPricerWETH }
}

accounts = async () => {
    const users = await ethers.getSigners();
    return users;
}

changePrice = async (op, newPrice) => {
    await op.setLatestPrice(ethers.utils.parseUnits(newPrice, 8));
}

timeTravel = async (seconds) => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
}

setBlockTimestamp = async (timestamp) => {
    await send("evm_setNextBlockTimestamp", [timestamp]);
}

getNowTimestamp = async () => {
    let blockNumber = await hre.network.provider.send("eth_blockNumber", []);
    let now = await hre.network.provider.send("eth_getBlockByNumber", [blockNumber, false]).then(x => x.timestamp);
    let nowTimestamp = ethers.BigNumber.from(now);
    return nowTimestamp;
}

getETHBalance = async (address) => {
    return ethers.provider.getBalance(address);
}

getGasETH = async (tx) => {
    return await tx.wait().then(tx=>tx.gasUsed).then(gas => gas.mul(tx.gasPrice));
}

takeSnapshot = async () => {
    const snapshotId = await ethers.provider.send("evm_snapshot");
    return snapshotId;
}
  
revertToSnapShot = async (id) => {
    await ethers.provider.send("evm_revert", [id]);
  }

getExpectedProfit = async (option, currentPrice) => {
    const OptionType = {Invalid: 0, Put: 1, Call: 2};
    let profit = 0;
    
    if(option.optionType == OptionType.Call) {
        profit = currentPrice.sub(option.strike).mul(option.amount).div(currentPrice);
    } else if (option.optionType == OptionType.Put) {
        profit = option.strike.sub(currentPrice).mul(option.amount).div(currentPrice);
    }

    return profit;
}