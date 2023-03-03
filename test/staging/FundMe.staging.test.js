const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");

const developmentChains = ["hardhat", "localhost"];

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Fund Me", async () => {
          // assuming already deployed so need of fixtures and mock
          let fundme, deployer;
          let sendValue;
          beforeEach(async () => {
              // so whenever we call fundme it will be from deployer account and deployer account will call
              deployer = await getNamedAccounts().deployer;
              fundme = await ethers.getContract("FundMe", deployer);
              sendValue = ethers.utils.parseEther("0.006");
          });

          it("Withdraw and fund", async () => {
              expect(await fundme.fund({ value: sendValue }));
          });
      });
