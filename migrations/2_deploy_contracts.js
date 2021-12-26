const ShoneToken = artifacts.require("ShoneToken");
var ShoneTokenSale = artifacts.require("ShoneTokenSale");

module.exports = function (deployer) {
  deployer.deploy(ShoneToken, 1000000).then(()=>{
    var tokenPrice = 1000000000000000
    return deployer.deploy(ShoneTokenSale, ShoneToken.address, tokenPrice , "0x82bbC1569Ea545fD14832462A77e6f72bCf07ecF" );
  });
};
