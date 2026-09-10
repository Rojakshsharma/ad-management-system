const { z } = require("zod");

const createAdSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  targetUrl: z.string().url(),
});

const updateAdSchema = createAdSchema;

const adminAdsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const updateAdStatusSchema = z.object({
  status: z.enum(["PENDING" ,"APPROVED", "REJECTED"]),
});

const myAdsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

module.exports = {
  createAdSchema,
  updateAdSchema,
  adminAdsQuerySchema,
  updateAdStatusSchema,
  myAdsQuerySchema
};