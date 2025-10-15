import { NativeConnection, Worker } from '@temporalio/worker';
import * as trafficConditions from './traffic-conditions';
import * as messageActivities from './message';
import * as notificationActivities from './notifications';
import 'dotenv/config';
import { validateEnvironment, ENV_SETS } from './utils';

async function run() {
  // Validate environment variables
  validateEnvironment(ENV_SETS.ALL, 'the worker');

  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    const worker = await Worker.create({
      connection,
      taskQueue: 'freight-delay-notification',
      workflowsPath: require.resolve('./workflows/index'),
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
