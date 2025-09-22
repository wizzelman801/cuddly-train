export class Web3StyleChecker {
  public static checkStyle(code: string): string[] {
    const styleIssues: string[] = [];
    const lines = code.split('\n');

    // Check naming conventions
    this.checkNamingConventions(code, styleIssues);
    
    // Check indentation and formatting
    this.checkFormatting(lines, styleIssues);
    
    // Check documentation
    this.checkDocumentation(lines, styleIssues);
    
    // Check best practices
    this.checkBestPractices(code, styleIssues);

    return styleIssues;
  }

  private static checkNamingConventions(code: string, issues: string[]): void {
    // Contract names should be PascalCase
    const contractMatches = code.match(/contract\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
    contractMatches?.forEach(match => {
      const name = match.split(' ')[1];
      if (name && !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
        issues.push(`Contract name '${name}' should be in PascalCase`);
      }
    });

    // Function names should be camelCase
    const functionMatches = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
    functionMatches?.forEach(match => {
      const name = match.split(' ')[1];
      if (name && !/^[a-z][a-zA-Z0-9]*$/.test(name) && !['constructor'].includes(name)) {
        issues.push(`Function name '${name}' should be in camelCase`);
      }
    });

    // Variable names should be camelCase
    const variableMatches = code.match(/(?:uint256|uint|int256|int|bool|address|string|bytes32)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
    variableMatches?.forEach(match => {
      const parts = match.split(/\s+/);
      const name = parts[parts.length - 1];
      if (name && !/^[a-z][a-zA-Z0-9]*$/.test(name)) {
        issues.push(`Variable name '${name}' should be in camelCase`);
      }
    });

    // Constants should be UPPER_CASE
    const constantMatches = code.match(/constant\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
    constantMatches?.forEach(match => {
      const name = match.split(' ')[1];
      if (name && !/^[A-Z][A-Z0-9_]*$/.test(name)) {
        issues.push(`Constant '${name}' should be in UPPER_CASE`);
      }
    });
  }

  private static checkFormatting(lines: string[], issues: string[]): void {
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for trailing whitespace
      if (line.endsWith(' ') || line.endsWith('\t')) {
        issues.push(`Line ${lineNumber}: Trailing whitespace detected`);
      }
      
      // Check for mixed tabs and spaces (basic check)
      if (line.includes('\t') && line.includes('  ')) {
        issues.push(`Line ${lineNumber}: Mixed tabs and spaces detected`);
      }
      
      // Check for long lines (over 120 characters)
      if (line.length > 120) {
        issues.push(`Line ${lineNumber}: Line too long (${line.length} characters, max 120)`);
      }
      
      // Check for proper spacing around operators
      if (/[^\s=!<>]=(?!=)|=(?!=)[^\s=]/.test(line)) {
        issues.push(`Line ${lineNumber}: Missing spaces around assignment operator`);
      }
    });
  }

  private static checkDocumentation(lines: string[], issues: string[]): void {
    let inContract = false;
    let contractName = '';
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const lineNumber = index + 1;
      
      // Check for contract documentation
      if (trimmedLine.match(/^contract\s+/)) {
        inContract = true;
        contractName = trimmedLine.split(' ')[1];
        
        // Check if previous lines contain documentation
        const prevLines = lines.slice(Math.max(0, index - 5), index);
        const hasDocumentation = prevLines.some(prevLine => 
          prevLine.trim().startsWith('//') || 
          prevLine.trim().startsWith('/*') || 
          prevLine.trim().startsWith('*')
        );
        
        if (!hasDocumentation) {
          issues.push(`Line ${lineNumber}: Contract '${contractName}' lacks documentation`);
        }
      }
      
      // Check for function documentation
      if (trimmedLine.match(/^function\s+/) && !trimmedLine.includes('private')) {
        const prevLines = lines.slice(Math.max(0, index - 3), index);
        const hasDocumentation = prevLines.some(prevLine => 
          prevLine.trim().startsWith('//') || 
          prevLine.trim().startsWith('/*') || 
          prevLine.trim().startsWith('*') ||
          prevLine.trim().startsWith('///')
        );
        
        if (!hasDocumentation) {
          const functionName = trimmedLine.split('(')[0].split(' ')[1];
          issues.push(`Line ${lineNumber}: Public function '${functionName}' lacks documentation`);
        }
      }
    });
  }

  private static checkBestPractices(code: string, issues: string[]): void {
    // Check for proper visibility modifiers
    const functionMatches = code.match(/function\s+[^(]+\([^)]*\)[^{]*\{/g);
    functionMatches?.forEach(match => {
      if (!/(public|private|internal|external)/.test(match)) {
        const functionName = match.match(/function\s+([^(]+)/)?.[1];
        issues.push(`Function '${functionName}' missing visibility modifier`);
      }
    });

    // Check for proper use of view/pure modifiers
    const viewPurePattern = /function\s+[^(]+\([^)]*\)\s*(?:public|private|internal|external)\s*(?!.*(?:view|pure))/g;
    const potentialViewFunctions = code.match(viewPurePattern);
    potentialViewFunctions?.forEach(match => {
      const functionName = match.match(/function\s+([^(]+)/)?.[1];
      if (functionName && !match.includes('payable')) {
        issues.push(`Function '${functionName}' might benefit from 'view' or 'pure' modifier`);
      }
    });

    // Check for hardcoded addresses
    const addressPattern = /0x[a-fA-F0-9]{40}/g;
    const addresses = code.match(addressPattern);
    if (addresses && addresses.length > 0) {
      issues.push('Hardcoded addresses detected - consider using configuration or constants');
    }

    // Check for magic numbers
    const magicNumberPattern = /(?<!0x)[0-9]{3,}(?![a-fA-F0-9])/g;
    const magicNumbers = code.match(magicNumberPattern);
    if (magicNumbers && magicNumbers.length > 0) {
      issues.push('Magic numbers detected - consider using named constants');
    }

    // Check for proper error handling
    if (code.includes('.call(') && !code.includes('require(')) {
      issues.push('External calls should include proper error handling with require()');
    }
  }
}