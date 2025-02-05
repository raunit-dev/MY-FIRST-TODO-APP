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
