# Simple URL Availability Checker

A robust, TypeScript-based utility to monitor the availability of URLs and send alerts via Email or AWS SNS when availability changes.

## Features

- **Multi-protocol support**: Checks both HTTP and HTTPS URLs.
- **Configurable Intervals**: Set sleep time between checks and alert intervals.
- **Modular Alerting System**:
  - **Email**: Send alerts via SMTP (Gmail, etc.).
  - **AWS SNS**: Publish alerts to an SNS topic.
- **Structured Logging**: Uses `winston` for clean, informative logs.
- **TypeScript**: Typed, maintainable codebase.

## Algorithm

The checker operates on a simple state machine logic for each URL:

1.  **State Tracking**: Each URL maintains a state of either `normal` (200 OK) or `alerted` (Down / Non-200).
2.  **Check Loop**: The system fetches the URL.
    - If the response code is `200` and the current state is `alerted`, it transitions back to `normal` (Recovery).
    - If the response code is **not** `200` (or timeout) and the current state is `normal`, it transitions to `alerted` (Failure).
3.  **Alerting**: Alerts are triggered only on state transitions.
    - To prevent spam, alerts are throttled by a configurable `INTERVAL`. If a transition happens but the last alert was sent too recently, the alert is skipped (but state is still updated).

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The application is configured using environment variables. You can set these in your shell or use a `.env` file loader (not included by default, but easy to add).

### General Settings

| Variable  | Default | Description |
| t--- | --- | --- |
| `URLS` | `https://www.google.com https://www.amazon.com` | Space-separated list of URLs to monitor. |
| `TIMEOUT` | `1000` | Request timeout in milliseconds. |
| `SLEEP` | `15` | Sleep time (seconds) between checking all URLs. |
| `INTERVAL` | `300` | Minimum interval (seconds) between repeat alerts for the same URL. |

### Email Alerter Settings

| Variable | Description |
| --- | --- |
| `EMAIL_USER` | SMTP username (e.g., your gmail address). |
| `EMAIL_PASS` | SMTP password (or App Password). |
| `EMAIL_TO` | Recipient email address. |
| `EMAIL_SUBJ` | (Optional) Subject line for alerts. |

### AWS SNS Alerter Settings

| Variable | Description |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | AWS Access Key. |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key. |
| `AWS_REGION` | AWS Region (e.g., `us-east-1`). |
| `AWS_TOPIC_ARN` | The ARN of the SNS topic to publish to. |

## Usage

Start the application:

```bash
npm start
```

## Running Tests

The project uses **Jest** for automated unit testing.

```bash
npm test
```

This will run tests for:
- Network utility
- Checker logic (state transitions, alerts)
- Alerter implementations (Email, AWS)

## Project Structure

- `src/index.ts`: Entry point.
- `src/lib/`: Core logic (Checker, Network, Logger).
- `src/alerters/`: Alerting implementations (Email, AWS) and Manager.
- `src/config.ts`: Configuration loading.
- `src/types.ts`: TypeScript interfaces.
