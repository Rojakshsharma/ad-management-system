const adService = require("../service/ad.service.js");
const { uploadImage } = require("../service/cloudinary.service.js");

const createAdController = async (req, res, next) => {

    try {
        if (!req.file) {
            const error = new Error("Image is required");
            error.statusCode = 400;
            throw error;
        }

        const result = await uploadImage(req.file.buffer);
        console.log("CLOUDINARY RESULT:", result);

        const ad = await adService.createAd(req.user.userId, {
            ...req.body,
            imageUrl: result.secure_url,
        });

        res.status(201).json({
            success: true,
            message: "Ad created successfully",
            data: ad,
        });
    } catch (error) {
        console.log(Error)
        next(error);
    }
};

const getMyAdsController = async (req, res, next) => {
    try {
        const result = await adService.getMyAds(
            req.user.userId,
            req.query
        );

        res.status(200).json({
            success: true,
            data: result.ads,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

const updateAdController = async (req, res, next) => {
    try {
        let imageUrl;

        if (req.file) {
            const result = await uploadImage(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const ad = await adService.updateAd(
            req.params.id,
            req.user.userId,
            {
                ...req.body,
                ...(imageUrl && { imageUrl }),
            }
        );

        res.status(200).json({
            success: true,
            message: "Ad updated successfully and sent for verification",
            data: ad,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminAdsController = async (req, res, next) => {
    try {
        const result = await adService.getAdminAds(req.query);

        res.status(200).json({
            success: true,
            data: result.ads,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

const updateAdStatusController = async (req, res, next) => {
    try {
        const ad = await adService.updateAdStatus(
            req.params.id,
            req.body.status
        );

        res.status(200).json({
            success: true,
            message: `Ad ${req.body.status.toLowerCase()} successfully`,
            data: ad,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAdController,
    getMyAdsController,
    updateAdController,
    getAdminAdsController,
    updateAdStatusController,
};
