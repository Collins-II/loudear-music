import { z } from "zod";


export const ProfileSchema = z.object({
name: z.string().min(1, "Name is required").max(100),
bio: z.string().max(2000).optional().nullable(),
location: z.string().max(200).optional().nullable(),
phone: z
.string()
.min(7)
.max(32)
.regex(/^[0-9+()\-\s]*$/, "Phone contains invalid characters")
.optional(),
genres: z.array(z.string().min(1)).optional(),
image: z.string().url().optional().nullable(),
});


export type ProfileInput = z.infer<typeof ProfileSchema>;