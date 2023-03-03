const {getNamedAccounts, ethers} = require("hardhat");

async function main() {
    const {deployer} = await getNamedAccounts();
    const fundme = await ethers.getContract("FundMe", deployer);
    console.log("Funding contract...");
    const response = await fundme.withdraw();
    await response.wait(1);
}


main().catch(err => {
    console.log(err);
})