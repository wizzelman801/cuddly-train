// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleBank
 * @dev A simple bank contract with known vulnerabilities for testing
 */
contract SimpleBank {
    mapping(address => uint256) public balances;
    address public owner;
    uint256 public constant INTEREST_RATE = 5;
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Deposit function
     */
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    /**
     * @dev Vulnerable withdrawal function
     */
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient funds");
        
        // Vulnerability: External call before state change (reentrancy)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
    }
    
    /**
     * @dev Get balance with timestamp dependence
     */
    function getTimestampBasedBonus() public view returns (uint256) {
        // Vulnerability: Timestamp dependence
        return balances[msg.sender] * block.timestamp % 100;
    }
}