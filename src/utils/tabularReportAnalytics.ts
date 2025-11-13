import { FormData } from "@/types/form";

// Table 1: Consolidated Service Quality Dimension Results
export interface ConsolidatedSQDRow {
  dimension: string;
  description: string;
  stronglyAgree: number;
  agree: number;
  totalPositive: number;
  positivePercentage: string;
}

export function generateConsolidatedSQDTable(data: FormData[]): ConsolidatedSQDRow[] {
  const sqdDimensions = [
    { key: 'sqd0', description: 'Overall Satisfaction' },
    { key: 'sqd1', description: 'Responsiveness (Reasonable Time)' },
    { key: 'sqd2', description: 'Reliability (Followed Requirements)' },
    { key: 'sqd3', description: 'Access & Facilities (Easy Steps)' },
    { key: 'sqd4', description: 'Communication (Easy Information)' },
    { key: 'sqd5', description: 'Costs (Reasonable Fees)' },
    { key: 'sqd6', description: 'Integrity (Fairness/Walang Palakasan)' },
    { key: 'sqd7', description: 'Assurance (Courtesy/Helpfulness)' },
    { key: 'sqd8', description: 'Outcome (Got What I Needed)' },
  ];

  const results: ConsolidatedSQDRow[] = [];

  // Calculate CC Awareness
  const cc1Valid = data.filter(d => d.cc1 && d.cc1 !== 'NA' && d.cc1 !== '4' && d.cc1 !== '5');
  const cc1Aware = cc1Valid.filter(d => d.cc1 === '1').length;
  const cc1Percentage = cc1Valid.length > 0 ? ((cc1Aware / cc1Valid.length) * 100).toFixed(1) : '0.0';
  
  results.push({
    dimension: 'CC Awareness',
    description: "Citizen's Charter Awareness",
    stronglyAgree: cc1Aware,
    agree: 0,
    totalPositive: cc1Aware,
    positivePercentage: cc1Percentage,
  });

  // Calculate each SQD dimension
  sqdDimensions.forEach(({ key, description }) => {
    const validResponses = data.filter(d => {
      const value = d[key as keyof FormData];
      return value && value !== 'NA';
    });

    const stronglyAgree = validResponses.filter(d => d[key as keyof FormData] === 'SA').length;
    const agree = validResponses.filter(d => d[key as keyof FormData] === 'A').length;
    const totalPositive = stronglyAgree + agree;
    const percentage = validResponses.length > 0 
      ? ((totalPositive / validResponses.length) * 100).toFixed(1)
      : '0.0';

    results.push({
      dimension: key.toUpperCase(),
      description,
      stronglyAgree,
      agree,
      totalPositive,
      positivePercentage: percentage,
    });
  });

  return results;
}

// Table 2: External Services Performance Summary
export interface ExternalServicesRow {
  office: string;
  totalTransactions: number;
  totalResponses: number;
  responseRate: string;
  meanRating: string;
}

export function generateExternalServicesTable(
  data: FormData[], 
  transactionInputs?: Record<string, number>
): ExternalServicesRow[] {
  const officeGroups = data.reduce((acc, item) => {
    if (!acc[item.office]) {
      acc[item.office] = [];
    }
    acc[item.office].push(item);
    return acc;
  }, {} as Record<string, FormData[]>);

  const results: ExternalServicesRow[] = [];

  Object.entries(officeGroups).forEach(([office, items]) => {
    // Total responses = actual survey data we have
    const totalResponses = items.length;
    
    // Total transactions = user input OR default to totalResponses
    const totalTransactions = transactionInputs?.[office] ?? totalResponses;
    
    // Calculate response rate
    const responseRate = totalTransactions > 0 
      ? ((totalResponses / totalTransactions) * 100).toFixed(1)
      : '0.0';

    // Calculate mean SQD rating
    const sqdKeys = ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
    const sqdToNumber = (val: string): number => {
      switch(val) {
        case 'SA': return 5;
        case 'A': return 4;
        case 'ND': return 3;
        case 'D': return 2;
        case 'SD': return 1;
        default: return 0;
      }
    };

    let totalRating = 0;
    let ratingCount = 0;

    items.forEach(item => {
      sqdKeys.forEach(key => {
        const value = item[key as keyof FormData] as string;
        if (value && value !== 'NA') {
          totalRating += sqdToNumber(value);
          ratingCount++;
        }
      });
    });

    const meanRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : '0.00';

    results.push({
      office,
      totalTransactions,
      totalResponses,
      responseRate,
      meanRating,
    });
  });

  // Sort by total responses descending
  return results.sort((a, b) => b.totalResponses - a.totalResponses);
}

