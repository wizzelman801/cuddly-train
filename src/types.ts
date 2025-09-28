export interface VulnerabilityReport {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  line?: number;
  column?: number;
  recommendation: string;
}

export interface ScanResult {
  file: string;
  vulnerabilities: VulnerabilityReport[];
  gasOptimizations: string[];
  styleIssues: string[];
}

export interface ScannerOptions {
  includeGasOptimization?: boolean;
  includeStyleCheck?: boolean;
  strictMode?: boolean;
}