const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const developmentChains = ["hardhat", "localhost"];

developmentChains.includes(network.name)
    ? describe("Fund Me", async () => {
          let fundme, deployer, mockV3Aggregator;
          let sendValue;
          beforeEach(async () => {
              // ethers.getSigners() to get accounts listed for server
              // it will run all the contracts with tag all and in single line
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              // so whenever we call fundme it will be from deployer account and deployer account will call
              fundme = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
              sendValue = ethers.utils.parseEther("1");
          });
          describe("Constructor", () => {
              it("Sets the aggregator address correctly", async () => {
                  const response = await fundme.priceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });
          describe("fund", async () => {
              it("Fails for less donation", async () => {
                  await expect(fundme.fund()).to.be.revertedWith(
                      "Didn't Send enough!"
                  );
              });
              it("updated the amount funded data structure", async () => {
                  await fundme.fund({ value: sendValue });

                  const response = await fundme.addressToAmountFunded(deployer);
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Adds funder to array of funders", async () => {
                  await fundme.fund({ value: sendValue });

                  const response = await fundme.funders(0);
                  assert.equal(response, deployer);
              });
          });

          describe("Withdraw", async () => {
              beforeEach(async () => {
                  // as we want to first fund before withdrawing
                  await fundme.fund({ value: sendValue });
              });
              it("withdraw eth from a single founder", async () => {
                  const startingFundMeBalance =
                      await fundme.provider.getBalance(fundme.address);
                  const startingDeployerBalance =
                      await fundme.provider.getBalance(deployer);
                  const transaction = await fundme.withdraw();
                  const receipt = await transaction.wait(1);
                  const { gasUsed, effectiveGasPrice } = receipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundme.provider.getBalance(
                      fundme.address
                  );
                  const endingDeployerBalance =
                      await fundme.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost)
                  );
              });
              it("withdraw eth from multiple founders", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 6; i++) {
                      const fundMeConnectedContract = await fundme.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundme.provider.getBalance(fundme.address);
                  const startingDeployerBalance =
                      await fundme.provider.getBalance(deployer);
                  const transaction = await fundme.withdraw();
                  const receipt = await transaction.wait(1);
                  const { gasUsed, effectiveGasPrice } = receipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundme.provider.getBalance(
                      fundme.address
                  );
                  const endingDeployerBalance =
                      await fundme.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost)
                  );
                  // make sure that funders are reset
                  await expect(fundme.funders(0)).to.be.reverted;

                  for (let i = 0; i < 6; i++) {
                      assert.equal(
                          await fundme.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
              it("Cheap withdraw eth from multiple founders", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 6; i++) {
                      const fundMeConnectedContract = await fundme.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundme.provider.getBalance(fundme.address);
                  const startingDeployerBalance =
                      await fundme.provider.getBalance(deployer);
                  const transaction = await fundme.CheaperWithdraw();
                  const receipt = await transaction.wait(1);
                  const { gasUsed, effectiveGasPrice } = receipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundme.provider.getBalance(
                      fundme.address
                  );
                  const endingDeployerBalance =
                      await fundme.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost)
                  );
                  // make sure that funders are reset
                  await expect(fundme.funders(0)).to.be.reverted;

                  for (let i = 0; i < 6; i++) {
                      assert.equal(
                          await fundme.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
              it("Only owner withdrawing ethers", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const fundMeConnectedContract = await fundme.connect(
                      accounts[1]
                  );
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });
      })
    : describe.skip;
