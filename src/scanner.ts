import fs from 'fs';
import path from 'path';
import { Web3VulnerabilityDetector } from './vulnerability-detector.js';
import { Web3StyleChecker } from './style-checker.js';
import { ScanResult, ScannerOptions } from './types.js';

export class Web3Scanner {
  private options: ScannerOptions;

  constructor(options: ScannerOptions = {}) {
    this.options = {
      includeGasOptimization: true,
      includeStyleCheck: true,
      strictMode: false,
      ...options
    };
  }

  public async scanFile(filePath: string): Promise<ScanResult> {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      return this.scanCode(code, filePath);
    } catch (error) {
      throw new Error(`Failed to scan file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public scanCode(code: string, fileName: string = 'inline'): ScanResult {
    const result: ScanResult = {
      file: fileName,
      vulnerabilities: [],
      gasOptimizations: [],
      styleIssues: []
    };

    // Scan for vulnerabilities
    result.vulnerabilities = Web3VulnerabilityDetector.scanCode(code);

    // Scan for gas optimizations if enabled
    if (this.options.includeGasOptimization) {
      result.gasOptimizations = Web3VulnerabilityDetector.scanGasOptimizations(code);
    }

    // Check style if enabled
    if (this.options.includeStyleCheck) {
      result.styleIssues = Web3StyleChecker.checkStyle(code);
    }

    return result;
  }

  public async scanDirectory(dirPath: string): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const supportedExtensions = ['.sol', '.js', '.ts'];

    const scanRecursively = async (currentPath: string) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other build directories
          if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
            await scanRecursively(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath);
          if (supportedExtensions.includes(ext)) {
            try {
              const result = await this.scanFile(fullPath);
              results.push(result);
            } catch (error) {
              console.error(`Error scanning ${fullPath}:`, error);
            }
          }
        }
      }
    };

    await scanRecursively(dirPath);
    return results;
  }

  public static formatResults(results: ScanResult[]): string {
    let output = '';
    let totalVulnerabilities = 0;
    let totalGasOptimizations = 0;
    let totalStyleIssues = 0;

    for (const result of results) {
      output += `\n📁 File: ${result.file}\n`;
      output += '='.repeat(50) + '\n';

      // Vulnerabilities
      if (result.vulnerabilities.length > 0) {
        output += '\n🚨 VULNERABILITIES:\n';
        for (const vuln of result.vulnerabilities) {
          const severityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🔵',
            info: 'ℹ️'
          }[vuln.severity];
          
          output += `${severityEmoji} [${vuln.severity.toUpperCase()}] ${vuln.title}\n`;
          output += `   ${vuln.description}\n`;
          if (vuln.line) {
            output += `   Location: Line ${vuln.line}${vuln.column ? `, Column ${vuln.column}` : ''}\n`;
          }
          output += `   💡 ${vuln.recommendation}\n\n`;
        }
        totalVulnerabilities += result.vulnerabilities.length;
      }

      // Gas Optimizations
      if (result.gasOptimizations.length > 0) {
        output += '⛽ GAS OPTIMIZATIONS:\n';
        for (const optimization of result.gasOptimizations) {
          output += `   • ${optimization}\n`;
        }
        output += '\n';
        totalGasOptimizations += result.gasOptimizations.length;
      }

      // Style Issues
      if (result.styleIssues.length > 0) {
        output += '🎨 STYLE ISSUES:\n';
        for (const issue of result.styleIssues) {
          output += `   • ${issue}\n`;
        }
        output += '\n';
        totalStyleIssues += result.styleIssues.length;
      }

      if (result.vulnerabilities.length === 0 && 
          result.gasOptimizations.length === 0 && 
          result.styleIssues.length === 0) {
        output += '✅ No issues found!\n\n';
      }
    }

    // Summary
    output += '\n📊 SUMMARY:\n';
    output += '='.repeat(30) + '\n';
    output += `Files scanned: ${results.length}\n`;
    output += `Vulnerabilities found: ${totalVulnerabilities}\n`;
    output += `Gas optimizations: ${totalGasOptimizations}\n`;
    output += `Style issues: ${totalStyleIssues}\n`;
    
    const criticalVulns = results.reduce((count, r) => 
      count + r.vulnerabilities.filter(v => v.severity === 'critical').length, 0);
    const highVulns = results.reduce((count, r) => 
      count + r.vulnerabilities.filter(v => v.severity === 'high').length, 0);
    
    if (criticalVulns > 0 || highVulns > 0) {
      output += `\n⚠️  CRITICAL ACTION REQUIRED: ${criticalVulns} critical and ${highVulns} high severity vulnerabilities found!\n`;
    }

    return output;
  }
}