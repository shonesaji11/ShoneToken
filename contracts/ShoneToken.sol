// SPDX-License-Identifier: MIT
pragma solidity^0.8.1;

contract ShoneToken{
    string public name = "Shone Token";
    string public symbol = "SCoin";
    uint256 public totalSupply;
    string public standard = "Shone Token v1.0";
    mapping(address=>uint256) public balanceOf;
    mapping(address=>mapping(address=>uint)) public allowance;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(uint256 _initialSupply){
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value)  public returns(bool success){
        require(balanceOf[msg.sender] >= _value);   

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    //delegated transfer - approval, transferFrom and allowance
    function approve(address _spender, uint256 _value) public returns(bool success){ //return bool to know the status of the function (executed or not)
        //_spender is the account we want to approve to spend on our (caller of the function) behalf
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender , _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;

    }



}