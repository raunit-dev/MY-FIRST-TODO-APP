import {z} from "zod";
 const weakPasswords = [
  "password",
  "12345678",
  "qerty123",
  "letmein",
  "12345678",
 ];
 export const credentials = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Username must start with a letter or underscore and can only contain letters, numbers, and underscores"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password cannot exceed 20 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
    .refine((val)=> !weakPasswords.includes(val.toLowerCase()),
    { message: "This password is too common, please choose a stronger one." })
 }
);
export type SignUpParams = z.infer<typeof credentials>;

export const todoValidation = z.object({
  title:z.string()
    .min(3, "title must be at least 3 characters long")
    .max(20, "title cannot exceed 20 characters"),
  description: z.string().min(3, "description must be at least 3 characters long"),
})
export type TODOParams = z.infer<typeof todoValidation>;
console.log("hi there");

