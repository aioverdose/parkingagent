import { getCurrentUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/apiResponse";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return ok({ user: null }, 401);
    }
    return ok({ user });
  } catch {
    return err("Internal server error", 500);
  }
}
