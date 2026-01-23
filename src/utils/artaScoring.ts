import { FormData } from "@/types/form";

// ============================================
// ARTA-Compliant Scoring and Interpretation
// Based on ARTA Memorandum Circular No. 2022-05
// ============================================

// Interpretation Categories (per ARTA guidelines)
export type InterpretationLevel = 
  | "Very High" 
  | "High" 
  | "Moderate" 
  | "Low" 
  | "Very Low"
  | "N/A";

export interface InterpretationResult {
  score: number;
  level: InterpretationLevel;
  description: string;
}

// Get interpretation level based on score (0-100 scale)
export const getInterpretation = (score: number): InterpretationLevel => {
  if (score >= 90) return "Very High";
  if (score >= 80) return "High";
  if (score >= 70) return "Moderate";
  if (score >= 60) return "Low";
  return "Very Low";
};

// Get interpretation with description
export const getInterpretationWithDescription = (
  score: number, 
  metricType: "awareness" | "visibility" | "helpfulness" | "serviceQuality"
): InterpretationResult => {
  const level = getInterpretation(score);
  const descriptions: Record<typeof metricType, Record<InterpretationLevel, string>> = {
    awareness: {
      "Very High": "Excellent dissemination of the Citizen's Charter",
      "High": "Good awareness, minor improvements possible",
      "Moderate": "Adequate awareness, consider enhanced outreach",
      "Low": "Low awareness, needs immediate attention",
      "Very Low": "Very low awareness, urgent action required",
      "N/A": "No data available",
    },
    visibility: {
      "Very High": "Charter is prominently displayed and easy to find",
      "High": "Good visibility with some improvements possible",
      "Moderate": "Moderate visibility, consider better placement",
      "Low": "Poor visibility, needs better display solutions",
      "Very Low": "Very poor visibility, urgent signage improvements needed",
      "N/A": "No data available",
    },
    helpfulness: {
      "Very High": "Charter is extremely helpful to clients",
      "High": "Charter is helpful with minor improvements possible",
      "Moderate": "Moderate helpfulness, consider simplification",
      "Low": "Limited helpfulness, needs content review",
      "Very Low": "Not helpful, urgent content revision needed",
      "N/A": "No data available",
    },
    serviceQuality: {
      "Very High": "Excellent service quality",
      "High": "Good service quality",
      "Moderate": "Adequate service quality",
      "Low": "Below standard service quality",
      "Very Low": "Poor service quality, urgent improvement needed",
      "N/A": "No data available",
    },
  };
  
  return {
    score,
    level,
    description: descriptions[metricType][level],
  };
};

// Color coding for scores
export const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 80) return "text-blue-600 dark:text-blue-400";
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 60) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 90) return "bg-green-50 dark:bg-green-900/20";
  if (score >= 80) return "bg-blue-50 dark:bg-blue-900/20";
  if (score >= 70) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (score >= 60) return "bg-orange-50 dark:bg-orange-900/20";
  return "bg-red-50 dark:bg-red-900/20";
};

// ============================================
// Citizen's Charter (CC) Scoring
// ============================================

// CC1: Awareness Score
// % Awareness = (Respondents who selected 1, 2, or 3) ÷ (Total respondents) × 100
export const calculateCC1AwarenessScore = (data: FormData[]): number => {
  if (data.length === 0) return 0;
  
  // Options 1, 2, 3 indicate some level of awareness
  // Option 4, 5 = N/A or don't know
  const aware = data.filter(d => ["1", "2", "3"].includes(d.cc1)).length;
  return (aware / data.length) * 100;
};

// CC2: Visibility Score
// % Visibility = (Respondents who selected 1 or 2) ÷ (Aware respondents) × 100
export const calculateCC2VisibilityScore = (data: FormData[]): number => {
  // Only count respondents who are aware (CC1 = 1, 2, or 3)
  const awareRespondents = data.filter(d => ["1", "2", "3"].includes(d.cc1));
  if (awareRespondents.length === 0) return 0;
  
  // Options 1 = Easy to see, 2 = Somewhat easy to see
  const visible = awareRespondents.filter(d => ["1", "2"].includes(d.cc2)).length;
  return (visible / awareRespondents.length) * 100;
};

// CC3: Helpfulness Score
// % Helpfulness = (Respondents who selected 1 or 2) ÷ (Respondents who saw CC) × 100
export const calculateCC3HelpfulnessScore = (data: FormData[]): number => {
  // Only count respondents who saw the CC (CC1 = 1 or 3, meaning they saw it)
  const sawCharter = data.filter(d => ["1", "3"].includes(d.cc1));
  if (sawCharter.length === 0) return 0;
  
  // Options 1 = Helped very much, 2 = Somewhat helped
  const helpful = sawCharter.filter(d => ["1", "2"].includes(d.cc3)).length;
  return (helpful / sawCharter.length) * 100;
};

