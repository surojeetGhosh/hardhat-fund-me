const networkConfig = require("../hardhat-helper-config");
const {network} = require("hardhat");
const verify = require("../utils/verify");
require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts(); 
    // in this we can give account name to different index and save it in config file
    // by default deployer pointed to 0 index
    const chainId = network.config.chainId;

    //if contract doesn't exist we deploy minimal version of contracts
    // if chainId X use Y
    // if chain y use Z for that use helper-hardat-config
    // when we use localhost or hardhat we use mocks
    // now based on chainId it will use different contract address for price feed
    
    // connecting mocks if mock is used then use pricefeed address of mock
    let ethUsdPriceFeed;
    const developmentChains = ["hardhat", "localhost"];

    if(developmentChains.includes(network.name)) {
        const ethUsdPriceFeedContract = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeed = ethUsdPriceFeedContract.address;
    } else {
        ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    const contract = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeed],
        log: true,
        waitConfirmations: chainId === 5? 6 : 1
    })

    // verify done

    if( !developmentChains.includes(network.name) && process.env.API) {
        await verify(contract.address, [ethUsdPriceFeed]);
    }
    log("-----------------------------------------")
}

module.exports.tags = ["all", "fundme"];