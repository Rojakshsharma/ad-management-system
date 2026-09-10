const { z } = require("zod");

const createOrderSchema = z.object({
  adId: z.string().uuid(),
  adSpaceId: z.string().uuid(),
  date: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Date must be YYYY-MM-DD"
  ),
  durationSeconds: z
    .number()
    .int()
    .refine(
      (value) =>
        [15, 30, 3600, 7200].includes(value),
      "Duration must be 15, 30, 3600 or 7200 seconds"
    ),
});

module.exports = {
  createOrderSchema,
};