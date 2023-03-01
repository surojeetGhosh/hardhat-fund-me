

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {version: "0.8.17"},
      {version: "0.6.6"}
    ]
  },
  networks: {
    "ganache": {
      url: "http://127.0.0.1:7545",
      accounts: [
        "8a2239648a7168fa88ef32620a0ccdc287107442bfa76ed8c436c8845ec1f94d"
      ]
    }
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
    },
  }
};
