# Freight Delay Notification System

A production-ready TypeScript application that monitors traffic delays on freight delivery routes and automatically notifies customers when significant delays occur. Built with Temporal.

## Overview

This system demonstrates a real-world implementation of:

- Multi-step workflow orchestration using Temporal
- Real-time traffic monitoring with Google Maps API
- AI-powered message generation using Anthropic's Claude
- Email notifications with SendGrid
- Comprehensive Jest testing suite

## Architecture

The application follows Temporal's workflow and activity pattern:

```
Workflows:
├── check-traffic.ts       - Traffic condition monitoring
├── generate-message.ts    - AI message generation
└── send-notification.ts   - Notification delivery

Activities (External Interactions):
├── check-traffic-conditions.ts    - Google Maps API integration
├── generate-delay-message.ts      - Claude AI integration
└── send-email-notification.ts     - SendGrid email delivery

Utils (Business Logic):
├── delay-evaluation.ts    - Delay threshold evaluation
├── env-validation.ts      - Environment variable validation
├── ai-message-prompt.ts   - AI prompt templates
└── fallback-message.ts    - Fallback message generation
```

## Prerequisites

- Node.js (v18 or higher)
- Temporal Server (for local development)
- API Keys:
  - Google Maps API key (with Directions API enabled)
  - Anthropic API key (for Claude AI)
  - SendGrid API key (for email notifications)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=your_anthropic_api_key

# SendGrid Email
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=verified_sender@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name
```

### 3. Start Temporal Server

```bash
temporal server start-dev
```

## Running the Application

### Start the Worker

```bash
npm run start
```

Or with auto-reload during development:

```bash
npm run start.watch
```

### Execute a Workflow

```bash
npm run workflow
```

This runs the main client that executes the freight delay notification workflow.

## Testing

### Run Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm test:watch
```

### Coverage Report

```bash
npm test:coverage
```

### Example Test Scripts

For more details on the example scripts, see [src/examples/README.md](src/examples/README.md).

## Error Handling

The application includes robust error handling:

- Automatic retries for transient failures (configured via Temporal)
- Fallback message generation if AI service is unavailable
- Comprehensive error logging and reporting

## Testing Strategy

- **Unit Tests**: Individual activities and workflow logic
- **Integration Tests**: End-to-end workflow execution with mocked external services
- **Example Scripts**: Real API testing for development and debugging

## License

Private project - All rights reserved
