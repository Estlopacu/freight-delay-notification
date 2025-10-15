# Freight Delay Notification Application

## Objective

Create an app (in TypeScript) to monitor traffic delays on a freight delivery route and notify a customer if a significant delay occurs. This application demonstrates the ability to work with APIs, handle data transformations, and build a multi-step workflow using Temporal and their TypeScript SDK.

## Scenario

Build a notification system for delayed freight deliveries using Temporal workflows that:

1. **Checks traffic conditions** on a delivery route
2. **Calculates potential delays** based on traffic data
3. **Generates a customized message** using an AI API if a delay exceeds a specified threshold
4. **Sends a notification** to a customer about the delay

## Technology Stack

- **TypeScript**: Primary programming language
- **Temporal**: Workflow orchestration framework
- **Temporal TypeScript SDK**: For building workflows and activities

## Architecture

The application will use Temporal's workflow and activity pattern:

- **Workflow**: Orchestrates the entire delay notification process
- **Activities**: Individual tasks that interact with external services
  - Traffic data fetching
  - Delay calculation
  - AI message generation
  - Notification delivery

## Development Approach

This project will be built step-by-step, implementing each component incrementally to ensure proper testing and validation at each stage.

## Progress

### ✅ Step 1: Traffic Condition Checking (Completed)

We have successfully implemented the first step of the application:

**Files Created:**
- [src/types.ts](src/types.ts) - Type definitions for routes and traffic conditions
- [src/traffic-conditions.ts](src/traffic-conditions.ts) - Activity to check traffic using Google Maps Directions API
- [src/test-traffic-client.ts](src/test-traffic-client.ts) - Test client to verify traffic checking functionality
- [.env](.env) - Environment variables (Google Maps API key)

**Files Modified:**
- [src/workflows.ts](src/workflows.ts) - Added `checkDeliveryTraffic` workflow
- [src/worker.ts](src/worker.ts) - Registered traffic condition activities

**Key Features:**
- Integrates with Google Maps Directions API
- Fetches real-time traffic data for delivery routes
- Calculates delays by comparing normal duration vs. duration with traffic
- Returns comprehensive traffic information including distance, duration, and delay

**How to Test:**
1. Ensure Temporal server is running: `temporal server start-dev`
2. Start the worker: `npm run start`
3. In another terminal, run: `ts-node src/test-traffic-client.ts`

### 🔄 Next Steps

2. **Calculate potential delays** - Implement logic to determine if delay exceeds threshold
3. **Generate AI message** - Use an AI API to create customized delay notifications
4. **Send notifications** - Implement notification delivery to customers
