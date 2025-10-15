/**
 * Environment Variable Validation Utility
 *
 * Provides functions to validate that required environment variables are set
 * and display helpful error messages if they're missing.
 */

export interface EnvCheckResult {
  allSet: boolean;
  checks: Record<string, boolean>;
  missing: string[];
}

/**
 * Check if required environment variables are set
 */
export function checkEnvironmentVariables(requiredVars: readonly string[]): EnvCheckResult {
  const checks: Record<string, boolean> = {};
  const missing: string[] = [];

  for (const varName of requiredVars) {
    const isSet = !!process.env[varName];
    checks[varName] = isSet;
    if (!isSet) {
      missing.push(varName);
    }
  }

  return {
    allSet: missing.length === 0,
    checks,
    missing,
  };
}

/**
 * Display environment variable check results in a formatted way
 */
export function displayEnvCheckResults(result: EnvCheckResult): void {
  console.log('\n🔧 Environment Check:');
  Object.entries(result.checks).forEach(([key, value]) => {
    console.log(`   ${key}: ${value ? '✅ Set' : '❌ Not set'}`);
  });
}

/**
 * Display error message for missing environment variables
 */
export function displayMissingEnvError(missing: string[], context?: string): void {
  console.error('\n❌ Missing required environment variables.');

  if (context) {
    console.error(`\n📝 For ${context}, please ensure your .env file contains:`);
  } else {
    console.error('\n📝 Please ensure your .env file contains:');
  }

  missing.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
}

/**
 * Validate environment variables and exit if any are missing
 *
 * @param requiredVars Array of required environment variable names
 * @param context Optional context description (e.g., "the worker", "the client")
 * @param showResults Whether to display the check results (default: true)
 * @returns The check result if all variables are set (otherwise exits)
 */
export function validateEnvironment(
  requiredVars: readonly string[],
  context?: string,
  showResults = true,
): EnvCheckResult {
  const result = checkEnvironmentVariables(requiredVars);

  if (showResults) {
    displayEnvCheckResults(result);
  }

  if (!result.allSet) {
    displayMissingEnvError(result.missing, context);
    process.exit(1);
  }

  return result;
}

/**
 * Common environment variable sets for different components
 */
export const ENV_SETS = {
  /** Environment variables required for the workflow system */
  ALL: ['GOOGLE_MAPS_API_KEY', 'SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],

  /** Environment variables for traffic checking */
  TRAFFIC: ['GOOGLE_MAPS_API_KEY'],

  /** Environment variables for email notifications */
  EMAIL: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],

  /** Environment variables for AI message generation (optional) */
  AI: ['ANTHROPIC_API_KEY'],
} as const;
