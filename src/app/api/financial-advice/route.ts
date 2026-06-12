import { NextResponse } from "next/server";
import { getFinancialSnapshot, getMonthlyCashflow } from "@/lib/finance";

export async function GET() {
  try {
    const [snapshot, monthlyCashflow] = await Promise.all([
      getFinancialSnapshot(),
      getMonthlyCashflow(),
    ]);

    return NextResponse.json({
      month: {
        start: snapshot.month.start.toISOString(),
        end: snapshot.month.end.toISOString(),
      },
      daysRemaining: snapshot.daysRemaining,
      totals: {
        spendableIncome: snapshot.spendableIncome,
        incomeToDate: snapshot.incomeToDate,
        fixedProjected: snapshot.fixedProjected,
        installmentProjected: snapshot.installmentProjected,
        remainingInstallment: snapshot.remainingInstallment,
        debtProjected: snapshot.debtProjected,
        invoiceProjected: snapshot.invoiceProjected,
        outflowToDate: snapshot.outflowToDate,
        balanceNow: snapshot.balanceNow,
        projectedMonthEnd: snapshot.projectedMonthEnd,
      },
      healthyDailySpend: snapshot.healthyDailySpend,
      categoryAllocations: snapshot.categoryAllocations,
      monthlyDebts: snapshot.monthlyDebts,
      invoices: snapshot.invoices,
      recentTransactions: snapshot.transactions.slice(0, 8),
      monthlyCashflow,
    });
  } catch (error) {
    console.error("Error calculating financial advice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
