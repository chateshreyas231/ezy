import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const dealRouter = router({
    list: publicProcedure.query(() => {
        return [
            { id: "1", title: "Modern Loft", price: 850000, stage: "NEGOTIATION" },
            { id: "2", title: "Sunset Villa", price: 1200000, stage: "NEW" },
        ];
    }),
    create: publicProcedure
        .input(z.object({
            title: z.string(),
            address: z.string(),
            price: z.number(),
        }))
        .mutation(({ input }) => {
            // Mock db call
            return { id: Math.random().toString(), ...input, stage: "NEW" };
        }),
});
