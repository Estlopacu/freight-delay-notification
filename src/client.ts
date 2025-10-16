import { Connection, Client } from '@temporalio/client';
import { freightDelayNotification } from './workflows/freight-delay-notification';
import 'dotenv/config';
import { nanoid } from 'nanoid';
import type { DeliveryRoute } from './types/delivery-route';
import { DELAY_THRESHOLD_MINUTES } from './constants';
import { ENV_SETS, validateEnvironment } from './utils/env-validation';

async function run() {
  console.log('='.repeat(80));
  console.log('🚚 FREIGHT DELAY NOTIFICATION SYSTEM');

  // Validate environment variables
  validateEnvironment(ENV_SETS.ALL, 'the client');

  // Connect to the Temporal Server
  console.log('\n⚙️  Connecting to Temporal server at localhost:7233...');
  let connection;
  try {
    connection = await Connection.connect({
      address: 'localhost:7233',
    });
    console.log('✅ Connected to Temporal server');
  } catch (error) {
    console.error('\n❌ Failed to connect to Temporal server');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    }
    console.error('\n💡 Make sure the Temporal server is running:');
    process.exit(1);
  }

  // Create Temporal client
  let client;
  try {
    client = new Client({
      connection,
    });
  } catch (error) {
    console.error('\n❌ Failed to create Temporal client');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }

  const route: DeliveryRoute = {
    origin: 'Berlin, Germany',
    destination: 'Madrid, Spain',
    customerName: 'Esteban',
    customerEmail: 'estlopacu@gmail.com', // <-- Replace with your email
  };

  console.log('Starting freight delay notification workflow...');
  console.log(`Route: ${route.origin} -> ${route.destination}`);
  console.log(`Delay threshold: ${DELAY_THRESHOLD_MINUTES} minutes\n`);

  const handle = await client.workflow.start(freightDelayNotification, {
    taskQueue: 'freight-delay-notification',
    args: [route],
    workflowId: 'freight-delay-' + nanoid(),
  });

  const result = await handle.result();

  console.log('\n=== Traffic Conditions ===');
  console.log(`Route: ${result.trafficConditions.routeSummary}`);
  console.log(`Distance: ${(result.trafficConditions.distance / 1000).toFixed(2)} km`);
  console.log(`Normal duration: ${Math.round(result.trafficConditions.durationWithoutTraffic / 60)} minutes`);
  console.log(
    `Current duration (with traffic): ${Math.round(result.trafficConditions.durationInTraffic / 60)} minutes`,
  );
  console.log(`Delay: ${result.trafficConditions.delayInMinutes} minutes`);

  console.log('\n=== Notification Decision ===');
  if (result.delayDetected) {
    console.log(
      `⚠️  DELAY DETECTED: ${result.trafficConditions.delayInMinutes} minutes exceeds threshold of ${DELAY_THRESHOLD_MINUTES} minutes`,
    );

    if (result.notificationMessage) {
      console.log('\n=== Notification Message ===');
      console.log(result.notificationMessage);
      if (result.notificationSent) {
        console.log(`\n✅ Email notification sent to ${route.customerEmail}`);
      } else {
        console.log('\n❌ Email notification was not sent.');
        if (result.notificationError) {
          console.log(`   Error: ${result.notificationError}`);
        }
      }
    }
  } else {
    console.log(
      `✅ No significant delay: ${result.trafficConditions.delayInMinutes} minutes is below threshold of ${DELAY_THRESHOLD_MINUTES} minutes`,
    );
    console.log('No notification needed');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
