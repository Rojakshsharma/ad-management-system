const eventService = require("../service/event.service.js");

const createImpressionController = async (req, res, next) => {
  try {
    const event = await eventService.createEvent({
      ...req.body,
      eventType: "IMPRESSION",
    });

    res.status(201).json({
      success: true,
      message: "Impression recorded",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

const createClickController = async (req, res, next) => {
  try {
    const event = await eventService.createEvent({
      ...req.body,
      eventType: "CLICK",
    });

    res.status(201).json({
      success: true,
      message: "Click recorded",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createImpressionController,
  createClickController,
};