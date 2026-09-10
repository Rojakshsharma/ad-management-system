const { uploadImage } = require("../services/cloudinary.service.js");

const uploadAdImageController = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("Image is required");
      error.statusCode = 400;
      throw error;
    }

    const result = await uploadImage(req.file.buffer);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl: result.secure_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAdImageController,
};