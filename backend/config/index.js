module.exports = {
  secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "secret",
  scheduler: {
    enabled: process.env.ENABLE_SCHEDULER !== "false",
    priceUpdateSchedule: process.env.PRICE_UPDATE_SCHEDULE || "0 * * * *",
  },
};
