#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { Web3Scanner } from './scanner.js';
import { ScannerOptions } from './types.js';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('cuddly-train')
  .description('Web3 Bug Scanner and Style Debugger')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan files or directories for vulnerabilities and style issues')
  .argument('<path>', 'File or directory path to scan')
  .option('-g, --no-gas', 'Disable gas optimization analysis')
  .option('-s, --no-style', 'Disable style checking')
  .option('--strict', 'Enable strict mode for more thorough checking')
  .option('-o, --output <file>', 'Output results to file')
  .action(async (targetPath: string, options) => {
    console.log(chalk.blue('🔍 Web3 Bug Scanner & Style Debugger'));
    console.log(chalk.gray('=====================================\n'));

    try {
      const scannerOptions: ScannerOptions = {
        includeGasOptimization: options.gas !== false,
        includeStyleCheck: options.style !== false,
        strictMode: options.strict || false
      };

      const scanner = new Web3Scanner(scannerOptions);
      const targetStat = fs.statSync(targetPath);
      
      console.log(chalk.yellow(`📂 Scanning: ${targetPath}`));
      console.log(chalk.gray(`Options: Gas=${scannerOptions.includeGasOptimization}, Style=${scannerOptions.includeStyleCheck}, Strict=${scannerOptions.strictMode}\n`));

      let results;
      if (targetStat.isDirectory()) {
        results = await scanner.scanDirectory(targetPath);
      } else {
        const result = await scanner.scanFile(targetPath);
        results = [result];
      }

      const formattedOutput = Web3Scanner.formatResults(results);
      
      if (options.output) {
        fs.writeFileSync(options.output, formattedOutput);
        console.log(chalk.green(`✅ Results saved to ${options.output}`));
      } else {
        console.log(formattedOutput);
      }

      // Exit with error code if critical vulnerabilities found
      const criticalCount = results.reduce((count, r) => 
        count + r.vulnerabilities.filter(v => v.severity === 'critical').length, 0);
      
      if (criticalCount > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Run a demonstration with sample vulnerable code')
  .action(() => {
    console.log(chalk.blue('🔍 Web3 Bug Scanner Demo'));
    console.log(chalk.gray('========================\n'));

    const vulnerableCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableContract {
    mapping(address => uint256) public balances;
    address public owner;
    uint256 constant rate = 100;
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        
        // Vulnerable to reentrancy
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        
        balances[msg.sender] -= amount;
    }
    
    function transferOwnership(address newOwner) public {
        // Using tx.origin instead of msg.sender
        require(tx.origin == owner);
        owner = newOwner;
    }
    
    function getRandomNumber() public view returns (uint256) {
        // Timestamp dependence
        return uint256(keccak256(abi.encodePacked(block.timestamp))) % 100;
    }
    
    function unsafeLoop(uint256[] memory data) public {
        // Gas inefficient loop
        for (uint256 i = 0; i < data.length; i++) {
            balances[msg.sender] += data[i];
        }
    }
}`;

    const scanner = new Web3Scanner();
    const result = scanner.scanCode(vulnerableCode, 'demo.sol');
    const formattedOutput = Web3Scanner.formatResults([result]);
    
    console.log(formattedOutput);
  });

program
  .command('check-style')
  .description('Check only style and formatting issues')
  .argument('<path>', 'File or directory path to check')
  .action(async (targetPath: string) => {
    console.log(chalk.blue('🎨 Web3 Style Checker'));
    console.log(chalk.gray('====================\n'));

    try {
      const scanner = new Web3Scanner({
        includeGasOptimization: false,
        includeStyleCheck: true,
        strictMode: false
      });

      const targetStat = fs.statSync(targetPath);
      let results;
      
      if (targetStat.isDirectory()) {
        results = await scanner.scanDirectory(targetPath);
      } else {
        const result = await scanner.scanFile(targetPath);
        results = [result];
      }

      // Filter to only show style issues
      results.forEach(result => {
        result.vulnerabilities = [];
        result.gasOptimizations = [];
      });

      const formattedOutput = Web3Scanner.formatResults(results);
      console.log(formattedOutput);

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program.parse();