import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";

export async function GET(request) {
  try {
    const userOrError = requireRole(["admin"]);
    if (userOrError instanceof NextResponse) return userOrError;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const cases = db.collection("cases");

    const now = new Date();
    
    // 1. Average Pendency by Case Type (Bar Chart)
    const pendencyByType = await cases.aggregate([
      { $match: { status: { $ne: "closed" } } },
      { $group: { _id: "$caseType", avgPendency: { $avg: "$pendencyScore" } } },
      { $project: { caseType: "$_id", avgPendency: { $round: ["$avgPendency", 0] }, _id: 0 } },
      { $sort: { avgPendency: -1 } }
    ]).toArray();

    // 2. Cases Closed per Month (Line Chart) over the last 12 months
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const closedTrendsRaw = await cases.aggregate([
      { $match: { status: "closed", lastActionDate: { $gte: twelveMonthsAgo } } },
      { $group: { 
          _id: { 
            year: { $year: "$lastActionDate" }, 
            month: { $month: "$lastActionDate" } 
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray();

    // Backfill missing months for line chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const closedTrendsMap = {};
    closedTrendsRaw.forEach(item => {
      closedTrendsMap[`${item._id.year}-${item._id.month}`] = item.count;
    });

    const closedTrends = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      closedTrends.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        closed: closedTrendsMap[key] || 0
      });
    }

    // 3. Case Distribution by Status (Donut Chart)
    const statusDistributionRaw = await cases.aggregate([
      { $match: { status: { $ne: "closed" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    const statusDistribution = statusDistributionRaw.map(item => ({
      name: item._id.replace("_", " ").toUpperCase(),
      value: item.count
    }));

    // 4. Top 10 Stuck Cases (Table)
    const topStuckCases = await cases.find({ status: { $ne: "closed" } })
      .sort({ pendencyScore: -1 })
      .limit(10)
      .project({ caseNumber: 1, title: 1, caseType: 1, status: 1, pendencyScore: 1, adjournmentCount: 1 })
      .toArray();

    // 5. Summary Stats with Trends (Active Cases, Avg Disposal, Avg Adjournments, >1 Year Old)
    // Compute stats for current month and previous month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total Active Cases (snapshot is hard to compute dynamically without audit logs history, 
    // so we just show current total, and trend = closed this month vs filed this month)
    const activeCases = await cases.countDocuments({ status: { $ne: "closed" } });
    const casesFiledThisMonth = await cases.countDocuments({ filedDate: { $gte: startOfThisMonth } });
    const casesClosedThisMonth = await cases.countDocuments({ status: "closed", lastActionDate: { $gte: startOfThisMonth } });
    const activeTrend = casesFiledThisMonth - casesClosedThisMonth; // Positive means growing backlog

    // Average Time-to-Disposal for closed cases
    const disposalStats = await cases.aggregate([
      { $match: { status: "closed" } },
      { $project: {
          disposalTime: { $divide: [ { $subtract: ["$lastActionDate", "$filedDate"] }, 1000 * 60 * 60 * 24 ] },
          closedThisMonth: { $gte: ["$lastActionDate", startOfThisMonth] },
          closedLastMonth: { $and: [ { $gte: ["$lastActionDate", startOfLastMonth] }, { $lt: ["$lastActionDate", startOfThisMonth] } ] }
        }
      },
      { $group: {
          _id: null,
          avgOverall: { $avg: "$disposalTime" },
          avgThisMonth: { $avg: { $cond: ["$closedThisMonth", "$disposalTime", null] } },
          avgLastMonth: { $avg: { $cond: ["$closedLastMonth", "$disposalTime", null] } }
        }
      }
    ]).toArray();

    const avgDisposalDays = disposalStats[0]?.avgOverall || 0;
    const disposalTrend = (disposalStats[0]?.avgThisMonth || 0) - (disposalStats[0]?.avgLastMonth || 0);

    // Average Adjournments (active cases)
    const adjournStats = await cases.aggregate([
      { $match: { status: { $ne: "closed" } } },
      { $group: { _id: null, avgAdjournments: { $avg: "$adjournmentCount" } } }
    ]).toArray();
    const avgAdjournments = adjournStats[0]?.avgAdjournments || 0;
    const adjournTrend = 0; // Hard to compute trend for active snapshot without historical audit logs

    // Cases > 1 Year Old
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const olderCases = await cases.countDocuments({ status: { $ne: "closed" }, filedDate: { $lt: oneYearAgo } });

    const summary = {
      activeCases: { value: activeCases, trend: activeTrend },
      avgDisposal: { value: Math.round(avgDisposalDays), trend: Math.round(disposalTrend) },
      avgAdjournments: { value: avgAdjournments.toFixed(1), trend: adjournTrend },
      olderCases: { value: olderCases, trend: 0 }
    };

    return NextResponse.json({
      pendencyByType,
      closedTrends,
      statusDistribution,
      topStuckCases,
      summary
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
