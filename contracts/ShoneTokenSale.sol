// SPDX-License-Identifier: MIT
pragma solidity^0.8.1;

import "./ShoneToken.sol";

contract ShoneTokenSale{
    ShoneToken public tokenAddress;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    address payable admin;

    event Sell(address _buyer, uint256 _noTokens);

    constructor(ShoneToken _tokenAddress , uint256 _tokenPrice, address payable _admin){
        admin = _admin;
        tokenAddress = _tokenAddress;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns(uint256 z){
        require(y==0 || (z = x * y)/ y ==x );
    }

    function buyToken(uint256 _numOfToken) public payable{
        require(msg.value == multiply(_numOfToken, tokenPrice)); //make sure buyer is paying exact amount for the no. of tokens being purchased
        //address(this) returns address of the contract
        require(tokenAddress.balanceOf(address(this)) >= _numOfToken); //make sure the contract has enough tokens that is requested by the buyer
        require(tokenAddress.transfer(msg.sender, _numOfToken));
        admin.transfer(msg.value);
        tokenSold += _numOfToken;
        emit Sell(msg.sender, _numOfToken);
    }

    function endSale() public{
        require(msg.sender == admin);
        //transfer remaining tokens inside the contract to the admin
        tokenAddress.transfer(admin, tokenAddress.balanceOf(address(this)));
        selfdestruct(admin);
    }
}