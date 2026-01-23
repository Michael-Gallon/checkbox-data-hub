import { FormData } from "@/types/form";
import { 
  getInterpretation, 
  getScoreColor, 
  SQD_LABELS, 
  calculateSQDFavorableScore,
  calculateCC1AwarenessScore,
  calculateCC2VisibilityScore,
  calculateCC3HelpfulnessScore,
} from "@/utils/artaScoring";

// ============================================
// ARTA-Compliant Dissatisfaction Analysis
// Focuses on areas scoring below acceptable levels
// ============================================

// SQD Descriptions (for legacy compatibility)
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
  // ARTA-specific metrics
  lowestSQDScore: number;
  lowestSQDDimension: string;
  dimensionsBelowThreshold: number;
}

export interface SQDDissatisfactionRow {
  dimension: string;
  description: string;
  stronglyDisagree: number;
  disagree: number;
  neither: number;
  agree: number;
  stronglyAgree: number;
  totalNegative: number;
  negativePercentage: string;
  favorableScore: number;
  favorablePercentage: string;
  interpretation: string;
  validResponses: number;
  totalNeutralNegative: number;
  neutralNegativePercentage: string;
}

export interface OfficeDissatisfactionRow {
  office: string;
  campus: string;
  totalResponses: number;
  dissatisfiedResponses: number;
  dissatisfactionRate: string;
  overallSQDScore: number;
  interpretation: string;
  topIssues: string[];
  commentsCount: number;
}

export interface CCIssuesRow {
  category: string;
  issue: string;
  count: number;
  percentage: string;
  affectedOffices: string[];
  score: number;
  interpretation: string;
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
  overallSQDScore: number;
  interpretation: string;
}

export interface TrendData {
  date: string;
  totalResponses: number;
  dissatisfiedResponses: number;
  dissatisfactionRate: string;
  overallSQDScore: number;
}

// Helper: Check if response is negative (D or SD)
const isNegative = (value: string): boolean => {
  return value === "D" || value === "SD";
};

// Helper: Check if response is neutral
const isNeutral = (value: string): boolean => {
  return value === "ND";
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

// Calculate overall SQD score for a subset of data
const calculateOverallSQD = (data: FormData[]): number => {
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"];
  const scores = sqdFields.map(field => calculateSQDFavorableScore(data, field));
  const validScores = scores.filter(s => s > 0);
  if (validScores.length === 0) return 0;
  return validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
};

// Generate Summary with ARTA metrics
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
      lowestSQDScore: 0,
      lowestSQDDimension: "N/A",
      dimensionsBelowThreshold: 0,
    };
  }

  const dissatisfiedResponses = data.filter(hasDissatisfaction);
  
  // Count negative and neutral ratings
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"] as const;
  let totalNegative = 0;
  let totalNeutral = 0;
  
  const dimensionNegativeCounts: Record<string, number> = {};
  sqdFields.forEach(field => dimensionNegativeCounts[field] = 0);
  
  data.forEach(row => {
    sqdFields.forEach(field => {
      if (isNegative(row[field])) {
        dimensionNegativeCounts[field]++;
        totalNegative++;
      }
      if (isNeutral(row[field])) {
        totalNeutral++;
      }
    });
  });
  
  // Find dimension with most negative responses
  let maxNegativeCount = 0;
  let worstDimension = "sqd0";
  Object.entries(dimensionNegativeCounts).forEach(([dim, count]) => {
    if (count > maxNegativeCount) {
      maxNegativeCount = count;
      worstDimension = dim;
    }
  });
  
  // Find office with most dissatisfaction
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
  
  // ARTA-specific: Calculate SQD scores and find lowest
  const sqdScores = sqdFields.map(field => ({
    field,
    score: calculateSQDFavorableScore(data, field),
  }));
  
  const lowestSQD = sqdScores.reduce((min, curr) => 
    curr.score < min.score ? curr : min
  , sqdScores[0]);
  
  const dimensionsBelowThreshold = sqdScores.filter(s => s.score < 70).length;
  
  return {
    totalResponses: data.length,
    totalDissatisfied: dissatisfiedResponses.length,
    dissatisfactionRate: ((dissatisfiedResponses.length / data.length) * 100).toFixed(2),
    mostProblematicDimension: `${worstDimension.toUpperCase()} (${maxNegativeCount} negative)`,
    officeWithMostIssues: worstOffice !== "N/A" ? `${worstOffice} (${maxOfficeCount} cases)` : "N/A",
    totalNegativeRatings: totalNegative,
    totalNeutralRatings: totalNeutral,
    lowestSQDScore: lowestSQD.score,
    lowestSQDDimension: `${lowestSQD.field.toUpperCase()} - ${SQD_LABELS[lowestSQD.field]?.dimension || ""}`,
    dimensionsBelowThreshold,
  };
}

