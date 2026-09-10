const { z } = require("zod");

const pricingRuleSchema = z.object({
  adSpaceId: z.string().uuid(),

  startDate: z.coerce.date(),

  endDate: z.coerce.date(),

  price: z.number().min(0),

  priority: z.number().int().positive(),

  color: z.string().min(1),

  details: z.string().optional(),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: "Start date must be before or equal to end date",
    path: ["endDate"],
  }
);

module.exports = {
  pricingRuleSchema,
};