// ============================================
// Service Quality Dimensions (SQD) Scoring
// ============================================

// SQD Labels
export const SQD_LABELS: Record<string, { code: string; dimension: string; question: string }> = {
  sqd0: { 
    code: "SQD0", 
    dimension: "Overall Satisfaction", 
    question: "I am satisfied with the service I availed." 
  },
  sqd1: { 
    code: "SQD1", 
    dimension: "Responsiveness", 
    question: "I spent a reasonable amount of time for my transaction." 
  },
  sqd2: { 
    code: "SQD2", 
    dimension: "Reliability", 
    question: "The office followed the transaction's requirements and steps based on the information provided." 
  },
  sqd3: { 
    code: "SQD3", 
    dimension: "Access & Facilities", 
    question: "The steps (including payment) I needed to do for my transaction were easy and simple." 
  },
  sqd4: { 
    code: "SQD4", 
    dimension: "Communication", 
    question: "I easily found information about my transaction from the office or its website." 
  },
  sqd5: { 
    code: "SQD5", 
    dimension: "Costs", 
    question: "I paid a reasonable amount of fees for my transaction." 
  },
  sqd6: { 
    code: "SQD6", 
    dimension: "Integrity", 
    question: "I feel the office was fair to everyone, or 'walang palakasan', during my transaction." 
  },
  sqd7: { 
    code: "SQD7", 
    dimension: "Assurance", 
    question: "I was treated courteously by the staff, and (if asked for help) the staff was helpful." 
  },
  sqd8: { 
    code: "SQD8", 
    dimension: "Outcome", 
    question: "I got what I needed from the government office, or if denied, denial was sufficiently explained to me." 
  },
};

// SQD Scoring
// % Favorable = (% of respondents who selected "Agree (4)" or "Strongly Agree (5)") × 100
export const calculateSQDFavorableScore = (data: FormData[], sqdField: string): number => {
  // Filter out NA responses
  const validResponses = data.filter(d => 
    d[sqdField as keyof FormData] && 
    d[sqdField as keyof FormData] !== "NA"
  );
  
  if (validResponses.length === 0) return 0;
  
  // Count Agree (A) and Strongly Agree (SA)
  const favorable = validResponses.filter(d => 
    ["A", "SA"].includes(d[sqdField as keyof FormData] as string)
  ).length;
  
  return (favorable / validResponses.length) * 100;
};

// Calculate overall SQD score (average of all 9 dimensions)
export const calculateOverallSQDScore = (data: FormData[]): number => {
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"];
  const scores = sqdFields.map(field => calculateSQDFavorableScore(data, field));
  const validScores = scores.filter(s => s > 0);
  
  if (validScores.length === 0) return 0;
  return validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
};

// ============================================
// Office-Level Analysis
// ============================================

export interface OfficeMetrics {
  office: string;
  totalResponses: number;
  cc1Score: number;
  cc1Interpretation: InterpretationLevel;
  cc2Score: number;
  cc2Interpretation: InterpretationLevel;
  cc3Score: number;
  cc3Interpretation: InterpretationLevel;
  sqdScores: Record<string, number>;
  sqdInterpretations: Record<string, InterpretationLevel>;
  overallSQDScore: number;
  overallSQDInterpretation: InterpretationLevel;
}

export const calculateOfficeMetrics = (data: FormData[]): OfficeMetrics[] => {
  // Group by office
  const officeGroups: Record<string, FormData[]> = {};
  data.forEach(row => {
    if (!row.office) return;
    if (!officeGroups[row.office]) officeGroups[row.office] = [];
    officeGroups[row.office].push(row);
  });
  
  return Object.entries(officeGroups).map(([office, records]) => {
    const cc1Score = calculateCC1AwarenessScore(records);
    const cc2Score = calculateCC2VisibilityScore(records);
    const cc3Score = calculateCC3HelpfulnessScore(records);
    
    const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"];
    const sqdScores: Record<string, number> = {};
    const sqdInterpretations: Record<string, InterpretationLevel> = {};
    
    sqdFields.forEach(field => {
      const score = calculateSQDFavorableScore(records, field);
      sqdScores[field] = score;
      sqdInterpretations[field] = getInterpretation(score);
    });
    
    const overallSQDScore = calculateOverallSQDScore(records);
    
    return {
      office,
      totalResponses: records.length,
      cc1Score,
      cc1Interpretation: getInterpretation(cc1Score),
      cc2Score,
      cc2Interpretation: getInterpretation(cc2Score),
      cc3Score,
      cc3Interpretation: getInterpretation(cc3Score),
      sqdScores,
      sqdInterpretations,
      overallSQDScore,
      overallSQDInterpretation: getInterpretation(overallSQDScore),
    };
  }).sort((a, b) => b.totalResponses - a.totalResponses);
};

