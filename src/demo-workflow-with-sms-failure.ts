/**
 * Demo: Freight Delay Notification Workflow with SMS Failure
 *
 * This demonstrates how the workflow handles SMS failures gracefully.
 * Even when SMS fails (due to rate limits, config issues, etc.),
 * the workflow completes successfully and captures all important data.
 */

import { config } from 'dotenv';

// Load environment variables
config();

// Simulate the workflow components
interface TrafficConditions {
  distance: number;
  durationWithoutTraffic: number;
  durationInTraffic: number;
  delayInSeconds: number;
  delayInMinutes: number;
  routeSummary: string;
}

interface DeliveryRoute {
  origin: string;
  destination: string;
  customerPhoneNumber: string;
  customerName?: string;
}

interface WorkflowResult {
  delayDetected: boolean;
  trafficConditions: TrafficConditions;
  notificationSent: boolean;
  notificationMessage?: string;
  notificationError?: string;
}

// Simulate checking traffic (this would normally call Google Maps API)
function simulateCheckTraffic(route: DeliveryRoute): TrafficConditions {
  return {
    distance: 347540, // ~347 km
    durationWithoutTraffic: 13260, // ~221 minutes
    durationInTraffic: 14280, // ~238 minutes
    delayInSeconds: 1020, // 17 minutes
    delayInMinutes: 17,
    routeSummary: `${route.origin} to ${route.destination} via I-95 N`,
  };
}

// Simulate AI message generation (this would normally call Claude API)
function simulateGenerateMessage(route: DeliveryRoute, traffic: TrafficConditions): string {
  const customerName = route.customerName || 'Customer';
  return `Hi ${customerName}! Your delivery from ${route.origin} to ${route.destination} is experiencing a ${traffic.delayInMinutes}-minute delay due to heavy traffic on ${traffic.routeSummary}. We're doing our best to get your package to you as soon as possible. Thank you for your patience!`;
}

// Simulate SMS sending (this will fail due to rate limit)
async function simulateSendSms(to: string, message: string): Promise<void> {
  console.log(`\n📱 Attempting to send SMS to ${to}...`);

  // Simulate retry attempts
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`   Attempt ${attempt}/${maxAttempts}...`);
    await new Promise(resolve => setTimeout(resolve, attempt * 500)); // Simulate network delay

    // This would actually call Twilio - simulating failure
    if (attempt < maxAttempts) {
      console.log(`   ❌ Failed: Rate limit exceeded (retry in ${attempt * 2}s)`);
    } else {
      console.log(`   ❌ Failed: Rate limit exceeded (max attempts reached)`);
      throw new Error('Twilio API error: Account exceeded the 9 daily messages limit');
    }
  }
}

// Main workflow simulation
async function runWorkflowDemo() {
  console.log('='.repeat(70));
  console.log('🚚 FREIGHT DELAY NOTIFICATION WORKFLOW DEMO');
  console.log('='.repeat(70));

  // Step 1: Define the route
  const route: DeliveryRoute = {
    origin: 'New York, NY',
    destination: 'Boston, MA',
    customerPhoneNumber: '+491772430239',
    customerName: 'John Smith',
  };

  console.log('\n📍 Delivery Route:');
  console.log(`   From: ${route.origin}`);
  console.log(`   To: ${route.destination}`);
  console.log(`   Customer: ${route.customerName}`);
  console.log(`   Phone: ${route.customerPhoneNumber}`);

  // Step 2: Check traffic conditions
  console.log('\n🚦 Checking traffic conditions...');
  const trafficConditions = simulateCheckTraffic(route);
  console.log(`   Distance: ${(trafficConditions.distance / 1000).toFixed(1)} km`);
  console.log(`   Normal duration: ${Math.round(trafficConditions.durationWithoutTraffic / 60)} minutes`);
  console.log(`   With traffic: ${Math.round(trafficConditions.durationInTraffic / 60)} minutes`);
  console.log(`   ⚠️  Delay detected: ${trafficConditions.delayInMinutes} minutes`);

  // Step 3: Check if delay exceeds threshold
  const DELAY_THRESHOLD = 5;
  const delayExceedsThreshold = trafficConditions.delayInMinutes >= DELAY_THRESHOLD;

  console.log(`\n⏱️  Delay threshold: ${DELAY_THRESHOLD} minutes`);
  console.log(`   Delay exceeds threshold: ${delayExceedsThreshold ? '✅ YES' : '❌ NO'}`);

  if (!delayExceedsThreshold) {
    console.log('\n✅ No notification needed - delay is acceptable');
    return;
  }

  // Step 4: Generate notification message
  console.log('\n🤖 Generating personalized notification message...');
  const notificationMessage = simulateGenerateMessage(route, trafficConditions);
  console.log(`   Message: "${notificationMessage}"`);

  // Step 5: Try to send SMS with fallback handling
  let notificationSent = false;
  let notificationError: string | undefined;

  console.log('\n📨 Attempting to send SMS notification...');

  try {
    await simulateSendSms(route.customerPhoneNumber, notificationMessage);
    notificationSent = true;
    console.log('\n   ✅ SMS sent successfully!');
  } catch (error) {
    notificationError = error instanceof Error ? error.message : 'Unknown error';
    console.log(`\n   ❌ SMS sending failed after ${3} attempts`);
    console.log(`   Error: ${notificationError}`);
    console.log('\n   ℹ️  FALLBACK ACTIVATED:');
    console.log('   - Workflow will complete successfully');
    console.log('   - Notification message is preserved');
    console.log('   - Error is captured for monitoring');
    console.log('   - Manual follow-up can be triggered');
  }

  // Step 6: Return workflow result
  const result: WorkflowResult = {
    delayDetected: true,
    trafficConditions,
    notificationSent,
    notificationMessage,
    notificationError,
  };

  console.log('\n' + '='.repeat(70));
  console.log('📊 WORKFLOW RESULT');
  console.log('='.repeat(70));
  console.log(JSON.stringify(result, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log('💡 WHAT HAPPENS NEXT');
  console.log('='.repeat(70));
  console.log(`
✅ Workflow Status: COMPLETED SUCCESSFULLY

Even though SMS failed, the workflow completed successfully because:

1. ✅ Delay was detected (${trafficConditions.delayInMinutes} minutes)
2. ✅ Notification message was generated
3. ✅ Message is preserved in the result
4. ✅ Error details are captured
5. ✅ System can now:
   - Send the message via email (fallback)
   - Create a support ticket for manual follow-up
   - Log to monitoring system for alerting
   - Retry later when Twilio limit resets
   - Store in database for audit trail

🎯 The customer delay information is NEVER lost, even when SMS fails!
  `);

  console.log('='.repeat(70));
  console.log('✅ Demo completed successfully!');
  console.log('='.repeat(70));
}

// Run the demo
runWorkflowDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});
