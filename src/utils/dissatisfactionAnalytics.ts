import { FormData } from "@/types/form";

// SQD Descriptions
const SQD_DESCRIPTIONS: Record<string, string> = {
  sqd0: "I am satisfied with the service I availed",
  sqd1: "I spent a reasonable amount of time for my transaction",
  sqd2: "The office followed the transaction's requirements and steps",
  sqd3: "The steps I needed to do for my transaction were easy and simple",
  sqd4: "I easily found information about my transaction",
  sqd5: "I paid a reasonable amount of fees for my transaction",
  sqd6: "I feel the office was fair to everyone ('walang palakasan')",
  sqd7: "I was treated courteously by the staff",
  sqd8: "I got what I needed from the government office",
};

// Interfaces
export interface DissatisfactionSummary {
  totalResponses: number;
  totalDissatisfied: number;
  dissatisfactionRate: string;
  mostProblematicDimension: string;
  officeWithMostIssues: string;
  totalNegativeRatings: number;
  totalNeutralRatings: number;
}

export interface SQDDissatisfactionRow {
  dimension: string;
  description: string;
  stronglyDisagree: number;
  disagree: number;
  neither: number;
  totalNegative: number;
  negativePercentage: string;
  totalNeutralNegative: number;
  neutralNegativePercentage: string;
  validResponses: number;
}

export interface OfficeDissatisfactionRow {
  office: string;
  campus: string;
  totalResponses: number;
  dissatisfiedResponses: number;
  dissatisfactionRate: string;
  avgNegativeRating: string;
  topIssues: string[];
  commentsCount: number;
}

export interface CCIssuesRow {
  category: string;
  issue: string;
  count: number;
  percentage: string;
  affectedOffices: string[];
}

export interface CommentAnalysis {
  timestamp: string;
  campus: string;
  office: string;
  clientType: string;
  documentNumber: string;
  comment: string;
  hasDissatisfaction: boolean;
  problematicDimensions: string[];
}

export interface DemographicDissatisfaction {
  category: string;
  value: string;
  totalResponses: number;
  dissatisfiedCount: number;
  dissatisfactionRate: string;
}

export interface TrendData {
  date: string;
  totalResponses: number;
  dissatisfiedResponses: number;
  dissatisfactionRate: string;
}

// Helper: Check if response is negative (D or SD)
const isNegative = (value: string): boolean => {
  return value === "2" || value === "1"; // 2=D, 1=SD
};

// Helper: Check if response is neutral
const isNeutral = (value: string): boolean => {
  return value === "3"; // ND
};

// Helper: Check if response has any dissatisfaction
const hasDissatisfaction = (row: FormData): boolean => {
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"] as const;
  return sqdFields.some(field => isNegative(row[field]));
};

// Helper: Get problematic dimensions for a response
const getProblematicDimensions = (row: FormData): string[] => {
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"] as const;
  return sqdFields
    .filter(field => isNegative(row[field]))
    .map(field => field.toUpperCase());
};

// Generate Summary
export function generateDissatisfactionSummary(data: FormData[]): DissatisfactionSummary {
  if (data.length === 0) {
    return {
      totalResponses: 0,
      totalDissatisfied: 0,
      dissatisfactionRate: "0.00",
      mostProblematicDimension: "N/A",
      officeWithMostIssues: "N/A",
      totalNegativeRatings: 0,
      totalNeutralRatings: 0,
    };
  }

  const dissatisfiedResponses = data.filter(hasDissatisfaction);
  
  // Count negative ratings per dimension
  const dimensionCounts: Record<string, number> = {};
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"] as const;
  
  let totalNegative = 0;
  let totalNeutral = 0;
  
  sqdFields.forEach(field => {
    dimensionCounts[field] = 0;
  });
  
  data.forEach(row => {
    sqdFields.forEach(field => {
      if (isNegative(row[field])) {
        dimensionCounts[field]++;
        totalNegative++;
      }
      if (isNeutral(row[field])) {
        totalNeutral++;
      }
    });
  });
  
  // Find most problematic dimension
  let maxCount = 0;
  let worstDimension = "sqd0";
  Object.entries(dimensionCounts).forEach(([dim, count]) => {
    if (count > maxCount) {
      maxCount = count;
      worstDimension = dim;
    }
  });
  
  // Count dissatisfaction by office
  const officeCounts: Record<string, number> = {};
  dissatisfiedResponses.forEach(row => {
    if (!officeCounts[row.office]) officeCounts[row.office] = 0;
    officeCounts[row.office]++;
  });
  
  let worstOffice = "N/A";
  let maxOfficeCount = 0;
  Object.entries(officeCounts).forEach(([office, count]) => {
    if (count > maxOfficeCount) {
      maxOfficeCount = count;
      worstOffice = office;
    }
  });
  
  return {
    totalResponses: data.length,
    totalDissatisfied: dissatisfiedResponses.length,
    dissatisfactionRate: ((dissatisfiedResponses.length / data.length) * 100).toFixed(2),
    mostProblematicDimension: `${worstDimension.toUpperCase()} (${maxCount} issues)`,
    officeWithMostIssues: worstOffice !== "N/A" ? `${worstOffice} (${maxOfficeCount} cases)` : "N/A",
    totalNegativeRatings: totalNegative,
    totalNeutralRatings: totalNeutral,
  };
}

