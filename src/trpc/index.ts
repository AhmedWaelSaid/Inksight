import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "./../config/infinite-query";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/config/Stripe";
import { absoluteUrl } from "@/lib/utils";
export const appRouter = router({
  authCallback: publicProcedure.query(async ({ ctx }) => {
    const { user } = ctx
    
    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    // check if the user is in the database
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    })

    if (!dbUser) {
      // create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }

    return { success: true }
  }),

  createStripeSession: privateProcedure.mutation(
    async ({ ctx }) => {
      try {
        const { userId } = ctx

        console.log('=== createStripeSession Debug ===');
        console.log('userId:', userId);

        const billingUrl = absoluteUrl('/dashboard')

        if (!userId)
          throw new TRPCError({ code: 'UNAUTHORIZED' })

        const dbUser = await db.user.findFirst({
          where: {
            id: userId,
          },
        })

        console.log('dbUser found:', !!dbUser);
        if (dbUser) {
          console.log('dbUser subscription data:', {
            stripePriceId: dbUser.stripePriceId,
            stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
            stripeCustomerId: dbUser.stripeCustomerId,
            stripeSubscriptionId: dbUser.stripeSubscriptionId
          });
        }

        if (!dbUser)
          throw new TRPCError({ code: 'UNAUTHORIZED' })

        // Check if user is already subscribed
        const isSubscribed = Boolean(
          dbUser.stripePriceId &&
          dbUser.stripeCurrentPeriodEnd &&
          dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
        )

        console.log('isSubscribed:', isSubscribed);

        if (
          isSubscribed &&
          dbUser.stripeCustomerId
        ) {
          console.log('User is already subscribed, creating billing portal session');
          const stripeSession =
            await stripe.billingPortal.sessions.create({
              customer: dbUser.stripeCustomerId,
              return_url: billingUrl,
            })

          console.log('Billing portal session created:', stripeSession.id);
          return { url: stripeSession.url }
        }

        const proPlan = PLANS.find(
          (plan) => plan.name === 'Pro'
        )

        console.log('Pro plan found:', !!proPlan)
        console.log('All PLANS:', JSON.stringify(PLANS, null, 2))

        if (!proPlan) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Pro plan not found in configuration' 
          })
        }

        const priceId = proPlan.price.priceIds.test

        console.log('Price ID from config:', priceId)
        console.log('Price ID length:', priceId?.length)
        console.log('Is price ID empty?:', !priceId || priceId.trim() === '')

        if (!priceId || priceId.trim() === '' || priceId === 'YOUR_PRICE_ID_HERE') {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: `Pro plan price ID is not configured or is empty. Current value: "${priceId}". Please update src/config/Stripe.ts with a valid Stripe price ID.` 
          })
        }

        console.log('Creating Stripe session with price ID:', priceId)

        try {
          const stripeSession =
            await stripe.checkout.sessions.create({
              success_url: billingUrl,
              cancel_url: billingUrl,
              mode: 'subscription', // Subscription mode for recurring payments
              line_items: [
                {
                  price: priceId,
                  quantity: 1,
                },
              ],
              metadata: {
                userId: userId,
              },
            })

          console.log('Stripe session created successfully:', stripeSession.id);
          console.log('Session URL:', stripeSession.url);
          console.log('Session metadata:', stripeSession.metadata);
          console.log('=== End createStripeSession Debug ===');
          return { url: stripeSession.url }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (stripeError: any) {
          console.error('Stripe API error details:', {
            message: stripeError.message,
            type: stripeError.type,
            code: stripeError.code,
            statusCode: stripeError.statusCode,
            raw: stripeError.raw
          })
          throw stripeError
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('Error creating Stripe session:', error)
        
        // Provide more helpful error messages
        let errorMessage = 'Failed to create Stripe session'
        
        if (error.message?.includes('recurring price')) {
          errorMessage = `The price ID is not valid or not set up as a recurring subscription in your Stripe account. Please verify the price ID in your Stripe dashboard and update src/config/Stripe.ts`
        } else if (error.message) {
          errorMessage = error.message
        }
        
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: errorMessage 
        })
      }
    }
  ),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      const messages = await db.message.findMany({
        take: limit,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          createdAt: true,
          text: true,
          isUsermessage: true,
        },
      });

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });
      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
     

      let nextcursor: typeof cursor | undefined = undefined;
      if (( messages).length > limit) {
        const nextitem = ( messages).pop();
        nextcursor = nextitem?.id;
      }

      return {
        messages,
        nextcursor,
      };
    }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found in context",
      });
    }

    const files = await db.file.findMany({
      where: { userId },
    });

    return files;
  }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });
      if (!file) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return file;
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),
});

export type AppRouter = typeof appRouter;
