import { FormData } from "@/types/form";

export interface SQDRow {
  dimension: string;
  description: string;
  stronglyAgree: number;
  agree: number;
  totalPositive: string;
}

export interface OfficePerformanceRow {
  office: string;
  totalTransactions: number;
  totalResponses: number;
  responseRate: string;
  clientMeanRating: string;
}

export interface ClientTypeRow {
  customerType: string;
  externalClients: number;
  internalClients: number;
  overallClients: number;
}

export interface DemographicRow {
  category: string;
  male: number;
  female: number;
  total: number;
  percentage: string;
}

export interface ServiceUtilizationRow {
  service: string;
  count: number;
  percentage: string;
  avgSatisfaction: string;
}

export interface CampusComparisonRow {
  campus: string;
  totalResponses: number;
  avgSQD: string;
  ccAwareness: string;
  topService: string;
}

// Convert SQD responses to numbers (1-5 scale)
const convertSQDToNumber = (sqd: string): number | null => {
  const map: { [key: string]: number } = {
    "Strongly Disagree": 1,
    "Disagree": 2,
    "Neither Agree nor Disagree": 3,
    "Agree": 4,
    "Strongly Agree": 5,
  };
  return map[sqd] ?? null;
};

// Convert CC responses to numbers
const convertCCToNumber = (cc: string): number | null => {
  const map: { [key: string]: number } = {
    "No, I don't know": 1,
    "Not sure": 2,
    "Aware but not read": 3,
    "Yes, aware and read": 4,
    "Very easy to locate": 5,
    "Easy to locate": 4,
    "Neutral": 3,
    "Hard to locate": 2,
    "Very hard to locate": 1,
    "Not at all helpful": 1,
    "Slightly helpful": 2,
    "Moderately helpful": 3,
    "Very helpful": 4,
    "Extremely helpful": 5,
  };
  return map[cc] ?? null;
};

// Table 1: Consolidated SQD Results
export const generateConsolidatedSQDTable = (data: FormData[]): SQDRow[] => {
  const dimensions = [
    { key: "cc1", name: "CC Awareness", desc: "Citizen's Charter Awareness" },
    { key: "sqd0", name: "SQD0", desc: "Overall Satisfaction" },
    { key: "sqd1", name: "SQD1", desc: "Responsiveness (Reasonable Time)" },
    { key: "sqd2", name: "SQD2", desc: "Reliability (Followed Requirements)" },
    { key: "sqd3", name: "SQD3", desc: "Access & Facilities (Easy Steps)" },
    { key: "sqd4", name: "SQD4", desc: "Communication (Easy Information)" },
    { key: "sqd5", name: "SQD5", desc: "Costs (Reasonable Fees)" },
    { key: "sqd6", name: "SQD6", desc: "Integrity (Fairness/Walang Palakasan)" },
    { key: "sqd7", name: "SQD7", desc: "Assurance (Courtesy/Helpfulness)" },
    { key: "sqd8", name: "SQD8", desc: "Outcome (Got What I Needed)" },
  ];

  return dimensions.map(dim => {
    let stronglyAgree = 0;
    let agree = 0;
    let total = 0;

    data.forEach(entry => {
      const value = entry[dim.key as keyof FormData] as string;
      if (value) {
        total++;
        if (dim.key === "cc1") {
          // For CC1, count "Yes, aware and read" as strongly agree
          if (value === "Yes, aware and read") stronglyAgree++;
          else if (value === "Aware but not read") agree++;
        } else {
          // For SQD dimensions
          if (value === "Strongly Agree") stronglyAgree++;
          else if (value === "Agree") agree++;
        }
      }
    });

    const positiveCount = stronglyAgree + agree;
    const positiveRate = total > 0 ? ((positiveCount / total) * 100).toFixed(1) : "0.0";

    return {
      dimension: dim.name,
      description: dim.desc,
      stronglyAgree: dim.key === "cc1" ? stronglyAgree : stronglyAgree,
      agree: dim.key === "cc1" ? agree : agree,
      totalPositive: `${positiveRate}%`,
    };
  });
};

// Table 2: Office Performance Summary
export const generateOfficePerformanceTable = (data: FormData[]): OfficePerformanceRow[] => {
  const officeMap = new Map<string, { responses: number[]; count: number }>();

  data.forEach(entry => {
    if (!officeMap.has(entry.office)) {
      officeMap.set(entry.office, { responses: [], count: 0 });
    }
    const office = officeMap.get(entry.office)!;
    office.count++;

    // Calculate mean rating from SQD1-SQD8
    const sqdKeys = ["sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"];
    const ratings = sqdKeys
      .map(key => convertSQDToNumber(entry[key as keyof FormData] as string))
      .filter(r => r !== null) as number[];
    
    if (ratings.length > 0) {
      const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      office.responses.push(mean);
    }
  });

  const results: OfficePerformanceRow[] = [];
  officeMap.forEach((stats, office) => {
    const meanRating = stats.responses.length > 0
      ? stats.responses.reduce((a, b) => a + b, 0) / stats.responses.length
      : 0;
    
    results.push({
      office,
      totalTransactions: stats.count,
      totalResponses: stats.count,
      responseRate: "100.0%", // Assuming all transactions have responses
      clientMeanRating: meanRating.toFixed(2),
    });
  });

  return results.sort((a, b) => b.totalTransactions - a.totalTransactions);
};

