App = {
    account : "0x0",
    contracts : {},
    web3Provider : null,
    loading: false,
    tokenPrice: 1000000000000,
    tokenSold: 0,
    tokenAvailable: 750000,
    initialTransfer: true,

    init : function(){
        console.log("App initialized")
        return App.initWeb3();
    },

    initWeb3 : function(){
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
          } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
          }
          
          return App.initContracts();
    },

    initContracts : function(){
        $.getJSON("ShoneTokenSale.json", function(ShoneTokenSale) {
            App.contracts.ShoneTokenSale = TruffleContract(ShoneTokenSale);
            App.contracts.ShoneTokenSale.setProvider(App.web3Provider);
            App.contracts.ShoneTokenSale.deployed().then(function(ShoneTokenSale) {
              console.log("Shone Token Sale Address:", ShoneTokenSale.address);
            });
        }).done(()=>{
            $.getJSON("ShoneToken.json", function(ShoneToken) {
                App.contracts.ShoneToken = TruffleContract(ShoneToken);
                App.contracts.ShoneToken.setProvider(App.web3Provider);
                App.contracts.ShoneToken.deployed().then(function(ShoneToken) {
                  console.log("Shone Token Address:", ShoneToken.address);
                });
                App.listenForSellEvent(); // Keeping it in initWeb3 wont work as we havent defined ShoneTokenSale there
                return App.render();
            })
        })
    },
    
    listenForSellEvent: function(){
        App.contracts.ShoneTokenSale.deployed().then(token => {
            token.Sell({},{
                fromBlock: 0,
                toBlock: 'latest',
            }).watch((error, event) =>{
                // console.log("Event : ", event)
                App.render();
            })
        })
    },

    render : function(){

        if(App.loading){
            return;
        }
        
        var loader = $('#loader');
        var content = $('#content');
        var tokenSaleInstance;
        var tokenInstance;

        loader.show();
        content.hide();

        web3.eth.getCoinbase((err, account)=>{
            if (err === null){
                App.account = account;
                $('#accountAddress').html("Your Account: " + App.account);
            }
        })
        
        App.contracts.ShoneTokenSale.deployed().then(instance => {
            tokenSaleInstance = instance;
            return instance.tokenPrice();
        }).then(price => {
            App.tokenPrice = price.toNumber();
            // console.log("token price is ", price.toNumber());
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
            return tokenSaleInstance.tokenSold();
        }).then(tokensold => {
            App.tokenSold = tokensold.toNumber();
            // App.tokenSold = 600000; Just to check if the progress bar was working
            $('.tokens-sold').html(App.tokenSold);
            $('.tokens-available').html(App.tokenAvailable);

            var progress = (Math.ceil(App.tokenSold)/App.tokenAvailable)*100;
            $('#progress').css('width', progress + '%');
            
            App.contracts.ShoneToken.deployed().then(token => {
                tokenInstance = token;
                // To transfer the tokens from ShoneToken to ShoneTokenSale contract, use following code
                // Either run this code once with the below lines unblocked and transfer the tokens
                // Or use truffle console and perform the transfer operation 
                /*if(App.initialTransfer){
                    App.initialTransfer = false;
                    tokenInstance.transfer(tokenSaleInstance.address, 750000, {from : App.account});
                }*/
                return tokenInstance.balanceOf(App.account);
            }).then(accountBal => {
                $('.dapp-balance').html(accountBal.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
        })
        })
    },

    buyToken: function(){
        var numberOfToken = $('#numberOfToken').val();
        console.log("Inside buyToken function ");
        var tokenSaleInstance;
        App.contracts.ShoneTokenSale.deployed().then(token => {
            tokenSaleInstance = token;
            return tokenSaleInstance.buyToken(numberOfToken, {from: App.account, value : numberOfToken*App.tokenPrice})
        }).then(()=>{
            $('form').trigger('reset')
        });
    }
}

jQuery(function($) {
    //execute code
    App.init();
  });  