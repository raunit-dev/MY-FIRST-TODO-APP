"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = void 0;
const zod_1 = require("zod");
const weakPasswords = [
    "password",
    "12345678",
    "qerty123",
    "letmein",
    "12345678",
];
exports.credentials = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username cannot exceed 20 characters")
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Username must start with a letter or underscore and can only contain letters, numbers, and underscores"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(20, "Password cannot exceed 20 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
        .refine((val) => !weakPasswords.includes(val.toLowerCase()), { message: "This password is too common, please choose a stronger one." })
});
console.log("hi there");