// Table 3: Client Type and Demographic Breakdown
export interface ClientTypeRow {
  customerType: string;
  externalClients: number;
  internalClients: number;
  overallClients: number;
  avgSQD: string;
}

export function generateClientTypeBreakdown(data: FormData[]): ClientTypeRow[] {
  const customerTypes = ['Citizen', 'Business', 'Government'];
  const results: ClientTypeRow[] = [];

  const sqdToNumber = (val: string): number => {
    switch(val) {
      case 'SA': return 5;
      case 'A': return 4;
      case 'ND': return 3;
      case 'D': return 2;
      case 'SD': return 1;
      default: return 0;
    }
  };

  customerTypes.forEach(type => {
    const typeData = data.filter(d => d.clientType?.includes(type));
    const externalClients = typeData.filter(d => d.clientType?.toLowerCase().includes('external')).length;
    const internalClients = typeData.filter(d => d.clientType?.toLowerCase().includes('internal')).length;
    const overallClients = typeData.length;

    // Calculate average SQD1-8
    const sqdKeys = ['sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
    let totalRating = 0;
    let ratingCount = 0;

    typeData.forEach(item => {
      sqdKeys.forEach(key => {
        const value = item[key as keyof FormData] as string;
        if (value && value !== 'NA') {
          totalRating += sqdToNumber(value);
          ratingCount++;
        }
      });
    });

    const avgSQD = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : '0.00';

    results.push({
      customerType: type,
      externalClients,
      internalClients,
      overallClients,
      avgSQD,
    });
  });

  // Add totals row
  const totalExternal = results.reduce((sum, r) => sum + r.externalClients, 0);
  const totalInternal = results.reduce((sum, r) => sum + r.internalClients, 0);
  const totalOverall = results.reduce((sum, r) => sum + r.overallClients, 0);

  // Calculate overall SQD average
  const sqdKeys = ['sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
  let totalRating = 0;
  let ratingCount = 0;

  data.forEach(item => {
    sqdKeys.forEach(key => {
      const value = item[key as keyof FormData] as string;
      if (value && value !== 'NA') {
        totalRating += sqdToNumber(value);
        ratingCount++;
      }
    });
  });

  const overallAvgSQD = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : '0.00';

  results.push({
    customerType: 'TOTAL',
    externalClients: totalExternal,
    internalClients: totalInternal,
    overallClients: totalOverall,
    avgSQD: overallAvgSQD,
  });

  return results;
}

// Table 4: Demographic Distribution
export interface DemographicRow {
  category: string;
  value: string;
  count: number;
  percentage: string;
  avgSatisfaction: string;
}

export function generateDemographicDistribution(data: FormData[]): {
  ageGroup: DemographicRow[];
  sex: DemographicRow[];
} {
  const sqdToNumber = (val: string): number => {
    switch(val) {
      case 'SA': return 5;
      case 'A': return 4;
      case 'ND': return 3;
      case 'D': return 2;
      case 'SD': return 1;
      default: return 0;
    }
  };

  const calculateAvgSatisfaction = (subset: FormData[]): string => {
    let totalRating = 0;
    let ratingCount = 0;

    subset.forEach(item => {
      ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'].forEach(key => {
        const value = item[key as keyof FormData] as string;
        if (value && value !== 'NA') {
          totalRating += sqdToNumber(value);
          ratingCount++;
        }
      });
    });

    return ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : '0.00';
  };

  // Age Group Distribution
  const ageGroups = Array.from(new Set(data.map(d => d.ageGroup).filter(Boolean)));
  const ageGroupData: DemographicRow[] = ageGroups.map(group => {
    const subset = data.filter(d => d.ageGroup === group);
    const count = subset.length;
    const percentage = ((count / data.length) * 100).toFixed(1);
    const avgSatisfaction = calculateAvgSatisfaction(subset);

    return {
      category: 'Age Group',
      value: group,
      count,
      percentage,
      avgSatisfaction,
    };
  });

  // Sex Distribution
  const sexCategories = Array.from(new Set(data.map(d => d.sex).filter(Boolean)));
  const sexData: DemographicRow[] = sexCategories.map(sex => {
    const subset = data.filter(d => d.sex === sex);
    const count = subset.length;
    const percentage = ((count / data.length) * 100).toFixed(1);
    const avgSatisfaction = calculateAvgSatisfaction(subset);

    return {
      category: 'Sex',
      value: sex,
      count,
      percentage,
      avgSatisfaction,
    };
  });

  return {
    ageGroup: ageGroupData,
    sex: sexData,
  };
}

