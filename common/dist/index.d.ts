import { z } from "zod";
export declare const credentials: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    password: string;
    username: string;
}, {
    password: string;
    username: string;
}>;
export type SignUpParams = z.infer<typeof credentials>;
export declare const todoValidation: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
}, {
    title: string;
    description: string;
}>;
export type TODOParams = z.infer<typeof todoValidation>;
