const {getNamedAccounts, ethers} = require("hardhat");

async function main() {
    const {deployer} = await getNamedAccounts();
    const fundme = await ethers.getContract("FundMe", deployer);
    console.log("Funding contract...");
    const response = await fundme.fund({
        value: ethers.utils.parseEther("0.006")
    });
    await response.wait(1);
}


main().catch(err => {
    console.log(err);
})