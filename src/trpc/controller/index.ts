import { db } from "@/db";
import {
  authCallbackService,
  deleteFileService,
  getUserFilesService,
  getFileService,
  getFileUploadStatusService,
  getFileMessagesService,
} from "../service";
import { privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";

export const authCallbackProcedure = publicProcedure.query(async () => {
  return await authCallbackService();
});

//INFO: How to use private procedure.
export const getUserFilesProcedure = privateProcedure.query(async ({ ctx }) => {
  const { userId, user } = ctx;
  return await getUserFilesService(userId);
});

//INFO: How to use private procedure with input.
export const deleteFileProcedure = privateProcedure
  .input(
    /*
        INFO: object needs to have an id property, and it should be string!
     */
    z.object({ id: z.string() })
  )
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    return await deleteFileService(input, userId);
  });

//INFO: THIS PROCEDURE WILL BE USED TO DO POLLINGS!
export const getFileProcedure = privateProcedure
  .input(z.object({ key: z.string() })) //again, ctx comes from middleware.
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    return await getFileService(input, userId);
  });

export const getFielUploadStatusProcedure = privateProcedure
  .input(z.object({ fileId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { fileId } = input;
    return await getFileUploadStatusService(fileId, ctx.userId);
  });

export const getFileMessagesProcedure = privateProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(), //INFO: We are going to use this cursor for infinite query.
      fileId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    return await getFileMessagesService(input, ctx.userId);
  });

export const createStripeSessionProcedure = privateProcedure.mutation(
  async ({ ctx }) => {
    const { userId } = ctx

    const billingUrl = absoluteUrl('/dashboard/billing')

    if (!userId)
      throw new TRPCError({ code: 'UNAUTHORIZED' })

    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    })

    if (!dbUser)
      throw new TRPCError({ code: 'UNAUTHORIZED' })

    const subscriptionPlan =
      await getUserSubscriptionPlan()

    if (
      subscriptionPlan.isSubscribed &&
      dbUser.stripeCustomerId
    ) {
      const stripeSession =
        await stripe.billingPortal.sessions.create({
          customer: dbUser.stripeCustomerId,
          return_url: billingUrl,
        })

      return { url: stripeSession.url }
    }

    const stripeSession =
      await stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ['card', 'paypal'],
        mode: 'subscription',
        billing_address_collection: 'auto',
        line_items: [
          {
            price: PLANS.find(
              (plan) => plan.name === 'Pro'
            )?.price.priceIds.test,
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
        },
      })

    return { url: stripeSession.url }
  }
);
