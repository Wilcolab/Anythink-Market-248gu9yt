# Batch Price Updates Documentation

## Overview

The Anythink Market backend includes an automated batch updating system for item prices. This system simulates market price fluctuations by periodically updating prices for all items in the database.

## Features

- **Automated Scheduling**: Uses node-cron to schedule periodic price updates
- **Configurable Schedule**: Customize the update frequency via environment variables
- **Initial Price Assignment**: Automatically assigns random initial prices to items without prices
- **Market Simulation**: Applies realistic price fluctuations (+/- 5%) to existing prices
- **Logging**: Comprehensive logging of all batch operations
- **Manual Triggering**: REST API endpoints for manual control and testing
- **Production Ready**: Only runs in production mode to avoid unnecessary updates during development

## Configuration

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `ENABLE_SCHEDULER` | Enable/disable the batch scheduler | `true` | `false` |
| `PRICE_UPDATE_SCHEDULE` | Cron schedule for price updates | `0 * * * *` (hourly) | `*/30 * * * *` (every 30 min) |
| `TZ` | Timezone for scheduler | `UTC` | `America/New_York` |
| `NODE_ENV` | Node environment (scheduler only runs when `production`) | - | `production` |

### Cron Schedule Format

The schedule uses standard cron syntax:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**
- `0 * * * *` - Every hour at minute 0
- `*/30 * * * *` - Every 30 minutes
- `0 */2 * * *` - Every 2 hours
- `0 0 * * *` - Daily at midnight
- `0 9,17 * * 1-5` - Weekdays at 9 AM and 5 PM

## Price Update Logic

### Initial Price Assignment
When an item has no price (or price = 0):
- Assigns a random price between $10 and $1,000
- Ensures all items have valid starting prices

### Price Fluctuation
For items with existing prices:
- Applies a random change between -5% and +5%
- Rounds to 2 decimal places
- Ensures price never falls below $1

### Example
```
Original Price: $100.00
Random Factor: -2.3%
New Price: $97.70
```

## API Endpoints

### Trigger Manual Update
**POST** `/api/batch/update-prices`

Manually triggers a batch price update for all items.

**Response:**
```json
{
  "status": "success",
  "message": "Price update completed",
  "result": {
    "updated": 42,
    "errors": 0,
    "timestamp": "2025-12-17T16:35:00.000Z"
  }
}
```

### Check Scheduler Status
**GET** `/api/batch/status`

Returns the current scheduler configuration and status.

**Response:**
```json
{
  "status": "operational",
  "scheduler": {
    "enabled": true,
    "schedule": "0 * * * *",
    "timezone": "UTC"
  },
  "timestamp": "2025-12-17T16:35:00.000Z"
}
```

## Logging

The batch update system provides detailed logging:

### Initialization
```
[Scheduler] Initializing batch price updater with schedule: 0 * * * *
[Scheduler] Batch price updater scheduled successfully
```

### Execution
```
[Scheduler] Running scheduled price update...
[Price Updater] 2025-12-17T16:00:00.000Z - Updated 42 items, 0 errors
[Scheduler] Price update completed successfully: { updated: 42, errors: 0, ... }
```

### Errors
```
[Price Updater] Error updating item example-item-123: Validation failed
[Scheduler] Price update failed: Error message
```

## Troubleshooting

### Scheduler Not Running

1. **Check if production mode is enabled:**
   ```bash
   echo $NODE_ENV
   # Should output: production
   ```

2. **Verify scheduler is enabled:**
   ```bash
   echo $ENABLE_SCHEDULER
   # Should output: true or be empty (defaults to true)
   ```

3. **Check logs for initialization messages:**
   Look for `[Scheduler] Initializing batch price updater` in application logs

### No Price Updates Occurring

1. **Verify items exist in database:**
   ```bash
   # Check item count via MongoDB
   ```

2. **Test manual trigger:**
   ```bash
   curl -X POST http://localhost:3000/api/batch/update-prices
   ```

3. **Check scheduler status:**
   ```bash
   curl http://localhost:3000/api/batch/status
   ```

### Disable Scheduler

Set environment variable:
```bash
export ENABLE_SCHEDULER=false
```

Or in Heroku:
```bash
heroku config:set ENABLE_SCHEDULER=false --app your-app-name
```

## Development

The scheduler is disabled in development mode to prevent unnecessary database operations during local development. To test the scheduler in development:

1. Use the manual trigger endpoint
2. Temporarily set `NODE_ENV=production` in your local environment
3. Use the test script (see Testing section)

## Architecture

### File Structure
```
backend/
├── config/
│   ├── index.js          # Main configuration (includes scheduler config)
│   └── scheduler.js      # Scheduler initialization and management
├── lib/
│   └── priceUpdater.js   # Price update logic
├── routes/api/
│   └── batch.js          # Batch operation API endpoints
└── app.js                # Application entry point (initializes scheduler)
```

### Components

1. **Scheduler** (`config/scheduler.js`)
   - Manages cron jobs
   - Handles task scheduling and stopping
   - Configurable via environment variables

2. **Price Updater** (`lib/priceUpdater.js`)
   - Contains business logic for price updates
   - Handles initial price assignment
   - Applies price fluctuations
   - Provides detailed logging

3. **API Routes** (`routes/api/batch.js`)
   - Manual trigger endpoint
   - Status check endpoint
   - Error handling

4. **Integration** (`app.js`)
   - Initializes scheduler on app startup
   - Only runs in production environment
   - Respects ENABLE_SCHEDULER flag
