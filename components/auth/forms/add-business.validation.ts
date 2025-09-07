import { z } from "zod";

// Base schema with common fields
const baseSchema = {
  name: z
    .string({
      required_error: "Business Name is required",
    })
    .min(1),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1)
    .refine((desc) => desc.split(/\s+/).filter(Boolean).length <= 150, {
      message: "Description must be 150 words or less",
    }),
  legal: z.string({
    required_error: "Please select type of incorporation",
  }),
  year: z.string({
    required_error: "Please select year of incorporation",
  }),
  location: z.string({
    required_error: "Please select location",
  }),
  sector: z.string({
    required_error: "Please select sector",
  }),
};

// Schema for when user is a beneficial owner
const beneficialOwnerSchema = z.object({
  ...baseSchema,
  isBeneficialOwner: z.literal(true),
  specificPosition: z.string().optional(),
  beneficialOwnerShareholding: z.coerce
    .number({
      required_error: "Please enter shareholding percentage",
      invalid_type_error: "Shareholding must be a number",
    })
    .min(0, "Shareholding cannot be negative")
    .max(100, "Shareholding cannot exceed 100%"),
  beneficialOwnerType: z.string({
    required_error: "Please select beneficial owner type",
  }),
});

// Schema for when user is not a beneficial owner
const notBeneficialOwnerSchema = z.object({
  ...baseSchema,
  isBeneficialOwner: z.literal(false),
  specificPosition: z.string().optional(),
  beneficialOwnerShareholding: z.undefined().optional(),
  beneficialOwnerType: z.undefined().optional(),
});

// Combined schema using discriminated union
export const AddBusinessSchema = z.discriminatedUnion("isBeneficialOwner", [
  beneficialOwnerSchema,
  notBeneficialOwnerSchema,
]);

export const AddBusinessSchemaWithoutPosition = z.object({
  name: z
    .string({
      required_error: "Business Name is required",
    })
    .min(1),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1)
    .refine((desc) => desc.split(/\s+/).filter(Boolean).length <= 150, {
      message: "Description must be 150 words or less",
    }),
  incorporation: z.string({
    required_error: "Please select type of incorporation",
  }),
  year: z.string({
    required_error: "Please select year of incorporation",
  }),
  sector: z.string({
    required_error: "Please select sector",
  }),
});

export const AddBusinessSchemaNoOwnership = z.object({
  name: z
    .string({
      required_error: "Business Name is required",
    })
    .min(1),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1)
    .refine((desc) => desc.split(/\s+/).filter(Boolean).length <= 150, {
      message: "Description must be 150 words or less",
    }),
  legal: z.string({
    required_error: "Please select type of incorporation",
  }),
  year: z.string({
    required_error: "Please select year of incorporation",
  }),
  sector: z.string({
    required_error: "Please select sector",
  }),
});

export type TAddBusinessExcludingPosition = z.infer<
  typeof AddBusinessSchemaWithoutPosition
>;

export type TAddBusiness = z.infer<typeof AddBusinessSchema>;
