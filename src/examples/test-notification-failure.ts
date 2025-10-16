import { config } from 'dotenv';
import type { TrafficConditions } from '../types/traffic-conditions';
import type { DeliveryRoute } from '../types/delivery-route';
import type { FreightDelayWorkflowResult } from '../types/workflow';
import { generateFallbackMessage } from '../utils/fallback-message';
import { DELAY_THRESHOLD_MINUTES, METERS_TO_KILOMETERS, SECONDS_TO_MINUTES } from '../constants';

config();

// Simulate notification sending (this will fail due to rate limit)
async function simulateSendNotification(to: string, _message: string): Promise<void> {
  console.log(`\n📧 Attempting to send email to ${to}...`);

  // Simulate retry attempts
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`   Attempt ${attempt}/${maxAttempts}...`);
    await new Promise((resolve) => setTimeout(resolve, attempt * 500)); // Simulate network delay

    // This would actually call SendGrid - simulating failure
    if (attempt < maxAttempts) {
      console.log(`   ❌ Failed: Rate limit exceeded (retry in ${attempt * 2}s)`);
    } else {
      console.log(`   ❌ Failed: Rate limit exceeded (max attempts reached)`);
      throw new Error('SendGrid API error: Daily email limit exceeded');
    }
  }
}

// Main workflow simulation
async function runNotificationFailureDemo() {
  console.log('='.repeat(70));
  console.log('📧 NOTIFICATION FAILURE HANDLING DEMO');
  console.log('='.repeat(70));

  // Simulated traffic conditions (delay detected)
  const route: DeliveryRoute = {
    origin: 'New York, NY',
    destination: 'Boston, MA',
    customerEmail: 'john.smith@example.com',
    customerName: 'John Smith',
  };

  const trafficConditions: TrafficConditions = {
    distance: 347540, // ~347 km
    durationWithoutTraffic: 13260, // ~221 minutes
    durationInTraffic: 14280, // ~238 minutes
    delayInSeconds: 1020, // 17 minutes
    delayInMinutes: 17,
    routeSummary: `${route.origin} to ${route.destination} via I-95 N`,
  };

  console.log('\n📍 Delivery Route:');
  console.log(`   From: ${route.origin}`);
  console.log(`   To: ${route.destination}`);
  console.log(`   Customer: ${route.customerName}`);
  console.log(`   Email: ${route.customerEmail}`);

  console.log('\n🚦 Traffic Conditions (Simulated):');
  console.log(`   Distance: ${(trafficConditions.distance / METERS_TO_KILOMETERS).toFixed(1)} km`);
  console.log(`   Normal duration: ${Math.round(trafficConditions.durationWithoutTraffic / SECONDS_TO_MINUTES)} minutes`);
  console.log(`   With traffic: ${Math.round(trafficConditions.durationInTraffic / SECONDS_TO_MINUTES)} minutes`);
  console.log(`   ⚠️  Delay detected: ${trafficConditions.delayInMinutes} minutes`);

  console.log(`\n⏱️  Delay threshold: ${DELAY_THRESHOLD_MINUTES} minutes`);
  console.log(`   Delay exceeds threshold: ✅ YES`);

  // Generate notification message using the actual fallback message generator
  console.log('\n🤖 Generating personalized notification message...');
  const notificationMessage = generateFallbackMessage({
    route,
    trafficConditions,
    customerName: route.customerName,
  });
  console.log(`   Message generated successfully`);

  // Try to send notification with fallback handling
  let notificationSent = false;
  let notificationError: string | undefined;

  console.log('\n📨 Attempting to send notification...');

  try {
    await simulateSendNotification(route.customerEmail, notificationMessage);
    notificationSent = true;
    console.log('\n   ✅ Email sent successfully!');
  } catch (error) {
    notificationError = error instanceof Error ? error.message : 'Unknown error';
    console.log(`\n   ❌ Email sending failed after 3 attempts`);
    console.log(`   Error: ${notificationError}`);
    console.log('\n   ℹ️  FALLBACK ACTIVATED:');
    console.log('   - Workflow will complete successfully');
    console.log('   - Notification message is preserved');
    console.log('   - Error is captured for monitoring');
    console.log('   - Manual follow-up can be triggered');
  }

  // Workflow result
  const result: FreightDelayWorkflowResult = {
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

Even though email failed, the workflow completed successfully because:

1. ✅ Delay was detected (${trafficConditions.delayInMinutes} minutes)
2. ✅ Notification message was generated
3. ✅ Message is preserved in the result
4. ✅ Error details are captured
5. ✅ System can now:
   - Try alternative notification methods (SMS, push notification)
   - Create a support ticket for manual follow-up
   - Log to monitoring system for alerting
   - Retry later when email limit resets
   - Store in database for audit trail

🎯 The customer delay information is NEVER lost, even when email fails!
  `);

  console.log('='.repeat(70));
  console.log('✅ Demo completed successfully!');
  console.log('='.repeat(70));
}

// Run the demo
runNotificationFailureDemo().catch((error) => {
  console.error('Demo failed:', error);
  process.exit(1);
});
