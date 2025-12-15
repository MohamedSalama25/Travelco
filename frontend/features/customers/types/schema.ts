import { z } from 'zod';

/**
 * Customer form validation schema
 */
export const customerSchema = z.object({
    name: z.string().min(2, { message: 'nameMin' }),
    phone: z.string().min(10, { message: 'phoneMin' }),
    email: z.string().email({ message: 'emailInvalid' }),
    passport_number: z.string().min(5, { message: 'passportMin' }),
    nationality: z.string().min(2, { message: 'nationalityMin' }),
    address: z.string().min(5, { message: 'addressMin' }),
});

export type CustomerSchemaType = z.infer<typeof customerSchema>;
