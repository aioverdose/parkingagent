import { clearSessionCookie } from "@/lib/auth-server";
import { ok } from "@/lib/apiResponse";

export async function POST() {
  await clearSessionCookie();
  return ok({ success: true });
}