// Generate SQD Dissatisfaction Table
export function generateSQDDissatisfactionTable(data: FormData[]): SQDDissatisfactionRow[] {
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"] as const;
  
  const rows: SQDDissatisfactionRow[] = sqdFields.map(field => {
    let sd = 0, d = 0, nd = 0, valid = 0;
    
    data.forEach(row => {
      const value = row[field];
      if (value && value !== "6") { // 6 = N/A
        valid++;
        if (value === "1") sd++;
        else if (value === "2") d++;
        else if (value === "3") nd++;
      }
    });
    
    const totalNegative = sd + d;
    const totalNeutralNegative = sd + d + nd;
    
    return {
      dimension: field.toUpperCase(),
      description: SQD_DESCRIPTIONS[field],
      stronglyDisagree: sd,
      disagree: d,
      neither: nd,
      totalNegative,
      negativePercentage: valid > 0 ? ((totalNegative / valid) * 100).toFixed(2) : "0.00",
      totalNeutralNegative,
      neutralNegativePercentage: valid > 0 ? ((totalNeutralNegative / valid) * 100).toFixed(2) : "0.00",
      validResponses: valid,
    };
  });
  
  // Sort by negative percentage (worst first)
  return rows.sort((a, b) => parseFloat(b.negativePercentage) - parseFloat(a.negativePercentage));
}

// Generate Office Dissatisfaction Table
export function generateOfficeDissatisfactionTable(data: FormData[]): OfficeDissatisfactionRow[] {
  const officeMap: Record<string, FormData[]> = {};
  
  data.forEach(row => {
    if (!officeMap[row.office]) officeMap[row.office] = [];
    officeMap[row.office].push(row);
  });
  
  const rows: OfficeDissatisfactionRow[] = Object.entries(officeMap).map(([office, records]) => {
    const dissatisfied = records.filter(hasDissatisfaction);
    const commentsCount = records.filter(r => r.comments && r.comments.trim() !== "").length;
    
    // Find top issues for this office
    const issueCounts: Record<string, number> = {};
    const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"] as const;
    
    records.forEach(row => {
      sqdFields.forEach(field => {
        if (isNegative(row[field])) {
          if (!issueCounts[field]) issueCounts[field] = 0;
          issueCounts[field]++;
        }
      });
    });
    
    const topIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([field]) => field.toUpperCase());
    
    // Calculate average rating for negative responses
    let totalNegativeRatings = 0;
    let negativeCount = 0;
    dissatisfied.forEach(row => {
      sqdFields.forEach(field => {
        const val = parseInt(row[field]);
        if (val === 1 || val === 2) {
          totalNegativeRatings += val;
          negativeCount++;
        }
      });
    });
    
    const campus = records[0]?.campus || "";
    
    return {
      office,
      campus,
      totalResponses: records.length,
      dissatisfiedResponses: dissatisfied.length,
      dissatisfactionRate: ((dissatisfied.length / records.length) * 100).toFixed(2),
      avgNegativeRating: negativeCount > 0 ? (totalNegativeRatings / negativeCount).toFixed(2) : "N/A",
      topIssues,
      commentsCount,
    };
  });
  
  // Sort by dissatisfaction rate (worst first)
  return rows.sort((a, b) => parseFloat(b.dissatisfactionRate) - parseFloat(a.dissatisfactionRate));
}

