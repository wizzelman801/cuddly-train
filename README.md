# cuddly-train
Web3 Bug Scanner and Style Debugger

A comprehensive tool for scanning Web3/Solidity smart contracts for security vulnerabilities, gas optimization opportunities, and style issues.

## Features

🔍 **Vulnerability Detection**
- Reentrancy vulnerabilities
- Integer overflow/underflow issues
- Unchecked external calls
- tx.origin usage (authorization bypass)
- Timestamp dependence
- Deprecated function usage

⛽ **Gas Optimization Analysis**
- Inefficient loop patterns
- Unnecessary state variable visibility
- Suboptimal data type usage
- Gas wasteful initialization patterns

🎨 **Code Style Checking**
- Naming convention enforcement (PascalCase contracts, camelCase functions/variables)
- Formatting and indentation analysis
- Documentation requirements
- Best practices validation

## Installation

```bash
npm install
npm run build
```

## Usage

### Scan for All Issues
```bash
npm run dev scan <file-or-directory>
npm run dev scan example.sol
npm run dev scan ./contracts/
```

### Style Check Only
```bash
npm run dev check-style <file-or-directory>
```

### Options
- `--no-gas`: Disable gas optimization analysis
- `--no-style`: Disable style checking
- `--strict`: Enable strict mode for more thorough checking
- `-o, --output <file>`: Save results to file

### Demo
See the tool in action with sample vulnerable code:
```bash
npm run dev demo
```

## Example Output

```
🔍 Web3 Bug Scanner & Style Debugger
=====================================

📁 File: example.sol
==================================================

🚨 VULNERABILITIES:
🔴 [CRITICAL] Potential Reentrancy Vulnerability
   External calls without proper checks may lead to reentrancy attacks
   Location: Line 28, Column 20
   💡 Use checks-effects-interactions pattern or reentrancy guards

🟡 [MEDIUM] Timestamp Dependence
   Reliance on block.timestamp for critical logic
   Location: Line 42, Column 39
   💡 Avoid using block.timestamp for critical logic or randomness

⛽ GAS OPTIMIZATIONS:
   • Cache array length in loops to save gas
   • Consider making state variables private if not accessed externally

🎨 STYLE ISSUES:
   • Function 'withdraw' lacks documentation
   • Contract name should be in PascalCase

📊 SUMMARY:
Files scanned: 1
Vulnerabilities found: 2
Gas optimizations: 2
Style issues: 2
```

## Supported File Types

- `.sol` - Solidity smart contracts
- `.js` - JavaScript files with Web3 code
- `.ts` - TypeScript files with Web3 code

## Security Checks

The scanner detects common Web3 vulnerabilities including:

1. **Reentrancy Attacks**: Identifies external calls that could lead to reentrancy
2. **Integer Overflow/Underflow**: Flags arithmetic operations without SafeMath
3. **Unchecked Calls**: External calls without return value verification
4. **Authorization Issues**: Use of tx.origin instead of msg.sender
5. **Timestamp Manipulation**: Dependence on block.timestamp for critical logic
6. **Deprecated Functions**: Usage of deprecated Solidity functions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
