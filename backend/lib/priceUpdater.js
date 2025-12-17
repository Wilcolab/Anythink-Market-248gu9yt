const mongoose = require("mongoose");

/**
 * Batch update prices for all items
 * This simulates market price fluctuations by applying random changes
 * to item prices within a reasonable range
 */
async function updateItemPrices() {
  try {
    const Item = mongoose.model("Item");
    
    // Get all items
    const items = await Item.find({});
    
    if (items.length === 0) {
      console.log("[Price Updater] No items found to update");
      return { updated: 0, errors: 0 };
    }
    
    let updated = 0;
    let errors = 0;
    
    for (const item of items) {
      try {
        // If item has no price, set an initial random price between 10 and 1000
        if (!item.price || item.price === 0) {
          item.price = Math.floor(Math.random() * 990) + 10;
        } else {
          // Apply a random price change between -5% and +5%
          const changePercent = (Math.random() * 0.1) - 0.05; // -5% to +5%
          const newPrice = item.price * (1 + changePercent);
          
          // Ensure price doesn't go below 1
          item.price = Math.max(1, Math.round(newPrice * 100) / 100);
        }
        
        await item.save();
        updated++;
      } catch (err) {
        console.error(`[Price Updater] Error updating item ${item.slug}:`, err.message);
        errors++;
      }
    }
    
    const timestamp = new Date().toISOString();
    console.log(`[Price Updater] ${timestamp} - Updated ${updated} items, ${errors} errors`);
    
    return { updated, errors, timestamp };
  } catch (err) {
    console.error("[Price Updater] Fatal error during batch update:", err);
    throw err;
  }
}

module.exports = {
  updateItemPrices,
};
