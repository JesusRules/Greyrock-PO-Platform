import { z } from "zod"

// For creating new users (password required)
export const createUserSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  // login: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.string(),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Phone number must be at least 10 characters.",
    }),
  password: z.string().min(3, { message: "Password must be at least 3 characters." }),
  departments: z.array(z.string()).optional(),
})

// For editing users (password optional)
export const updateUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  // login: z.string().min(3),
  email: z.string().email(),
  role: z.string(),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10),
  password: z.string().optional().or(z.literal("")),
  departments: z.array(z.string()).optional(),
})