// Generate SQD Dissatisfaction Table with ARTA scoring
export function generateSQDDissatisfactionTable(data: FormData[]): SQDDissatisfactionRow[] {
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"] as const;
  
  const rows: SQDDissatisfactionRow[] = sqdFields.map(field => {
    let sd = 0, d = 0, nd = 0, a = 0, sa = 0, valid = 0;
    
    data.forEach(row => {
      const value = row[field];
      if (value && value !== "NA") {
        valid++;
        if (value === "SD") sd++;
        else if (value === "D") d++;
        else if (value === "ND") nd++;
        else if (value === "A") a++;
        else if (value === "SA") sa++;
      }
    });
    
    const totalNegative = sd + d;
    const totalNeutralNegative = sd + d + nd;
    const favorable = a + sa;
    const favorableScore = valid > 0 ? (favorable / valid) * 100 : 0;
    
    return {
      dimension: field.toUpperCase(),
      description: SQD_DESCRIPTIONS[field],
      stronglyDisagree: sd,
      disagree: d,
      neither: nd,
      agree: a,
      stronglyAgree: sa,
      totalNegative,
      negativePercentage: valid > 0 ? ((totalNegative / valid) * 100).toFixed(2) : "0.00",
      favorableScore,
      favorablePercentage: valid > 0 ? favorableScore.toFixed(2) : "0.00",
      interpretation: getInterpretation(favorableScore),
      totalNeutralNegative,
      neutralNegativePercentage: valid > 0 ? ((totalNeutralNegative / valid) * 100).toFixed(2) : "0.00",
      validResponses: valid,
    };
  });
  
  // Sort by favorable score (lowest first - worst performing)
  return rows.sort((a, b) => a.favorableScore - b.favorableScore);
}

// Generate Office Dissatisfaction Table with ARTA metrics
export function generateOfficeDissatisfactionTable(data: FormData[]): OfficeDissatisfactionRow[] {
  const officeMap: Record<string, FormData[]> = {};
  
  data.forEach(row => {
    if (!officeMap[row.office]) officeMap[row.office] = [];
    officeMap[row.office].push(row);
  });
  
  const rows: OfficeDissatisfactionRow[] = Object.entries(officeMap).map(([office, records]) => {
    const dissatisfied = records.filter(hasDissatisfaction);
    const commentsCount = records.filter(r => r.comments && r.comments.trim() !== "").length;
    
    // Calculate overall SQD score for this office
    const overallSQDScore = calculateOverallSQD(records);
    
    // Find top issues (dimensions with most negative responses)
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
      .filter(([_, count]) => count > 0)
      .map(([field]) => field.toUpperCase());
    
    const campus = records[0]?.campus || "";
    
    return {
      office,
      campus,
      totalResponses: records.length,
      dissatisfiedResponses: dissatisfied.length,
      dissatisfactionRate: ((dissatisfied.length / records.length) * 100).toFixed(2),
      overallSQDScore,
      interpretation: getInterpretation(overallSQDScore),
      topIssues,
      commentsCount,
    };
  });
  
  // Sort by SQD score (lowest first - worst performing)
  return rows.sort((a, b) => a.overallSQDScore - b.overallSQDScore);
}

