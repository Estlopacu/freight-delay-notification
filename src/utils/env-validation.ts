interface EnvCheckResult {
  allSet: boolean;
  checks: Record<string, boolean>;
  missing: string[];
}

function checkEnvironmentVariables(requiredVars: readonly string[]): EnvCheckResult {
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

function displayEnvCheckResults(result: EnvCheckResult): void {
  console.log('\n🔧 Environment Check:');
  Object.entries(result.checks).forEach(([key, value]) => {
    console.log(`   ${key}: ${value ? '✅ Set' : '❌ Not set'}`);
  });
}

function displayMissingEnvError(missing: string[], context?: string): void {
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

export const ENV_SETS = {
  ALL: ['GOOGLE_MAPS_API_KEY', 'SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
  TRAFFIC: ['GOOGLE_MAPS_API_KEY'],
  EMAIL: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
  AI: ['ANTHROPIC_API_KEY'],
} as const;
