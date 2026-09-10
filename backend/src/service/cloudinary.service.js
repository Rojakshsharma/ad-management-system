const cloudinary = require("../config/cloudinary.js");

const uploadImage = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "ad-management/ads",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    console.log("CLOUDINARY ERROR MESSAGE:", error.message);
                    console.log("CLOUDINARY ERROR OBJECT:", error);
                    console.log(
                        "CLOUDINARY ERROR JSON:",
                        JSON.stringify(error, null, 2)
                    );

                    return reject(error);
                }

                console.log("CLOUDINARY SUCCESS:", result.secure_url);
                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

module.exports = {
    uploadImage,
};