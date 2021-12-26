var ShoneTokenSale = artifacts.require('./ShoneTokenSale.sol')
var ShoneToken = artifacts.require('./ShoneToken.sol')

contract('ShoneTokenSale' , (accounts)=>{
    var tokenSaleInstance
    var tokenInstance
    var admin = accounts[0]
    var buyer = accounts[1]
    var numberOfToken

    var tokenPrice = 1000000000
    it('it initializes ShoneTokenSale contract' , ()=>{
        return ShoneTokenSale.deployed().then(token=>{
            tokenSaleInstance = token
            return tokenSaleInstance.address;
        }).then(contractAddr=>{
            assert.notEqual(contractAddr, 0x0, 'contract deployed successfully')
            return tokenSaleInstance.tokenPrice();
        }).then(tokenprice=>{
            assert.equal(tokenprice, tokenPrice , 'Initializes with the correct tokenPrice' )
            return tokenSaleInstance.tokenAddress();
        }).then(tokenAddr=>{
            assert.notEqual(tokenAddr , 0x0, 'token address is set')
        })
    })

    it('tests buyToken functionality' , ()=>{
        return ShoneToken.deployed().then(token=>{
            tokenInstance = token
            return ShoneTokenSale.deployed();
        }).then(token=>{
            tokenSaleInstance = token
            return tokenInstance.transfer(tokenSaleInstance.address, 750000 , {from : admin});
        }).then(receipt=>{
            numberOfToken = 10000
            return tokenSaleInstance.buyToken(numberOfToken, {from: buyer, value : numberOfToken*tokenPrice})
        }).then(receipt=>{
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event , 'Sell', 'Event emitted is Sell');
            assert.equal(receipt.logs[0].args._buyer , accounts[1] , 'logs the account the tokens are bought by');
            assert.equal(receipt.logs[0].args._noTokens , numberOfToken , 'logs the number of tokens sold');
            return tokenSaleInstance.tokenSold();
        }).then(noTokensSold=>{
            assert.equal(noTokensSold.toNumber(), numberOfToken , 'number of tokens sold is correct')
            return tokenInstance.balanceOf(buyer);
        }).then(buyerTokenBal =>{
            assert.equal(buyerTokenBal.toNumber() , numberOfToken, 'buyer has received the tokens bought')
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(contractAvailBal =>{
            assert.equal(contractAvailBal.toNumber(), 750000 - numberOfToken, 'available balance in contract reduced by the amount transferred to the buyer')
        })
    })
})