// ============================================
// Summary Statistics
// ============================================

export interface SummaryStatistics {
  totalResponses: number;
  campusCount: number;
  officeCount: number;
  // CC Scores
  overallAwareness: number;
  awarenessInterpretation: InterpretationLevel;
  overallVisibility: number;
  visibilityInterpretation: InterpretationLevel;
  overallHelpfulness: number;
  helpfulnessInterpretation: InterpretationLevel;
  // SQD Scores
  overallSQD: number;
  overallSQDInterpretation: InterpretationLevel;
  sqdByDimension: Array<{
    code: string;
    dimension: string;
    score: number;
    interpretation: InterpretationLevel;
  }>;
  // Problem areas (scores below 70)
  problemAreas: Array<{
    area: string;
    score: number;
    type: "CC" | "SQD";
  }>;
}

export const calculateSummaryStatistics = (data: FormData[]): SummaryStatistics => {
  if (data.length === 0) {
    return {
      totalResponses: 0,
      campusCount: 0,
      officeCount: 0,
      overallAwareness: 0,
      awarenessInterpretation: "N/A",
      overallVisibility: 0,
      visibilityInterpretation: "N/A",
      overallHelpfulness: 0,
      helpfulnessInterpretation: "N/A",
      overallSQD: 0,
      overallSQDInterpretation: "N/A",
      sqdByDimension: [],
      problemAreas: [],
    };
  }
  
  const campuses = new Set(data.map(d => d.campus).filter(Boolean));
  const offices = new Set(data.map(d => d.office).filter(Boolean));
  
  const overallAwareness = calculateCC1AwarenessScore(data);
  const overallVisibility = calculateCC2VisibilityScore(data);
  const overallHelpfulness = calculateCC3HelpfulnessScore(data);
  const overallSQD = calculateOverallSQDScore(data);
  
  const sqdFields = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"];
  const sqdByDimension = sqdFields.map(field => {
    const score = calculateSQDFavorableScore(data, field);
    return {
      code: SQD_LABELS[field].code,
      dimension: SQD_LABELS[field].dimension,
      score,
      interpretation: getInterpretation(score),
    };
  });
  
  // Identify problem areas
  const problemAreas: Array<{ area: string; score: number; type: "CC" | "SQD" }> = [];
  
  if (overallAwareness < 70) {
    problemAreas.push({ area: "CC1 - Awareness", score: overallAwareness, type: "CC" });
  }
  if (overallVisibility < 70) {
    problemAreas.push({ area: "CC2 - Visibility", score: overallVisibility, type: "CC" });
  }
  if (overallHelpfulness < 70) {
    problemAreas.push({ area: "CC3 - Helpfulness", score: overallHelpfulness, type: "CC" });
  }
  
  sqdByDimension.forEach(sqd => {
    if (sqd.score < 70) {
      problemAreas.push({ area: `${sqd.code} - ${sqd.dimension}`, score: sqd.score, type: "SQD" });
    }
  });
  
  // Sort by score (worst first)
  problemAreas.sort((a, b) => a.score - b.score);
  
  return {
    totalResponses: data.length,
    campusCount: campuses.size,
    officeCount: offices.size,
    overallAwareness,
    awarenessInterpretation: getInterpretation(overallAwareness),
    overallVisibility,
    visibilityInterpretation: getInterpretation(overallVisibility),
    overallHelpfulness,
    helpfulnessInterpretation: getInterpretation(overallHelpfulness),
    overallSQD,
    overallSQDInterpretation: getInterpretation(overallSQD),
    sqdByDimension,
    problemAreas,
  };
};

// ============================================
// Demographic Analysis
// ============================================

export interface DemographicBreakdown {
  category: string;
  value: string;
  count: number;
  percentage: number;
  overallSQDScore: number;
  interpretation: InterpretationLevel;
}

export const calculateDemographicBreakdown = (
  data: FormData[], 
  field: "clientType" | "sex" | "ageGroup"
): DemographicBreakdown[] => {
  const groups: Record<string, FormData[]> = {};
  
  data.forEach(row => {
    const value = row[field] || "Unknown";
    if (!groups[value]) groups[value] = [];
    groups[value].push(row);
  });
  
  const total = data.length;
  
  return Object.entries(groups)
    .map(([value, records]) => {
      const score = calculateOverallSQDScore(records);
      return {
        category: field === "clientType" ? "Client Type" : field === "sex" ? "Sex" : "Age Group",
        value,
        count: records.length,
        percentage: (records.length / total) * 100,
        overallSQDScore: score,
        interpretation: getInterpretation(score),
      };
    })
    .sort((a, b) => b.count - a.count);
};
