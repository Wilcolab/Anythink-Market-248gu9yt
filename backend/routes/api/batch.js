var router = require("express").Router();
var { updateItemPrices } = require("../../lib/priceUpdater");

/**
 * Endpoint to manually trigger batch price updates
 * Useful for testing and manual operations
 */
router.post("/update-prices", async function (req, res, next) {
  try {
    console.log("[API] Manual price update triggered");
    const result = await updateItemPrices();
    
    res.json({
      status: "success",
      message: "Price update completed",
      result: result,
    });
  } catch (err) {
    console.error("[API] Error during manual price update:", err);
    res.status(500).json({
      status: "error",
      message: "Price update failed",
      error: err.message,
    });
  }
});

/**
 * Endpoint to get the status of the batch update system
 */
router.get("/status", function (req, res, next) {
  const config = require("../../config");
  
  res.json({
    status: "operational",
    scheduler: {
      enabled: config.scheduler.enabled,
      schedule: config.scheduler.priceUpdateSchedule,
      timezone: process.env.TZ || "UTC",
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
