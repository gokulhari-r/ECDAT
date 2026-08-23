import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createScenarioRun, getExportPayload, getScanDetail, listUserScans, saveMoscaAssumptions } from "./ecdat";
import { getSeededScenario, scenarioCatalog, scenarioIds } from "./ecdatSeed";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  ecdat: router({
    scenarioCatalog: publicProcedure.query(() =>
      scenarioCatalog.map(({ findings, recommendations, relationships, waves, ...scenario }) => ({
        ...scenario,
        sampledFindingCount: findings.length,
      }))
    ),
    preview: publicProcedure
      .input(z.object({ scenario: z.enum(scenarioIds) }).optional())
      .query(({ input }) => getSeededScenario(input?.scenario ?? "python-web")),
    runDemo: protectedProcedure
      .input(z.object({ scenario: z.enum(scenarioIds), repositoryUrl: z.string().url().optional() }))
      .mutation(({ ctx, input }) => createScenarioRun(ctx.user.id, input.scenario, input.repositoryUrl)),
    scans: protectedProcedure.query(({ ctx }) => listUserScans(ctx.user.id)),
    detail: protectedProcedure
      .input(z.object({ scanKey: z.string().min(1) }))
      .query(({ ctx, input }) => getScanDetail(ctx.user.id, input.scanKey)),
    saveMoscaAssumptions: protectedProcedure
      .input(
        z.object({
          scanKey: z.string().min(1),
          dataLifetimeYears: z.number().min(1).max(100),
          migrationMonths: z.number().min(1).max(120),
          crqcHorizonYears: z.number().min(1).max(100),
        })
      )
      .mutation(({ ctx, input }) => saveMoscaAssumptions(ctx.user.id, input)),
    export: protectedProcedure
      .input(z.object({ scanKey: z.string().min(1) }))
      .query(({ ctx, input }) => getExportPayload(ctx.user.id, input.scanKey)),
  }),
});

export type AppRouter = typeof appRouter;