// Generate CC Issues Analysis
export function generateCCIssuesAnalysis(data: FormData[]): CCIssuesRow[] {
  const issues: CCIssuesRow[] = [];
  
  // CC2: Visibility issues (3 = Difficult to see, 4 = Not visible at all)
  const cc2Difficult = data.filter(d => d.cc2 === "3");
  const cc2NotVisible = data.filter(d => d.cc2 === "4");
  
  // CC3: Helpfulness issues (3 = Did not help)
  const cc3NotHelp = data.filter(d => d.cc3 === "3");
  
  // CC1: Awareness issues (4, 5 = N/A or don't know)
  const cc1Unknown = data.filter(d => d.cc1 === "4" || d.cc1 === "5");
  
  const getAffectedOffices = (records: FormData[]): string[] => {
    return Array.from(new Set(records.map(r => r.office))).slice(0, 5);
  };
  
  if (cc2Difficult.length > 0) {
    issues.push({
      category: "CC2 - Visibility",
      issue: "Charter is difficult to see",
      count: cc2Difficult.length,
      percentage: ((cc2Difficult.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc2Difficult),
    });
  }
  
  if (cc2NotVisible.length > 0) {
    issues.push({
      category: "CC2 - Visibility",
      issue: "Charter is not visible at all",
      count: cc2NotVisible.length,
      percentage: ((cc2NotVisible.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc2NotVisible),
    });
  }
  
  if (cc3NotHelp.length > 0) {
    issues.push({
      category: "CC3 - Helpfulness",
      issue: "Charter did not help the client",
      count: cc3NotHelp.length,
      percentage: ((cc3NotHelp.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc3NotHelp),
    });
  }
  
  if (cc1Unknown.length > 0) {
    issues.push({
      category: "CC1 - Awareness",
      issue: "Client does not know about Citizen's Charter",
      count: cc1Unknown.length,
      percentage: ((cc1Unknown.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc1Unknown),
    });
  }
  
  // Sort by count (most issues first)
  return issues.sort((a, b) => b.count - a.count);
}

// Generate Comments List
export function generateCommentsList(data: FormData[]): CommentAnalysis[] {
  return data
    .filter(row => row.comments && row.comments.trim() !== "")
    .map(row => ({
      timestamp: row.timestamp,
      campus: row.campus,
      office: row.office,
      clientType: row.clientType,
      documentNumber: row.documentNumber,
      comment: row.comments,
      hasDissatisfaction: hasDissatisfaction(row),
      problematicDimensions: getProblematicDimensions(row),
    }))
    .sort((a, b) => {
      // Show dissatisfied comments first
      if (a.hasDissatisfaction && !b.hasDissatisfaction) return -1;
      if (!a.hasDissatisfaction && b.hasDissatisfaction) return 1;
      return 0;
    });
}

// Generate Demographic Dissatisfaction
export function generateDemographicDissatisfaction(data: FormData[]): {
  byAgeGroup: DemographicDissatisfaction[];
  bySex: DemographicDissatisfaction[];
  byClientType: DemographicDissatisfaction[];
} {
  const calculateForCategory = (
    category: string,
    getValue: (row: FormData) => string
  ): DemographicDissatisfaction[] => {
    const groups: Record<string, { total: number; dissatisfied: number }> = {};
    
    data.forEach(row => {
      const value = getValue(row) || "Unknown";
      if (!groups[value]) groups[value] = { total: 0, dissatisfied: 0 };
      groups[value].total++;
      if (hasDissatisfaction(row)) groups[value].dissatisfied++;
    });
    
    return Object.entries(groups)
      .map(([value, counts]) => ({
        category,
        value,
        totalResponses: counts.total,
        dissatisfiedCount: counts.dissatisfied,
        dissatisfactionRate: counts.total > 0 
          ? ((counts.dissatisfied / counts.total) * 100).toFixed(2) 
          : "0.00",
      }))
      .sort((a, b) => parseFloat(b.dissatisfactionRate) - parseFloat(a.dissatisfactionRate));
  };
  
  return {
    byAgeGroup: calculateForCategory("Age Group", row => row.ageGroup),
    bySex: calculateForCategory("Sex", row => row.sex),
    byClientType: calculateForCategory("Client Type", row => row.clientType),
  };
}

// Generate Trend Data
export function generateDissatisfactionTrends(data: FormData[]): TrendData[] {
  const dateMap: Record<string, { total: number; dissatisfied: number }> = {};
  
  data.forEach(row => {
    // Extract date from timestamp (assuming format includes date)
    const date = row.timestamp.split(" ")[0] || row.timestamp.split("T")[0];
    if (!dateMap[date]) dateMap[date] = { total: 0, dissatisfied: 0 };
    dateMap[date].total++;
    if (hasDissatisfaction(row)) dateMap[date].dissatisfied++;
  });
  
  return Object.entries(dateMap)
    .map(([date, counts]) => ({
      date,
      totalResponses: counts.total,
      dissatisfiedResponses: counts.dissatisfied,
      dissatisfactionRate: counts.total > 0 
        ? ((counts.dissatisfied / counts.total) * 100).toFixed(2)
        : "0.00",
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
