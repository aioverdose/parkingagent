import { getCurrentUser } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return ok({ premium: false });
    }

    const isPremiumValid = user.isPremium && user.premiumUntil
      ? new Date(user.premiumUntil) > new Date()
      : false;

    return ok({
      premium: isPremiumValid,
      isPremium: user.isPremium,
      tier: user.tier || "free",
      premiumUntil: user.premiumUntil,
    });
  } catch {
    return err("Internal server error", 500);
  }
}
