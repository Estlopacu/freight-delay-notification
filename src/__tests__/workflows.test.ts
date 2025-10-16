import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { freightDelayNotification } from '../workflows/freight-delay-notification';
import type { DeliveryRoute } from '../types/delivery-route';
import { DELAY_THRESHOLD_MINUTES } from '../constants';

describe('freightDelayNotification Workflow', () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  }, 30000);

  afterAll(async () => {
    await testEnv?.teardown();
  }, 10000);

  it('should not send notification when delay is below threshold', async () => {
    const { client, nativeConnection } = testEnv;

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: 'test-below-threshold',
      workflowsPath: require.resolve('../workflows/freight-delay-notification'),
      activities: {
        checkTrafficConditions: async (_route: DeliveryRoute) => ({
          distance: 100000,
          durationWithoutTraffic: 3600,
          durationInTraffic: 5100, // 25 minutes delay (below 30 minute threshold)
          delayInSeconds: 1500,
          delayInMinutes: 25,
          routeSummary: 'Test Route',
        }),
        generateDelayMessage: async () => 'Test message',
        sendEmailNotification: async () => {},
      },
    });

    const result = await worker.runUntil(async () => {
      return await client.workflow.execute(freightDelayNotification, {
        taskQueue: 'test-below-threshold',
        workflowId: `workflow-test-below-threshold-${Date.now()}`,
        args: [{ origin: 'A', destination: 'B', customerEmail: 'test@example.com' }],
      });
    });

    // Should not detect delay since it's below threshold
    if (result.delayDetected !== false) {
      throw new Error(`Expected delayDetected to be false, got ${result.delayDetected}`);
    }
    if (result.notificationSent !== false) {
      throw new Error(`Expected notificationSent to be false, got ${result.notificationSent}`);
    }
    if (result.trafficConditions.delayInMinutes !== 25) {
      throw new Error(`Expected delay of 25 minutes, got ${result.trafficConditions.delayInMinutes}`);
    }
  }, 15000); // 15 second timeout for this test

  it('should detect delay when it exceeds threshold', async () => {
    const { client, nativeConnection } = testEnv;

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: 'test-above-threshold',
      workflowsPath: require.resolve('../workflows/freight-delay-notification'),
      activities: {
        checkTrafficConditions: async (_route: DeliveryRoute) => ({
          distance: 200000,
          durationWithoutTraffic: 7200,
          durationInTraffic: 9600, // 40 minutes delay (exceeds 30 minute threshold)
          delayInSeconds: 2400,
          delayInMinutes: 40,
          routeSummary: 'Delayed Route',
        }),
        generateDelayMessage: async () => 'Test delay message',
        sendEmailNotification: async () => {},
      },
    });

    const result = await worker.runUntil(async () => {
      return await client.workflow.execute(freightDelayNotification, {
        taskQueue: 'test-above-threshold',
        workflowId: `workflow-test-above-threshold-${Date.now()}`,
        args: [{ origin: 'C', destination: 'D', customerEmail: 'test@example.com' }],
      });
    });

    // Should detect delay since it exceeds threshold
    if (result.delayDetected !== true) {
      throw new Error(`Expected delayDetected to be true, got ${result.delayDetected}`);
    }
    if (result.trafficConditions.delayInMinutes !== 40) {
      throw new Error(`Expected delay of 40 minutes, got ${result.trafficConditions.delayInMinutes}`);
    }
  }, 15000); // 15 second timeout for this test

  it('should NOT detect delay when it exactly equals threshold', async () => {
    const { client, nativeConnection } = testEnv;

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: 'test-at-threshold',
      workflowsPath: require.resolve('../workflows/freight-delay-notification'),
      activities: {
        checkTrafficConditions: async (_route: DeliveryRoute) => ({
          distance: 150000,
          durationWithoutTraffic: 5400,
          durationInTraffic: 7200, // 30 minute delay (equals threshold)
          delayInSeconds: 1800,
          delayInMinutes: 30,
          routeSummary: 'Threshold Route',
        }),
        generateDelayMessage: async () => 'Test threshold message',
        sendEmailNotification: async () => {},
      },
    });

    const result = await worker.runUntil(async () => {
      return await client.workflow.execute(freightDelayNotification, {
        taskQueue: 'test-at-threshold',
        workflowId: `workflow-test-at-threshold-${Date.now()}`,
        args: [{ origin: 'E', destination: 'F', customerEmail: 'test@example.com' }],
      });
    });

    // Should NOT detect delay since it only equals threshold (> comparison, not >=)
    if (result.delayDetected !== false) {
      throw new Error(`Expected delayDetected to be false for delay at threshold, got ${result.delayDetected}`);
    }
    if (result.trafficConditions.delayInMinutes !== DELAY_THRESHOLD_MINUTES) {
      throw new Error(
        `Expected delay of ${DELAY_THRESHOLD_MINUTES} minutes, got ${result.trafficConditions.delayInMinutes}`,
      );
    }
  }, 15000);

  it('should handle email notification failure gracefully', async () => {
    const { client, nativeConnection } = testEnv;

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: 'test-email-failure',
      workflowsPath: require.resolve('../workflows/freight-delay-notification'),
      activities: {
        checkTrafficConditions: async (_route: DeliveryRoute) => ({
          distance: 200000,
          durationWithoutTraffic: 7200,
          durationInTraffic: 9600, // 40 minutes delay (exceeds 30 minute threshold)
          delayInSeconds: 2400,
          delayInMinutes: 40,
          routeSummary: 'Delayed Route',
        }),
        generateDelayMessage: async () => 'Test delay message',
        sendEmailNotification: async () => {
          throw new Error('SendGrid API error: Daily sending limit exceeded');
        },
      },
    });

    const result = await worker.runUntil(async () => {
      return await client.workflow.execute(freightDelayNotification, {
        taskQueue: 'test-email-failure',
        workflowId: `workflow-test-email-failure-${Date.now()}`,
        args: [{ origin: 'G', destination: 'H', customerEmail: 'test@example.com' }],
      });
    });

    // Should detect delay
    if (result.delayDetected !== true) {
      throw new Error(`Expected delayDetected to be true, got ${result.delayDetected}`);
    }

    if (!result.notificationMessage) {
      throw new Error('Expected notificationMessage to be present');
    }

    if (result.notificationSent !== false) {
      throw new Error(`Expected notificationSent to be false when email fails, got ${result.notificationSent}`);
    }

    if (!result.notificationError) {
      throw new Error('Expected notificationError to be present when email fails');
    }

    if (result.notificationError.length < 10) {
      throw new Error(`Expected notificationError to contain meaningful error info, got: ${result.notificationError}`);
    }
  }, 30000); // 30 second timeout for this test (includes retries)
});
