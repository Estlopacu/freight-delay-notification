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

## Implementation Status

### ✅ Complete Application (All Steps Completed)

This application is now fully implemented with all four steps working end-to-end. The system monitors traffic, evaluates delays, generates AI-powered messages, and sends email notifications.

### Core Workflow

**Main Workflow File:**
- [src/workflows.ts](src/workflows.ts) - Orchestrates the complete freight delay notification process
- [src/workflows/freight-delay-notification.ts](src/workflows/freight-delay-notification.ts) - Modular workflow implementation

**Workflow Steps:**
1. [src/workflows/check-traffic.ts](src/workflows/check-traffic.ts) - Traffic monitoring step
2. [src/workflows/evaluate-delay.ts](src/workflows/evaluate-delay.ts) - Delay threshold evaluation
3. [src/workflows/generate-message.ts](src/workflows/generate-message.ts) - AI message generation
4. [src/workflows/send-notification.ts](src/workflows/send-notification.ts) - Notification delivery

### Activities (External Service Integrations)

**Traffic Monitoring:**
- [src/activities/check-traffic-conditions.ts](src/activities/check-traffic-conditions.ts) - Google Maps Directions API integration
- Fetches real-time traffic data and calculates delays

**Message Generation:**
- [src/activities/generate-delay-message.ts](src/activities/generate-delay-message.ts) - Anthropic Claude AI integration
- Generates customer-friendly delay notifications with fallback handling
- [src/utils/ai-message-prompt.ts](src/utils/ai-message-prompt.ts) - AI prompt engineering
- [src/utils/fallback-message.ts](src/utils/fallback-message.ts) - Fallback message templates

**Notification Delivery:**
- [src/activities/send-email-notification.ts](src/activities/send-email-notification.ts) - SendGrid email delivery
- Includes retry logic and comprehensive error handling

### Type Definitions

**Type System:**
- [src/types/delivery-route.ts](src/types/delivery-route.ts) - Delivery route and customer information
- [src/types/traffic-conditions.ts](src/types/traffic-conditions.ts) - Traffic data structures
- [src/types/message-generation.ts](src/types/message-generation.ts) - Message generation types
- [src/types/workflow.ts](src/types/workflow.ts) - Workflow result types

### Configuration

**Constants and Environment:**
- [src/constants.ts](src/constants.ts) - Timeouts, retry policies, and thresholds
- [src/utils/env-validation.ts](src/utils/env-validation.ts) - Environment variable validation
- [.env](.env) - API keys for Google Maps, Anthropic, and SendGrid

### Testing

**Test Suite:**
- [src/__tests__/workflows.test.ts](src/__tests__/workflows.test.ts) - Workflow integration tests
- [src/__tests__/traffic-conditions.test.ts](src/__tests__/traffic-conditions.test.ts) - Traffic activity tests
- [src/__tests__/notifications.test.ts](src/__tests__/notifications.test.ts) - Notification activity tests

**Example Scripts:**
- [src/examples/test-check-traffic.ts](src/examples/test-check-traffic.ts) - Test traffic monitoring
- [src/examples/test-email-client.ts](src/examples/test-email-client.ts) - Test email notifications
- [src/examples/test-notification-failure.ts](src/examples/test-notification-failure.ts) - Test error handling

### Key Features

1. **Real-time Traffic Monitoring**
   - Google Maps Directions API integration
   - Calculates delays by comparing normal vs. traffic-adjusted duration
   - Threshold-based delay detection (configurable)

2. **AI-Powered Message Generation**
   - Uses Anthropic's Claude for natural, customer-friendly messages
   - Context-aware with route details and estimated delays
   - Fallback message generation if AI service unavailable

3. **Reliable Notification Delivery**
   - SendGrid email integration
   - Automatic retry with exponential backoff
   - Comprehensive error handling and logging
   - SMS fallback capability (infrastructure ready)

4. **Production-Ready Architecture**
   - Modular workflow design for maintainability
   - Type-safe TypeScript throughout
   - Comprehensive Jest test coverage
   - Environment validation and error handling
   - Temporal's built-in reliability and retry mechanisms

### Running the Application

**Start the system:**
```bash
# 1. Start Temporal server
temporal server start-dev

# 2. Start the worker
npm run start

# 3. Execute the workflow (in another terminal)
npm run workflow
```

**Run tests:**
```bash
# Run all tests
npm test

# Watch mode for development
npm test:watch

# Coverage report
npm test:coverage
```

**Test individual components:**
```bash
ts-node src/examples/test-check-traffic.ts
ts-node src/examples/test-email-client.ts
ts-node src/examples/test-notification-failure.ts
```

### Documentation

- [README.md](README.md) - Complete setup and usage guide
- All code includes comprehensive TypeScript documentation
- Test files demonstrate usage patterns

### Project Status

**Completed:** All four workflow steps are implemented, tested, and working end-to-end.

This application successfully demonstrates:
- Multi-step workflow orchestration with Temporal
- Integration with multiple external APIs
- AI-powered content generation
- Robust error handling and retry mechanisms
- Production-ready code structure and testing
