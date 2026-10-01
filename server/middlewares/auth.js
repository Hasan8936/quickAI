import { clerkClient } from "@clerk/express";

// Middleware to check userId and hasPremiumPlan
export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized. Please sign in." });
    }

    // server.js installs deterministic mock auth for local development when
    // Clerk is not configured. Do not call Clerk's API in that mode: the
    // lookup fails (often as a misleading 404) and blocks RAG requests.
    if (!process.env.CLERK_SECRET_KEY) {
      req.free_usage = 0;
      req.plan = "free";
      return next();
    }

    // Clerk Billing isn't enabled on this instance, so has({ plan }) throws
    // (e.g. "Not Found") instead of returning false. Treat that the same as
    // "not on the premium plan" instead of failing the whole request.
    let hasPremiumPlan = false;
    try {
      hasPremiumPlan = await has({ plan: "premium" });
    } catch (billingError) {
      console.log(
        "⚠️ Billing plan check unavailable, defaulting to free plan:",
        billingError.message
      );
      hasPremiumPlan = false;
    }

    const user = await clerkClient.users.getUser(userId).catch((err) => {
      console.error(`❌ clerkClient.users.getUser failed for userId=${userId}:`, err.message);
      throw err;
    });

    if (!hasPremiumPlan && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "premium" : "free";
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
