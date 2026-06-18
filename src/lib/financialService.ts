export interface RevenueEntry {
  month: string;
  revenue: number;
}

export interface FinancialData {
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
  activeSubscriptions: number;
  newSignupsThisWeek: number;
  churnedMembersThisMonth: number;
  averageRevenuePerMember: number;
  revenueOverTime: RevenueEntry[];
  monthlySubscriptions: number;
  annualSubscriptions: number;
}

let financialStore: FinancialData = {
  totalMonthlyRevenue: 18450,
  totalAnnualRevenue: 89200,
  activeSubscriptions: 1284,
  newSignupsThisWeek: 47,
  churnedMembersThisMonth: 23,
  averageRevenuePerMember: 14.37,
  monthlySubscriptions: 892,
  annualSubscriptions: 392,
  revenueOverTime: [
    { month: "Jan", revenue: 12400 },
    { month: "Feb", revenue: 13800 },
    { month: "Mar", revenue: 15200 },
    { month: "Apr", revenue: 16100 },
    { month: "May", revenue: 17500 },
    { month: "Jun", revenue: 18450 },
  ],
};

export function getFinancialData(): FinancialData {
  return { ...financialStore };
}

export function updateFinancialData(
  updates: Partial<FinancialData>
): FinancialData {
  financialStore = { ...financialStore, ...updates };
  return { ...financialStore };
}
