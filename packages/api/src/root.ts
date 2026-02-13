import { router } from "./trpc";
import { dealRouter } from "./router/deal";

export const appRouter = router({
    deal: dealRouter,
});

export type AppRouter = typeof appRouter;
