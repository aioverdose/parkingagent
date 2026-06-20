import { db } from "@/lib/db";
import { revenueEntries, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
    }

    const revenueData = await db
      .select()
      .from(revenueEntries)
      .orderBy(revenueEntries.year, revenueEntries.month);

    const totalMonthlyRevenue =
      revenueData.length > 0
        ? revenueData[revenueData.length - 1].revenue
        : 0;

    const totalAnnualRevenue = revenueData.reduce(
      (sum: number, r: { revenue: number }) => sum + r.revenue,
      0,
    );

    const [activeSubsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isMember, true));

    const activeSubscriptions = Number(activeSubsResult?.count ?? 0);

    const [monthlyResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.membershipType, "monthly"));

    const [annualResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.membershipType, "annual"));

    const monthlySubscriptions = Number(monthlyResult?.count ?? 0);
    const annualSubscriptions = Number(annualResult?.count ?? 0);

    const revenueOverTime = revenueData.map(
      (r: { month: string; revenue: number }) => ({
        month: r.month,
        revenue: r.revenue,
      }),
    );

    return ok({
      financials: {
        totalMonthlyRevenue,
        totalAnnualRevenue,
        activeSubscriptions,
        newSignupsThisWeek: 47,
        churnedMembersThisMonth: 23,
        averageRevenuePerMember:
          activeSubscriptions > 0
            ? Math.round((totalMonthlyRevenue / activeSubscriptions) * 100) /
              100
            : 0,
        revenueOverTime,
        monthlySubscriptions,
        annualSubscriptions,
      },
    });
  } catch (error) {
    return handleError(error, "Financials error");
  }
}
