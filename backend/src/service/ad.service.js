const prisma = require("../config/prisma.js");

const createAd = async (advertiserId, data) => {
    return prisma.ad.create({
        data: {
            advertiserId,
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
            targetUrl: data.targetUrl,
            status: "PENDING",
        },
    });
};

const getMyAds = async (
    advertiserId,
    {
        status,
        search,
        page = 1,
        limit = 10,
    } = {}
) => {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const where = {
        advertiserId,
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [ads, total] = await prisma.$transaction([
        prisma.ad.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.ad.count({
            where,
        }),
    ]);

    return {
        ads,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
const updateAd = async (adId, advertiserId, data) => {
    const ad = await prisma.ad.findUnique({
        where: {
            id: adId,
        },
    });

    if (!ad) {
        const error = new Error("Ad not found");
        error.statusCode = 404;
        throw error;
    }

    if (ad.advertiserId !== advertiserId) {
        const error = new Error("You can only update your own ads");
        error.statusCode = 403;
        throw error;
    }

    if (ad.status === "APPROVED") {
        const error = new Error("Approved ads cannot be updated");
        error.statusCode = 400;
        throw error;
    }

    return prisma.ad.update({
        where: {
            id: adId,
        },
        data: {
            title: data.title,
            description: data.description,
            ...(data.imageUrl && {
                imageUrl: data.imageUrl,
            }),
            targetUrl: data.targetUrl,
            status: "PENDING",
        },
    });
};

const getAdminAds = async ({
    status,
    search,
    page = 1,
    limit = 10,
}) => {
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            {
                title: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                advertiser: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                advertiser: {
                    email: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }

    const [ads, total] = await prisma.$transaction([
        prisma.ad.findMany({
            where,
            skip,
            take: limit,
            include: {
                advertiser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        }),

        prisma.ad.count({
            where,
        }),
    ]);

    return {
        ads,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const updateAdStatus = async (adId, status) => {
    const ad = await prisma.ad.findUnique({
        where: {
            id: adId,
        },
    });

    if (!ad) {
        const error = new Error("Ad not found");
        error.statusCode = 404;
        throw error;
    }

    return prisma.ad.update({
        where: {
            id: adId,
        },
        data: {
            status,
        },
    });
};

module.exports = {
    createAd,
    getMyAds,
    updateAd,
    getAdminAds,
    updateAdStatus,
};