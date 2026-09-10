const { z } = require("zod");

const createAdSpaceSchema = z.object({
  pageNumber: z.number().int().min(1).max(5),

  position: z.enum(["TOP", "MID", "BOTTOM"]),

  size: z.enum(["BANNER", "GRID"]),

  year: z.number().int().min(2026),

  basePrice: z.number().min(0),
});

const updateAdSpaceSchema = createAdSpaceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required for update",
  }
);

module.exports = {
  createAdSpaceSchema,
  updateAdSpaceSchema,
};