// Table 3: Client Type Breakdown
export const generateClientTypeTable = (data: FormData[]): ClientTypeRow[] => {
  const clientTypes = ["Citizen", "Business", "Government"];
  const results: ClientTypeRow[] = [];

  clientTypes.forEach(type => {
    const externalClients = data.filter(
      d => d.clientType === type && d.clientType.toLowerCase().includes("external")
    ).length;
    const internalClients = data.filter(
      d => d.clientType === type && d.clientType.toLowerCase().includes("internal")
    ).length;
    
    // Simple count for now
    const typeCount = data.filter(d => d.clientType.toLowerCase().includes(type.toLowerCase())).length;

    results.push({
      customerType: type,
      externalClients: typeCount,
      internalClients: 0,
      overallClients: typeCount,
    });
  });

  return results;
};

// Table 4: Demographic Breakdown by Age and Sex
export const generateDemographicTable = (data: FormData[]): DemographicRow[] => {
  const ageGroups = Array.from(new Set(data.map(d => d.ageGroup))).sort();
  const results: DemographicRow[] = [];

  ageGroups.forEach(ageGroup => {
    const filtered = data.filter(d => d.ageGroup === ageGroup);
    const male = filtered.filter(d => d.sex.toLowerCase() === "male").length;
    const female = filtered.filter(d => d.sex.toLowerCase() === "female").length;
    const total = filtered.length;
    const percentage = ((total / data.length) * 100).toFixed(1);

    results.push({
      category: ageGroup,
      male,
      female,
      total,
      percentage: `${percentage}%`,
    });
  });

  // Add totals row
  const totalMale = data.filter(d => d.sex.toLowerCase() === "male").length;
  const totalFemale = data.filter(d => d.sex.toLowerCase() === "female").length;
  results.push({
    category: "Total",
    male: totalMale,
    female: totalFemale,
    total: data.length,
    percentage: "100.0%",
  });

  return results;
};

// Table 5: Service Utilization and Satisfaction
export const generateServiceUtilizationTable = (data: FormData[]): ServiceUtilizationRow[] => {
  const serviceMap = new Map<string, { count: number; ratings: number[] }>();

  data.forEach(entry => {
    const services = entry.services.split(",").map(s => s.trim()).filter(s => s);
    
    services.forEach(service => {
      if (!serviceMap.has(service)) {
        serviceMap.set(service, { count: 0, ratings: [] });
      }
      const serviceData = serviceMap.get(service)!;
      serviceData.count++;

      // Calculate average satisfaction
      const sqdKeys = ["sqd0", "sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"];
      const ratings = sqdKeys
        .map(key => convertSQDToNumber(entry[key as keyof FormData] as string))
        .filter(r => r !== null) as number[];
      
      if (ratings.length > 0) {
        const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        serviceData.ratings.push(mean);
      }
    });
  });

  const results: ServiceUtilizationRow[] = [];
  serviceMap.forEach((stats, service) => {
    const avgSatisfaction = stats.ratings.length > 0
      ? stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length
      : 0;
    const percentage = ((stats.count / data.length) * 100).toFixed(1);

    results.push({
      service,
      count: stats.count,
      percentage: `${percentage}%`,
      avgSatisfaction: avgSatisfaction.toFixed(2),
    });
  });

  return results.sort((a, b) => b.count - a.count);
};

// Table 6: Campus Comparison
export const generateCampusComparisonTable = (data: FormData[]): CampusComparisonRow[] => {
  const campuses = Array.from(new Set(data.map(d => d.campus))).sort();
  const results: CampusComparisonRow[] = [];

  campuses.forEach(campus => {
    const campusData = data.filter(d => d.campus === campus);
    
    // Calculate average SQD
    const allRatings: number[] = [];
    campusData.forEach(entry => {
      const sqdKeys = ["sqd1", "sqd2", "sqd3", "sqd4", "sqd5", "sqd6", "sqd7", "sqd8"];
      const ratings = sqdKeys
        .map(key => convertSQDToNumber(entry[key as keyof FormData] as string))
        .filter(r => r !== null) as number[];
      allRatings.push(...ratings);
    });
    
    const avgSQD = allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;

    // Calculate CC awareness
    const awareCount = campusData.filter(
      d => d.cc1 === "Yes, aware and read" || d.cc1 === "Aware but not read"
    ).length;
    const ccAwareness = campusData.length > 0
      ? ((awareCount / campusData.length) * 100).toFixed(1)
      : "0.0";

    // Find top service
    const serviceMap = new Map<string, number>();
    campusData.forEach(entry => {
      const services = entry.services.split(",").map(s => s.trim()).filter(s => s);
      services.forEach(service => {
        serviceMap.set(service, (serviceMap.get(service) || 0) + 1);
      });
    });
    
    let topService = "N/A";
    let maxCount = 0;
    serviceMap.forEach((count, service) => {
      if (count > maxCount) {
        maxCount = count;
        topService = service;
      }
    });

    results.push({
      campus,
      totalResponses: campusData.length,
      avgSQD: avgSQD.toFixed(2),
      ccAwareness: `${ccAwareness}%`,
      topService,
    });
  });

  return results;
}
