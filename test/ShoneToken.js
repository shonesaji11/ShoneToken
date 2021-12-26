var ShoneToken = artifacts.require('ShoneToken')

contract('ShoneToken' , (accounts)=>{ // accounts are the address present in ganache
    var tokenInstance 

    it('sets correct symbol and name upon deployment' , ()=>{
        return ShoneToken.deployed().then(token=>{
            tokenInstance = token
            return token.name();
        }).then(tokenName=>{
            assert.equal(tokenName, 'Shone Token', 'Token Name is correct')
            return tokenInstance.symbol();
        }).then(symbolName=>{
            assert.equal(symbolName, 'SCoin', 'Symbol is correct')
            return tokenInstance.standard();
        }).then(tokenStandard=>{
            assert.equal(tokenStandard, "Shone Token v1.0", 'Correct token standard')
        });
    })

    it('sets the total supply upon deployment' , ()=>{ //The testcase is written inside it()
        return ShoneToken.deployed().then(token=>{
            tokenInstance= token
            return token.totalSupply();
        }).then(supply=>{
            assert.equal(supply.toNumber(), 1000000,'sets total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(balance=>{
            assert.equal(balance.toNumber() , 1000000, "correct initial balance")
        })
    });

    it('testing transfer function' , ()=>{
        return ShoneToken.deployed().then(token=>{
            tokenInstance = token
            //testing require by attempting to transfer a large qty of token (more than the available)
            return tokenInstance.transfer.call(accounts[1] , 9999999999999);
        }).then(assert.fail).catch((error)=>{
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert')
            return tokenInstance.transfer.call(accounts[1], 10, {from : accounts[0]});
        }).then(successMsg=>{
            assert.equal(successMsg , true, 'returns true upon successful transaction')
            return tokenInstance.transfer(accounts[1] , 25000, {from:accounts[0]});
        }).then(receipt=>{
            assert.equal(receipt.logs.length, 1, 'triggers one event');

            return tokenInstance.balanceOf(accounts[1]);
        }).then(rcvrBal=>{
            assert.equal(rcvrBal.toNumber(), 25000, 'adds amount to the receiving account')
            return tokenInstance.balanceOf(accounts[0]);
        }).then(senderBal=>{
            assert.equal(senderBal.toNumber(), 975000, 'Deducted _value from the senders account')
        });
    })

    it('testing approve function', ()=>{
        return ShoneToken.deployed().then(token=>{
            tokenInstance = token
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(success=>{
            assert.equal(success, true, 'approve is successful')
            return tokenInstance.approve(accounts[1],100 );
        }).then(receipt=>{
            //checking through logs
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event , 'Approval', 'Event emitted is Approval');
            assert.equal(receipt.logs[0].args._owner , accounts[0] , 'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender , accounts[1] , 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value , 100, 'logs the amount of tokens that are authorized by owner');
            return tokenInstance.allowance(accounts[0], accounts[1]); //returns value
        }).then(value=>{
            assert.equal(value, 100, 'stores the allowance for delegated transfer')
        })
    })

    it('handles delegated token transfers', ()=>{
        return ShoneToken.deployed().then(token=>{
            tokenInstance = token
            fromAccount = accounts[2]
            toAccount = accounts[3]
            spendingAccount = accounts[3]
            //transfer token to fromAccount
            return tokenInstance.transfer(fromAccount , 100 , {from: accounts[0]});
        }).then(receipt =>{
            //approve sending 10 tokens to spendingAccount
            return tokenInstance.approve(spendingAccount, 10 , {from:fromAccount});
        }).then(receipt=>{
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10 , {from:spendingAccount});
        }).then(success=>{
            assert.equal(success, true, 'sending less than or equal to the approved amount')
            //checking if events are emitted properly
            return tokenInstance.transferFrom(fromAccount, toAccount , 10, {from:spendingAccount});
        }).then(receipt=>{
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event , 'Transfer', 'Event emitted is Transfer');
            assert.equal(receipt.logs[0].args._from , fromAccount , 'logs the account the tokens are sent from');
            assert.equal(receipt.logs[0].args._to , toAccount , 'logs the account the tokens are sent to');
            assert.equal(receipt.logs[0].args._value , 10, 'logs the amount of tokens that are sent');
            return tokenInstance.balanceOf(fromAccount);
        }).then(fromAccBal=>{
            assert.equal(fromAccBal, 90 , '10 tokens sent from fromAccount successfully');
            return tokenInstance.balanceOf(toAccount);
        }).then(toAccBal=>{
            assert.equal(toAccBal , 10 , '10 tokens are received by toAccount') 
            //checking allowance
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(balance=>{
            assert.equal(balance, 0 , "the allowance must be 0 since 10 tokens were approved and 10 tokens were transferred");
        })
    })


    


})