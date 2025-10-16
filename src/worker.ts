import { NativeConnection, Worker } from '@temporalio/worker';
import * as trafficConditions from './activities/check-traffic-conditions';
import * as messageActivities from './activities/generate-delay-message';
import * as notificationActivities from './activities/send-email-notification';
import 'dotenv/config';
import { ENV_SETS, validateEnvironment } from './utils/env-validation';

async function run() {
  validateEnvironment(ENV_SETS.ALL, 'the worker');

  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    const worker = await Worker.create({
      connection,
      taskQueue: 'freight-delay-notification',
      workflowsPath: require.resolve('./workflows/freight-delay-notification'),
      activities: {
        ...trafficConditions,
        ...messageActivities,
        ...notificationActivities,
      },
    });

    await worker.run();
  } finally {
    await connection.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