// Table 5: Service Utilization and Satisfaction
export interface ServiceUtilizationRow {
  service: string;
  frequency: number;
  percentage: string;
  avgSatisfaction: string;
}

export function generateServiceUtilization(data: FormData[]): ServiceUtilizationRow[] {
  const sqdToNumber = (val: string): number => {
    switch(val) {
      case 'SA': return 5;
      case 'A': return 4;
      case 'ND': return 3;
      case 'D': return 2;
      case 'SD': return 1;
      default: return 0;
    }
  };

  const serviceGroups = data.reduce((acc, item) => {
    if (!acc[item.services]) {
      acc[item.services] = [];
    }
    acc[item.services].push(item);
    return acc;
  }, {} as Record<string, FormData[]>);

  const results: ServiceUtilizationRow[] = [];

  Object.entries(serviceGroups).forEach(([service, items]) => {
    const frequency = items.length;
    const percentage = ((frequency / data.length) * 100).toFixed(1);

    // Calculate average satisfaction
    let totalRating = 0;
    let ratingCount = 0;

    items.forEach(item => {
      ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'].forEach(key => {
        const value = item[key as keyof FormData] as string;
        if (value && value !== 'NA') {
          totalRating += sqdToNumber(value);
          ratingCount++;
        }
      });
    });

    const avgSatisfaction = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : '0.00';

    results.push({
      service,
      frequency,
      percentage,
      avgSatisfaction,
    });
  });

  // Sort by frequency descending
  return results.sort((a, b) => b.frequency - a.frequency).slice(0, 15); // Top 15 services
}

// Table 6: Campus-Level Performance Comparison
export interface CampusPerformanceRow {
  campus: string;
  totalResponses: number;
  awarenessRate: string;
  visibilityScore: string;
  helpfulnessRate: string;
  avgSQDRating: string;
}

export function generateCampusComparison(data: FormData[]): CampusPerformanceRow[] {
  const sqdToNumber = (val: string): number => {
    switch(val) {
      case 'SA': return 5;
      case 'A': return 4;
      case 'ND': return 3;
      case 'D': return 2;
      case 'SD': return 1;
      default: return 0;
    }
  };

  const campusGroups = data.reduce((acc, item) => {
    if (!acc[item.campus]) {
      acc[item.campus] = [];
    }
    acc[item.campus].push(item);
    return acc;
  }, {} as Record<string, FormData[]>);

  const results: CampusPerformanceRow[] = [];

  Object.entries(campusGroups).forEach(([campus, items]) => {
    const totalResponses = items.length;

    // CC1 Awareness Rate (response "1")
    const cc1Valid = items.filter(d => d.cc1 && d.cc1 !== 'NA' && d.cc1 !== '4' && d.cc1 !== '5');
    const cc1Aware = cc1Valid.filter(d => d.cc1 === '1').length;
    const awarenessRate = cc1Valid.length > 0 ? ((cc1Aware / cc1Valid.length) * 100).toFixed(1) : '0.0';

    // CC2 Visibility Score (responses "1" and "2" = easy to see)
    const cc2Valid = items.filter(d => d.cc2 && d.cc2 !== 'NA' && d.cc2 !== '5');
    const cc2Visible = cc2Valid.filter(d => d.cc2 === '1' || d.cc2 === '2').length;
    const visibilityScore = cc2Valid.length > 0 ? ((cc2Visible / cc2Valid.length) * 100).toFixed(1) : '0.0';

    // CC3 Helpfulness Rate (response "1" = helped very much)
    const cc3Valid = items.filter(d => d.cc3 && d.cc3 !== 'NA' && d.cc3 !== '4' && d.cc3 !== '5');
    const cc3Helpful = cc3Valid.filter(d => d.cc3 === '1').length;
    const helpfulnessRate = cc3Valid.length > 0 ? ((cc3Helpful / cc3Valid.length) * 100).toFixed(1) : '0.0';

    // Average SQD Rating
    let totalRating = 0;
    let ratingCount = 0;

    items.forEach(item => {
      ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'].forEach(key => {
        const value = item[key as keyof FormData] as string;
        if (value && value !== 'NA') {
          totalRating += sqdToNumber(value);
          ratingCount++;
        }
      });
    });

    const avgSQDRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : '0.00';

    results.push({
      campus,
      totalResponses,
      awarenessRate,
      visibilityScore,
      helpfulnessRate,
      avgSQDRating,
    });
  });

  // Sort by total responses descending
  return results.sort((a, b) => b.totalResponses - a.totalResponses);
}
