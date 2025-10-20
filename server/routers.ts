import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { diagnosePlant, diagnoseEquipment, askFollowUpQuestion } from "./geminiService";
import { savePlantDiagnosis, getPlantDiagnosesByUser, saveEquipmentSession, updateEquipmentSession, getEquipmentSession, getEquipmentSessionsByUser } from "./db";
import { v4 as uuidv4 } from "uuid";
import { storagePut } from "./storage";

export const appRouter = router({
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

  plant: router({
    diagnose: publicProcedure
      .input(
        z.object({
          imageData: z.string(),
          description: z.string().optional(),
          cropType: z.string().optional(),
          temperature: z.number().optional(),
          humidity: z.number().optional(),
          ec: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await diagnosePlant({
          imageData: input.imageData,
          description: input.description,
          cropType: input.cropType,
          temperature: input.temperature,
          humidity: input.humidity,
          ec: input.ec,
        });

        const imageBuffer = Buffer.from(input.imageData, "base64");
        const userId = ctx.user?.id || "anonymous";
        const imageKey = `plant-diagnoses/${userId}/${uuidv4()}.jpg`;
        const { url: imageUrl } = await storagePut(imageKey, imageBuffer, "image/jpeg");

        const diagnosisId = uuidv4();
        await savePlantDiagnosis({
          id: diagnosisId,
          userId,
          imageUrl,
          description: input.description,
          cropType: input.cropType,
          temperature: input.temperature,
          humidity: input.humidity,
          ec: input.ec,
          result,
        });

        return {
          ...result,
          diagnosisId,
        };
      }),
    followUp: publicProcedure
      .input(
        z.object({
          diagnosisResult: z.any(),
          question: z.string(),
          imageData: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const answer = await askFollowUpQuestion({
          diagnosisResult: input.diagnosisResult,
          question: input.question,
          imageData: input.imageData,
        });
        return { answer };
      }),
    history: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return await getPlantDiagnosesByUser(ctx.user.id);
    }),
  }),

  equipment: router({
    diagnose: publicProcedure
      .input(
        z.object({
          message: z.string(),
          sessionId: z.string().optional(),
          imageData: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let sessionId = input.sessionId;
        let conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        if (sessionId) {
          const session = await getEquipmentSession(sessionId);
          if (session && session.conversationHistory) {
            conversationHistory = session.conversationHistory;
          }
        } else {
          sessionId = uuidv4();
          const userId = ctx.user?.id || "anonymous";
          await saveEquipmentSession({
            id: sessionId,
            userId,
            conversationHistory: [],
            status: "ongoing",
          });
        }

        const result = await diagnoseEquipment({
          message: input.message,
          conversationHistory,
          imageData: input.imageData,
        });

        conversationHistory.push({
          role: "user",
          parts: [{ text: input.message }],
        });
        conversationHistory.push({
          role: "model",
          parts: [{ text: JSON.stringify(result) }],
        });

        const updates: any = {
          conversationHistory,
        };
        if (result.診断段階 === "診断完了" && result.診断結果) {
          updates.status = "completed";
          updates.finalDiagnosis = result.診断結果;
        }

        await updateEquipmentSession(sessionId, updates);

        return {
          ...result,
          sessionId,
        };
      }),
    history: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return await getEquipmentSessionsByUser(ctx.user.id);
    }),
    getSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await getEquipmentSession(input.sessionId);
      }),
  }),
});

export type AppRouter = typeof appRouter;

