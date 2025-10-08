/**
 * Configuration validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SystemRequirements {
  nodeVersion: string;
  dockerInstalled: boolean;
  dockerComposeInstalled: boolean;
  cursorCliInstalled: boolean;
  jqInstalled: boolean;
  requiredPorts: number[];
}

/**
 * Validate Node.js version
 */
export function validateNodeVersion(requiredVersion: string = '18.0.0'): ValidationResult {
  const currentVersion = process.version;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract major version number
  const currentMajor = parseInt(currentVersion.slice(1).split('.')[0]);
  const requiredMajor = parseInt(requiredVersion.split('.')[0]);

  if (currentMajor < requiredMajor) {
    errors.push(`Node.js version ${requiredVersion} or higher is required. Current: ${currentVersion}`);
  } else if (currentMajor > requiredMajor + 2) {
    warnings.push(`Node.js version ${currentVersion} is newer than recommended. Consider using ${requiredVersion}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if Docker is installed and running
 */
export async function validateDocker(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const { execSync } = await import('child_process');
    
    // Check if Docker is installed
    try {
      execSync('docker --version', { stdio: 'pipe' });
    } catch (error) {
      errors.push('Docker is not installed or not in PATH');
      return { isValid: false, errors, warnings };
    }

    // Check if Docker is running
    try {
      execSync('docker ps', { stdio: 'pipe' });
    } catch (error) {
      errors.push('Docker is not running. Please start Docker Desktop');
      return { isValid: false, errors, warnings };
    }

    // Check Docker Compose
    try {
      execSync('docker-compose --version', { stdio: 'pipe' });
    } catch (error) {
      warnings.push('Docker Compose not found. Make sure it\'s installed');
    }

  } catch (error) {
    errors.push(`Failed to validate Docker: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if Cursor CLI is installed
 */
export async function validateCursorCli(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const { execSync } = await import('child_process');
    
    try {
      execSync('cursor-agent --version', { stdio: 'pipe' });
    } catch (error) {
      errors.push('Cursor CLI is not installed or not in PATH. Please install Cursor CLI');
      return { isValid: false, errors, warnings };
    }

  } catch (error) {
    errors.push(`Failed to validate Cursor CLI: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if jq is installed
 */
export async function validateJq(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const { execSync } = await import('child_process');
    
    try {
      execSync('jq --version', { stdio: 'pipe' });
    } catch (error) {
      errors.push('jq is not installed. Please install jq for JSON processing');
      return { isValid: false, errors, warnings };
    }

  } catch (error) {
    errors.push(`Failed to validate jq: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if required ports are available
 */
export async function validatePorts(ports: number[] = [5678, 5432]): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const net = await import('net');
    
    for (const port of ports) {
      const isAvailable = await new Promise<boolean>((resolve) => {
        const server = net.createServer();
        
        server.listen(port, () => {
          server.close(() => resolve(true));
        });
        
        server.on('error', () => resolve(false));
      });

      if (!isAvailable) {
        errors.push(`Port ${port} is already in use`);
      }
    }

  } catch (error) {
    errors.push(`Failed to validate ports: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required environment variables
  const requiredVars = ['N8N_PASSWORD', 'DB_PASSWORD', 'CURSOR_API_KEY'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      warnings.push(`Environment variable ${varName} is not set. Using default values`);
    }
  }

  // Check for .env file
  try {
    const fs = require('fs');
    if (!fs.existsSync('.env')) {
      warnings.push('.env file not found. Copy .env.example to .env and update values');
    }
  } catch (error) {
    warnings.push('Could not check for .env file');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Comprehensive system validation
 */
export async function validateSystem(): Promise<ValidationResult> {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate Node.js version
  const nodeResult = validateNodeVersion();
  allErrors.push(...nodeResult.errors);
  allWarnings.push(...nodeResult.warnings);

  // Validate Docker
  const dockerResult = await validateDocker();
  allErrors.push(...dockerResult.errors);
  allWarnings.push(...dockerResult.warnings);

  // Validate Cursor CLI
  const cursorResult = await validateCursorCli();
  allErrors.push(...cursorResult.errors);
  allWarnings.push(...cursorResult.warnings);

  // Validate jq
  const jqResult = await validateJq();
  allErrors.push(...jqResult.errors);
  allWarnings.push(...jqResult.warnings);

  // Validate ports
  const portsResult = await validatePorts();
  allErrors.push(...portsResult.errors);
  allWarnings.push(...portsResult.warnings);

  // Validate environment
  const envResult = validateEnvironment();
  allErrors.push(...envResult.errors);
  allWarnings.push(...envResult.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Generate setup verification report
 */
export async function generateSetupReport(): Promise<string> {
  const result = await validateSystem();
  
  let report = '🔍 Agent Flow Setup Verification Report\n';
  report += '=====================================\n\n';

  if (result.isValid) {
    report += '✅ All checks passed! System is ready to use.\n\n';
  } else {
    report += '❌ Some issues found that need to be resolved:\n\n';
  }

  if (result.errors.length > 0) {
    report += '🚨 Errors (must be fixed):\n';
    result.errors.forEach(error => {
      report += `  • ${error}\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += '⚠️  Warnings (recommended to fix):\n';
    result.warnings.forEach(warning => {
      report += `  • ${warning}\n`;
    });
    report += '\n';
  }

  report += '📋 Next Steps:\n';
  if (result.isValid) {
    report += '  1. Run "task setup" to initialize the system\n';
    report += '  2. Run "task up" to start services\n';
    report += '  3. Run "task ui" to access N8N interface\n';
  } else {
    report += '  1. Fix the errors listed above\n';
    report += '  2. Run this verification again\n';
    report += '  3. Once all checks pass, run "task setup"\n';
  }

  return report;
}
