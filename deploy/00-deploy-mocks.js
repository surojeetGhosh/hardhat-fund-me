// for creating mocks for local host

const {network} = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts(); 
    // in this we can give account name to different index and save it in config file
    // by default deployer pointed to 0 index

    // for that go to contracts folder and create a test folder
    // to separate mock contracts and you can get mocks contract at
    // chainlink folder
    // after compiling mockcontract
    const DECIMAL = 8;
    const Initial = 2000_0000_0000;
    const developmentChains = ["hardhat", "localhost", "ganache"];
    if(developmentChains.includes(network.name)) {
        log("Local network detected!");
        await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMAL, Initial],
            log: true
        });
        log("Mocks deployed");
        log("----------------------------------------------------------------")
    }
}

// this is for mentioning whether we want to deploy mocks npx hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"];