# Workflows Directory

This directory contains the modular workflow implementation for the freight delay notification system.

## Structure

The workflow is broken down into 4 distinct steps, each in its own file:

```
workflows/
├── index.ts                    # Main workflow orchestration
├── step1-check-traffic.ts      # Step 1: Check traffic conditions
├── step2-evaluate-delay.ts     # Step 2: Evaluate delay threshold
├── step3-generate-message.ts   # Step 3: Generate notification message
├── step4-send-notification.ts  # Step 4: Send email notification
└── README.md                   # This file
```

## Workflow Steps

### Step 1: Check Traffic Conditions
**File:** [step1-check-traffic.ts](step1-check-traffic.ts)

Queries the Google Maps Directions API to get real-time traffic information for the delivery route.

**Returns:** `TrafficConditions` with distance, duration, and delay information

---

### Step 2: Evaluate Delay Threshold
**File:** [step2-evaluate-delay.ts](step2-evaluate-delay.ts)

Determines whether the traffic delay exceeds the configured threshold (from `constants.ts`).

**Returns:** `DelayEvaluation` indicating if notification should be sent

---

### Step 3: Generate Notification Message
**File:** [step3-generate-message.ts](step3-generate-message.ts)

Generates a customer-friendly notification message about the delay using AI or a fallback template.

**Returns:** `string` containing the notification message

---

### Step 4: Send Email Notification
**File:** [step4-send-notification.ts](step4-send-notification.ts)

Sends the notification message to the customer via email using SendGrid. Includes retry logic and error handling.

**Returns:** `NotificationResult` with success status and optional error

---

## Main Workflow Orchestration

**File:** [index.ts](index.ts)

The main workflow file that orchestrates all four steps in sequence. It:

1. Executes steps 1-4 in order
2. Short-circuits if delay doesn't exceed threshold (no notification sent)
3. Handles errors gracefully
4. Returns a complete `FreightDelayWorkflowResult`

## Benefits of This Structure

✅ **Modularity**: Each step is isolated and easy to understand
✅ **Testability**: Steps can be tested independently
✅ **Maintainability**: Easy to modify individual steps without affecting others
✅ **Clarity**: Clear separation of concerns and workflow logic
✅ **Reusability**: Steps can be reused in other workflows if needed

## Usage

Import the workflow in your worker:

```typescript
import { Worker } from '@temporalio/worker';

const worker = await Worker.create({
  workflowsPath: require.resolve('./workflows'),
  // ... other options
});
```

Import in your client:

```typescript
import { freightDelayNotification } from './workflows';

const result = await client.workflow.execute(freightDelayNotification, {
  args: [route],
  // ... other options
});
```
