// SPDX-License-Identifier: UNLICENSED
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

contract SafeMath {
 
    function safeAdd(uint a, uint b) public pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }
 
    function safeSub(uint a, uint b) public pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }
 
    function safeMul(uint a, uint b) public pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
 
    function safeDiv(uint a, uint b) public pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}


// This is the main building block for smart contracts.
contract Token is SafeMath {
    // Some string type variables to identify the token.
    // The `public` modifier makes a variable readable from outside the contract.
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    // The fixed amount of tokens stored in an unsigned integer type variable.
    uint256 public totalSupply;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account balance.
    mapping(address => uint256) balances;
    // Blacklist mapping
    mapping(address => bool) backLists;
    // allowed
     mapping(address => mapping(address => uint)) allowed;


    /**
     * Contract initialization.
     *
     * The `constructor` is executed only once when the contract is created.
     */
    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 totalSupply_) {
        // The totalSupply is assigned to transaction sender, which is the account
        // that is deploying the contract.
        balances[msg.sender] = totalSupply_;
        owner = msg.sender;
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        totalSupply = totalSupply_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view  returns (uint8) {
        return _decimals;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function mint(address account, uint amount) public onlyOwner {
        require(account != address(0), "ERC20: mint to the zero address");
        balances[account] += amount;
        totalSupply += amount;
    }

    function burn(address account, uint amount) public onlyOwner {
        require(account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        
        balances[account] = accountBalance - amount;
        totalSupply -= amount;
    }

    function addToBlackList(address account) public onlyOwner{
        backLists[account] = true;
    }

    function removeFromBlackList(address account) public onlyOwner{
        backLists[account] = false;
    }


    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from outside
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        require(!backLists[msg.sender], "Account has been in blacklist cannot transfer");
        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false` then the
        // transaction will revert.
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Transfer the amount.
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        return true;
    }
 
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        balances[from] = safeSub(balances[from], tokens);
        allowed[from][msg.sender] = safeSub(allowed[from][msg.sender], tokens);
        balances[to] = safeAdd(balances[to], tokens);
        return true;
    }

    function allowance(address tokenOwner, address spender) public view returns (uint remaining) {
        return allowed[tokenOwner][spender];
    }


}