// Generate CC Issues Analysis with ARTA scoring
export function generateCCIssuesAnalysis(data: FormData[]): CCIssuesRow[] {
  const issues: CCIssuesRow[] = [];
  
  // Calculate CC scores using ARTA methodology
  const cc1Score = calculateCC1AwarenessScore(data);
  const cc2Score = calculateCC2VisibilityScore(data);
  const cc3Score = calculateCC3HelpfulnessScore(data);
  
  // CC2: Visibility issues (3 = Difficult to see, 4 = Not visible at all)
  const cc2Difficult = data.filter(d => d.cc2 === "3");
  const cc2NotVisible = data.filter(d => d.cc2 === "4");
  
  // CC3: Helpfulness issues (3 = Did not help)
  const cc3NotHelp = data.filter(d => d.cc3 === "3");
  
  // CC1: Awareness issues (4, 5 = N/A or don't know)
  const cc1Unknown = data.filter(d => d.cc1 === "4" || d.cc1 === "5");
  
  const getAffectedOffices = (records: FormData[]): string[] => {
    return Array.from(new Set(records.map(r => r.office))).filter(Boolean).slice(0, 5);
  };
  
  // Add overall CC scores as issues if below threshold
  if (cc1Score < 80) {
    issues.push({
      category: "CC1 - Awareness",
      issue: `Overall awareness score is ${cc1Score.toFixed(1)}%`,
      count: cc1Unknown.length,
      percentage: ((cc1Unknown.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc1Unknown),
      score: cc1Score,
      interpretation: getInterpretation(cc1Score),
    });
  }
  
  if (cc2Score < 80) {
    const cc2Issues = [...cc2Difficult, ...cc2NotVisible];
    issues.push({
      category: "CC2 - Visibility",
      issue: `Overall visibility score is ${cc2Score.toFixed(1)}%`,
      count: cc2Issues.length,
      percentage: ((cc2Issues.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc2Issues),
      score: cc2Score,
      interpretation: getInterpretation(cc2Score),
    });
  }
  
  if (cc3Score < 80) {
    issues.push({
      category: "CC3 - Helpfulness",
      issue: `Overall helpfulness score is ${cc3Score.toFixed(1)}%`,
      count: cc3NotHelp.length,
      percentage: ((cc3NotHelp.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc3NotHelp),
      score: cc3Score,
      interpretation: getInterpretation(cc3Score),
    });
  }
  
  // Add specific visibility issues
  if (cc2Difficult.length > 0) {
    issues.push({
      category: "CC2 - Visibility",
      issue: "Charter is difficult to see",
      count: cc2Difficult.length,
      percentage: ((cc2Difficult.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc2Difficult),
      score: cc2Score,
      interpretation: getInterpretation(cc2Score),
    });
  }
  
  if (cc2NotVisible.length > 0) {
    issues.push({
      category: "CC2 - Visibility",
      issue: "Charter is not visible at all",
      count: cc2NotVisible.length,
      percentage: ((cc2NotVisible.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc2NotVisible),
      score: cc2Score,
      interpretation: getInterpretation(cc2Score),
    });
  }
  
  if (cc3NotHelp.length > 0) {
    issues.push({
      category: "CC3 - Helpfulness",
      issue: "Charter did not help the client",
      count: cc3NotHelp.length,
      percentage: ((cc3NotHelp.length / data.length) * 100).toFixed(2),
      affectedOffices: getAffectedOffices(cc3NotHelp),
      score: cc3Score,
      interpretation: getInterpretation(cc3Score),
    });
  }
  
  // Sort by score (lowest first)
  return issues.sort((a, b) => a.score - b.score);
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

// Generate Demographic Dissatisfaction with ARTA metrics
export function generateDemographicDissatisfaction(data: FormData[]): {
  byAgeGroup: DemographicDissatisfaction[];
  bySex: DemographicDissatisfaction[];
  byClientType: DemographicDissatisfaction[];
} {
  const calculateForCategory = (
    category: string,
    getValue: (row: FormData) => string
  ): DemographicDissatisfaction[] => {
    const groups: Record<string, FormData[]> = {};
    
    data.forEach(row => {
      const value = getValue(row) || "Unknown";
      if (!groups[value]) groups[value] = [];
      groups[value].push(row);
    });
    
    return Object.entries(groups)
      .map(([value, records]) => {
        const dissatisfiedCount = records.filter(hasDissatisfaction).length;
        const overallSQDScore = calculateOverallSQD(records);
        
        return {
          category,
          value,
          totalResponses: records.length,
          dissatisfiedCount,
          dissatisfactionRate: records.length > 0 
            ? ((dissatisfiedCount / records.length) * 100).toFixed(2) 
            : "0.00",
          overallSQDScore,
          interpretation: getInterpretation(overallSQDScore),
        };
      })
      .sort((a, b) => a.overallSQDScore - b.overallSQDScore); // Sort by SQD score (worst first)
  };
  
  return {
    byAgeGroup: calculateForCategory("Age Group", row => row.ageGroup),
    bySex: calculateForCategory("Sex", row => row.sex),
    byClientType: calculateForCategory("Client Type", row => row.clientType),
  };
}

// Generate Trend Data with ARTA metrics
export function generateDissatisfactionTrends(data: FormData[]): TrendData[] {
  const dateMap: Record<string, FormData[]> = {};
  
  data.forEach(row => {
    const date = row.timestamp.split(" ")[0] || row.timestamp.split("T")[0];
    if (!dateMap[date]) dateMap[date] = [];
    dateMap[date].push(row);
  });
  
  return Object.entries(dateMap)
    .map(([date, records]) => {
      const dissatisfiedCount = records.filter(hasDissatisfaction).length;
      const overallSQDScore = calculateOverallSQD(records);
      
      return {
        date,
        totalResponses: records.length,
        dissatisfiedResponses: dissatisfiedCount,
        dissatisfactionRate: records.length > 0 
          ? ((dissatisfiedCount / records.length) * 100).toFixed(2)
          : "0.00",
        overallSQDScore,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
