// Get funds from users
// Withdraw funds
// Set a minimum unding value in usd

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
// importing aggregatorv3 interface which can hold any contract
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";



// creating custom error const less gas as require uses strings to revert and it const gases
error NotOwner();

// two keyword for optimal constant and immutable
contract FundMe {

    // mentioning for which first argument will be library functions be used
    using PriceConverter for uint256;

  
    uint256 public constant minimumUsd = 1 * 1e18; // minimum 0.006 wther
    
    // funder array
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    
    // owner
    // immutable is also gas efficient and use for variables where owner is set only once
    address public immutable owner;
    AggregatorV3Interface public priceFeed;
    // use deploy contract to get owner address
    constructor(address _api) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(_api);
    }
    
    // payable function allows sending wther to contract
    function fund() public payable {
        // chain link allows to get real world data
        require(msg.value.getConversionRate(priceFeed) >= minimumUsd, "Didn't Send enough!");
        // saving funders address
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
       
    }


    function withdraw() public onlyOwner {
        for(uint256 i = 0; i < funders.length; i++) {
            address funderAddress = funders[i];
            addressToAmountFunded[funderAddress] = 0;
        }
       
        funders = new address[](0);
        (bool CallSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(CallSuccess, "Call Failed");
    }


    modifier onlyOwner {
        if(msg.sender != owner) {revert NotOwner();}
        _;
    }
    receive() external payable{
        fund();
    } 

    fallback() external payable{
        fund();
    }

}
