const adSpaceService = require("../service/adSpace.service.js");

const getAdSpaces = async (req, res, next) => {
  try {
    const adSpaces = await adSpaceService.getAllAdSpaces();

    return res.status(200).json({
      success: true,
      data: adSpaces,
    });
  } catch (error) {
    next(error);
  }
};

const createAdSpace = async (req, res, next) => {
  try {
    const adSpace = await adSpaceService.createAdSpace(req.body);

    return res.status(201).json({
      success: true,
      message: "Ad space created successfully",
      data: adSpace,
    });
  } catch (error) {
    next(error);
  }
};

const updateAdSpace = async (req, res, next) => {
  try {
    const adSpace = await adSpaceService.updateAdSpace(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Ad space updated successfully",
      data: adSpace,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdSpaces,
  createAdSpace,
  updateAdSpace,
};