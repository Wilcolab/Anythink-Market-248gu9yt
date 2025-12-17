const cron = require("node-cron");
const { updateItemPrices } = require("../lib/priceUpdater");

/**
 * Initialize scheduled tasks for batch operations
 * @param {boolean} enabled - Whether to enable the scheduler (defaults to true in production)
 */
function initScheduler(enabled = true) {
  if (!enabled) {
    console.log("[Scheduler] Batch price updates are disabled");
    return null;
  }
  
  // Get schedule from environment or use default (every hour)
  // Cron format: minute hour day month weekday
  // Default: "0 * * * *" means at minute 0 of every hour
  const schedule = process.env.PRICE_UPDATE_SCHEDULE || "0 * * * *";
  
  console.log(`[Scheduler] Initializing batch price updater with schedule: ${schedule}`);
  
  // Schedule the price update task
  const task = cron.schedule(schedule, async () => {
    console.log("[Scheduler] Running scheduled price update...");
    try {
      const result = await updateItemPrices();
      console.log(`[Scheduler] Price update completed successfully:`, result);
    } catch (err) {
      console.error("[Scheduler] Price update failed:", err);
    }
  }, {
    scheduled: true,
    timezone: process.env.TZ || "UTC"
  });
  
  console.log("[Scheduler] Batch price updater scheduled successfully");
  
  return task;
}

/**
 * Stop the scheduler
 * @param {Object} task - The cron task to stop
 */
function stopScheduler(task) {
  if (task) {
    task.stop();
    console.log("[Scheduler] Batch price updater stopped");
  }
}

module.exports = {
  initScheduler,
  stopScheduler,
};
