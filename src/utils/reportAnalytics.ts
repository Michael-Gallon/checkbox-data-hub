import { FormData } from "@/types/form";

export interface CC1Distribution {
  "Knew and saw charter": number;
  "Knew but didn't see": number;
  "Learned from this visit": number;
  "N/A": number;
}

export interface CC2Distribution {
  "Easy to see": number;
  "Somewhat easy to see": number;
  "Difficult to see": number;
  "Not visible at all": number;
  "N/A": number;
}

export interface CC3Distribution {
  "Helped very much": number;
  "Somewhat helped": number;
  "Did not help": number;
  "N/A": number;
}

export interface CampusMetrics {
  campus: string;
  totalResponses: number;
  clientTypeDistribution: Record<string, number>;
  sexDistribution: Record<string, number>;
  ageGroupDistribution: Record<string, number>;
  officeDistribution: Record<string, number>;
  ccDistributions: {
    cc1: CC1Distribution;
    cc2: CC2Distribution;
    cc3: CC3Distribution;
  };
  sqdDistribution: Record<string, Record<string, number>>;
  sqdAverages: Record<string, number>;
  topServices: Array<{ service: string; count: number }>;
  timeSeriesData: Array<{ date: string; responses: number; avgCC: number; avgSQD: number }>;
  satisfactionByDemographic: {
    byClientType: Record<string, { avgCC: number; avgSQD: number; count: number }>;
    bySex: Record<string, { avgCC: number; avgSQD: number; count: number }>;
    byAgeGroup: Record<string, { avgCC: number; avgSQD: number; count: number }>;
  };
  responseRateByOffice: Array<{ office: string; count: number; avgCC: number; avgSQD: number }>;
}

const convertCCToNumber = (value: string): number => {
  if (value === "NA" || !value) return 0;
  return parseInt(value) || 0;
};

const convertSQDToNumber = (value: string): number => {
  const mapping: Record<string, number> = {
    "SA": 5,
    "A": 4,
    "ND": 3,
    "D": 2,
    "SD": 1,
    "NA": 0
  };
  return mapping[value] || 0;
};

export const analyzeByCampus = (data: FormData[]): CampusMetrics[] => {
  const campusGroups = data.reduce((acc, item) => {
    if (!acc[item.campus]) {
      acc[item.campus] = [];
    }
    acc[item.campus].push(item);
    return acc;
  }, {} as Record<string, FormData[]>);

  return Object.entries(campusGroups).map(([campus, items]) => {
    // Client Type Distribution
    const clientTypeDistribution: Record<string, number> = {};
    items.forEach(item => {
      if (item.clientType) {
        clientTypeDistribution[item.clientType] = (clientTypeDistribution[item.clientType] || 0) + 1;
      }
    });

    // Sex Distribution
    const sexDistribution: Record<string, number> = {};
    items.forEach(item => {
      if (item.sex) {
        sexDistribution[item.sex] = (sexDistribution[item.sex] || 0) + 1;
      }
    });

    // Age Group Distribution
    const ageGroupDistribution: Record<string, number> = {};
    items.forEach(item => {
      if (item.ageGroup) {
        ageGroupDistribution[item.ageGroup] = (ageGroupDistribution[item.ageGroup] || 0) + 1;
      }
    });

    // Office Distribution
    const officeDistribution: Record<string, number> = {};
    items.forEach(item => {
      if (item.office) {
        officeDistribution[item.office] = (officeDistribution[item.office] || 0) + 1;
      }
    });

    // CC Distributions (Categorical)
    const cc1Distribution: CC1Distribution = {
      "Knew and saw charter": 0,
      "Knew but didn't see": 0,
      "Learned from this visit": 0,
      "N/A": 0,
    };

    const cc2Distribution: CC2Distribution = {
      "Easy to see": 0,
      "Somewhat easy to see": 0,
      "Difficult to see": 0,
      "Not visible at all": 0,
      "N/A": 0,
    };

    const cc3Distribution: CC3Distribution = {
      "Helped very much": 0,
      "Somewhat helped": 0,
      "Did not help": 0,
      "N/A": 0,
    };

    items.forEach(item => {
      // Map CC1 responses
      const cc1Val = item.cc1?.toString() || "";
      if (cc1Val === "1") cc1Distribution["Knew and saw charter"]++;
      else if (cc1Val === "2") cc1Distribution["Knew but didn't see"]++;
      else if (cc1Val === "3") cc1Distribution["Learned from this visit"]++;
      else cc1Distribution["N/A"]++;

      // Map CC2 responses
      const cc2Val = item.cc2?.toString() || "";
      if (cc2Val === "1") cc2Distribution["Easy to see"]++;
      else if (cc2Val === "2") cc2Distribution["Somewhat easy to see"]++;
      else if (cc2Val === "3") cc2Distribution["Difficult to see"]++;
      else if (cc2Val === "4") cc2Distribution["Not visible at all"]++;
      else cc2Distribution["N/A"]++;

      // Map CC3 responses
      const cc3Val = item.cc3?.toString() || "";
      if (cc3Val === "1") cc3Distribution["Helped very much"]++;
      else if (cc3Val === "2") cc3Distribution["Somewhat helped"]++;
      else if (cc3Val === "3") cc3Distribution["Did not help"]++;
      else cc3Distribution["N/A"]++;
    });

    const ccDistributions = {
      cc1: cc1Distribution,
      cc2: cc2Distribution,
      cc3: cc3Distribution,
    };

    // SQD Distribution and Averages
    const sqdKeys = ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
    const sqdDistribution: Record<string, Record<string, number>> = {};
    const sqdAverages: Record<string, number> = {};

    sqdKeys.forEach(key => {
      sqdDistribution[key] = {};
      const values = items.map(item => item[key as keyof FormData] as string);
      values.forEach(value => {
        if (value) {
          sqdDistribution[key][value] = (sqdDistribution[key][value] || 0) + 1;
        }
      });
      
      const numericValues = values.map(convertSQDToNumber).filter(v => v > 0);
      sqdAverages[key] = numericValues.length > 0 
        ? numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length 
        : 0;
    });

    // Top Services
    const servicesCount: Record<string, number> = {};
    items.forEach(item => {
      if (item.services && item.services.trim()) {
        const service = item.services.trim();
        servicesCount[service] = (servicesCount[service] || 0) + 1;
      }
    });
    
    const topServices = Object.entries(servicesCount)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Time Series Analysis
    const timeSeriesMap: Record<string, { count: number; ccSum: number; sqdSum: number }> = {};
    items.forEach(item => {
      const dateKey = new Date(item.timestamp).toLocaleDateString();
      if (!timeSeriesMap[dateKey]) {
        timeSeriesMap[dateKey] = { count: 0, ccSum: 0, sqdSum: 0 };
      }
      
      const avgCC = (convertCCToNumber(item.cc1) + convertCCToNumber(item.cc2) + convertCCToNumber(item.cc3)) / 3;
      const sqdValues = sqdKeys.map(key => convertSQDToNumber(item[key as keyof FormData] as string)).filter(v => v > 0);
      const avgSQD = sqdValues.length > 0 ? sqdValues.reduce((a, b) => a + b, 0) / sqdValues.length : 0;
      
      timeSeriesMap[dateKey].count++;
      timeSeriesMap[dateKey].ccSum += avgCC;
      timeSeriesMap[dateKey].sqdSum += avgSQD;
    });

    const timeSeriesData = Object.entries(timeSeriesMap)
      .map(([date, data]) => ({
        date,
        responses: data.count,
        avgCC: parseFloat((data.ccSum / data.count).toFixed(2)),
        avgSQD: parseFloat((data.sqdSum / data.count).toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Satisfaction by Demographics
    const byClientType: Record<string, { ccSum: number; sqdSum: number; count: number }> = {};
    const bySex: Record<string, { ccSum: number; sqdSum: number; count: number }> = {};
    const byAgeGroup: Record<string, { ccSum: number; sqdSum: number; count: number }> = {};
    
    items.forEach(item => {
      const avgCC = (convertCCToNumber(item.cc1) + convertCCToNumber(item.cc2) + convertCCToNumber(item.cc3)) / 3;
      const sqdValues = sqdKeys.map(key => convertSQDToNumber(item[key as keyof FormData] as string)).filter(v => v > 0);
      const avgSQD = sqdValues.length > 0 ? sqdValues.reduce((a, b) => a + b, 0) / sqdValues.length : 0;

      if (!byClientType[item.clientType]) {
        byClientType[item.clientType] = { ccSum: 0, sqdSum: 0, count: 0 };
      }
      byClientType[item.clientType].ccSum += avgCC;
      byClientType[item.clientType].sqdSum += avgSQD;
      byClientType[item.clientType].count++;

      if (!bySex[item.sex]) {
        bySex[item.sex] = { ccSum: 0, sqdSum: 0, count: 0 };
      }
      bySex[item.sex].ccSum += avgCC;
      bySex[item.sex].sqdSum += avgSQD;
      bySex[item.sex].count++;

      if (!byAgeGroup[item.ageGroup]) {
        byAgeGroup[item.ageGroup] = { ccSum: 0, sqdSum: 0, count: 0 };
      }
      byAgeGroup[item.ageGroup].ccSum += avgCC;
      byAgeGroup[item.ageGroup].sqdSum += avgSQD;
      byAgeGroup[item.ageGroup].count++;
    });

    const satisfactionByDemographic = {
      byClientType: Object.fromEntries(
        Object.entries(byClientType).map(([key, val]) => [
          key,
          {
            avgCC: parseFloat((val.ccSum / val.count).toFixed(2)),
            avgSQD: parseFloat((val.sqdSum / val.count).toFixed(2)),
            count: val.count,
          },
        ])
      ),
      bySex: Object.fromEntries(
        Object.entries(bySex).map(([key, val]) => [
          key,
          {
            avgCC: parseFloat((val.ccSum / val.count).toFixed(2)),
            avgSQD: parseFloat((val.sqdSum / val.count).toFixed(2)),
            count: val.count,
          },
        ])
      ),
      byAgeGroup: Object.fromEntries(
        Object.entries(byAgeGroup).map(([key, val]) => [
          key,
          {
            avgCC: parseFloat((val.ccSum / val.count).toFixed(2)),
            avgSQD: parseFloat((val.sqdSum / val.count).toFixed(2)),
            count: val.count,
          },
        ])
      ),
    };

    // Office Performance Metrics
    const officeMetrics: Record<string, { count: number; ccSum: number; sqdSum: number }> = {};
    items.forEach(item => {
      const avgCC = (convertCCToNumber(item.cc1) + convertCCToNumber(item.cc2) + convertCCToNumber(item.cc3)) / 3;
      const sqdValues = sqdKeys.map(key => convertSQDToNumber(item[key as keyof FormData] as string)).filter(v => v > 0);
      const avgSQD = sqdValues.length > 0 ? sqdValues.reduce((a, b) => a + b, 0) / sqdValues.length : 0;

      if (!officeMetrics[item.office]) {
        officeMetrics[item.office] = { count: 0, ccSum: 0, sqdSum: 0 };
      }
      officeMetrics[item.office].count++;
      officeMetrics[item.office].ccSum += avgCC;
      officeMetrics[item.office].sqdSum += avgSQD;
    });

    const responseRateByOffice = Object.entries(officeMetrics)
      .map(([office, data]) => ({
        office,
        count: data.count,
        avgCC: parseFloat((data.ccSum / data.count).toFixed(2)),
        avgSQD: parseFloat((data.sqdSum / data.count).toFixed(2)),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      campus,
      totalResponses: items.length,
      clientTypeDistribution,
      sexDistribution,
      ageGroupDistribution,
      officeDistribution,
      ccDistributions,
      sqdDistribution,
      sqdAverages,
      topServices,
      timeSeriesData,
      satisfactionByDemographic,
      responseRateByOffice,
    };
  });
};

// Helper functions for CC analysis
export const calculateAwarenessRate = (cc1Data: CC1Distribution): string => {
  const total = Object.values(cc1Data).reduce((a, b) => a + b, 0) - cc1Data["N/A"];
  if (total === 0) return "0";
  const aware = cc1Data["Knew and saw charter"] + cc1Data["Knew but didn't see"];
  return ((aware / total) * 100).toFixed(1);
};

export const calculateVisibilityScore = (cc2Data: CC2Distribution): string => {
  const total = Object.values(cc2Data).reduce((a, b) => a + b, 0) - cc2Data["N/A"];
  if (total === 0) return "0";
  const easy = cc2Data["Easy to see"] + cc2Data["Somewhat easy to see"];
  return ((easy / total) * 100).toFixed(1);
};

export const calculateHelpfulnessRate = (cc3Data: CC3Distribution): string => {
  const total = Object.values(cc3Data).reduce((a, b) => a + b, 0) - cc3Data["N/A"];
  if (total === 0) return "0";
  const helpful = cc3Data["Helped very much"] + cc3Data["Somewhat helped"];
  return ((helpful / total) * 100).toFixed(1);
};

export const calculateCC1Insight = (data: CC1Distribution): string => {
  const total = Object.values(data).reduce((a, b) => a + b, 0) - data["N/A"];
  if (total === 0) return "No data available for analysis.";
  
  const knewAndSaw = ((data["Knew and saw charter"] / total) * 100).toFixed(0);
  const learnedHere = ((data["Learned from this visit"] / total) * 100).toFixed(0);
  
  if (data["Knew and saw charter"] > total * 0.6) {
    return `Strong charter awareness: ${knewAndSaw}% of clients were already familiar with and saw the charter. This indicates effective pre-visit information dissemination.`;
  } else if (data["Learned from this visit"] > total * 0.5) {
    return `${learnedHere}% of clients learned about the Citizen's Charter during their visit, suggesting an opportunity to improve pre-visit awareness through marketing and orientation.`;
  } else {
    return `Mixed awareness levels detected. ${knewAndSaw}% knew and saw the charter, while ${learnedHere}% learned about it on-site. Consider enhancing both pre-visit and on-site communication strategies.`;
  }
};

export const calculateCC2Insight = (data: CC2Distribution): string => {
  const total = Object.values(data).reduce((a, b) => a + b, 0) - data["N/A"];
  if (total === 0) return "No data available for analysis.";
  
  const easyToSee = ((data["Easy to see"] / total) * 100).toFixed(0);
  const difficult = (((data["Difficult to see"] + data["Not visible at all"]) / total) * 100).toFixed(0);
  
  if ((data["Easy to see"] + data["Somewhat easy to see"]) > total * 0.8) {
    return `Excellent visibility: ${easyToSee}% found the charter easy to see. The current placement and visibility strategy is working well.`;
  } else if ((data["Difficult to see"] + data["Not visible at all"]) > total * 0.3) {
    return `Visibility concern: ${difficult}% of clients found the charter difficult to see or not visible. Immediate action needed to improve charter placement and signage.`;
  } else {
    return `Moderate visibility: ${easyToSee}% found it easy to see. Consider enhancing charter visibility through better placement, larger displays, or additional signage.`;
  }
};

export const calculateCC3Insight = (data: CC3Distribution): string => {
  const total = Object.values(data).reduce((a, b) => a + b, 0) - data["N/A"];
  if (total === 0) return "No data available for analysis.";
  
  const veryHelpful = ((data["Helped very much"] / total) * 100).toFixed(0);
  const notHelpful = ((data["Did not help"] / total) * 100).toFixed(0);
  
  if (data["Helped very much"] > total * 0.7) {
    return `High effectiveness: ${veryHelpful}% found the charter very helpful. The charter is successfully guiding clients through their transactions.`;
  } else if (data["Did not help"] > total * 0.3) {
    return `Limited effectiveness: ${notHelpful}% found the charter unhelpful. Review charter content, clarity, and relevance to ensure it meets client needs.`;
  } else {
    return `Moderate helpfulness: ${veryHelpful}% found it very helpful. Consider improving charter content, format, or presentation to increase its practical value to clients.`;
  }
};

export const calculateOverallMetrics = (data: FormData[]) => {
  const totalResponses = data.length;
  const campusCount = new Set(data.map(d => d.campus)).size;
  
  // Calculate overall CC distributions
  const overallCC1: CC1Distribution = {
    "Knew and saw charter": 0,
    "Knew but didn't see": 0,
    "Learned from this visit": 0,
    "N/A": 0,
  };

  const overallCC2: CC2Distribution = {
    "Easy to see": 0,
    "Somewhat easy to see": 0,
    "Difficult to see": 0,
    "Not visible at all": 0,
    "N/A": 0,
  };

  const overallCC3: CC3Distribution = {
    "Helped very much": 0,
    "Somewhat helped": 0,
    "Did not help": 0,
    "N/A": 0,
  };

  data.forEach(item => {
    const cc1Val = item.cc1?.toString() || "";
    if (cc1Val === "1") overallCC1["Knew and saw charter"]++;
    else if (cc1Val === "2") overallCC1["Knew but didn't see"]++;
    else if (cc1Val === "3") overallCC1["Learned from this visit"]++;
    else overallCC1["N/A"]++;

    const cc2Val = item.cc2?.toString() || "";
    if (cc2Val === "1") overallCC2["Easy to see"]++;
    else if (cc2Val === "2") overallCC2["Somewhat easy to see"]++;
    else if (cc2Val === "3") overallCC2["Difficult to see"]++;
    else if (cc2Val === "4") overallCC2["Not visible at all"]++;
    else overallCC2["N/A"]++;

    const cc3Val = item.cc3?.toString() || "";
    if (cc3Val === "1") overallCC3["Helped very much"]++;
    else if (cc3Val === "2") overallCC3["Somewhat helped"]++;
    else if (cc3Val === "3") overallCC3["Did not help"]++;
    else overallCC3["N/A"]++;
  });

  const sqdKeys = ['sqd0', 'sqd1', 'sqd2', 'sqd3', 'sqd4', 'sqd5', 'sqd6', 'sqd7', 'sqd8'];
  const allSQD = data.map(item => 
    sqdKeys.map(key => convertSQDToNumber(item[key as keyof FormData] as string))
  ).flat().filter(v => v > 0);
  
  const avgSQDSatisfaction = allSQD.length > 0 
    ? allSQD.reduce((sum, v) => sum + v, 0) / allSQD.length 
    : 0;

  return {
    totalResponses,
    campusCount,
    overallAwarenessRate: calculateAwarenessRate(overallCC1),
    overallVisibilityScore: calculateVisibilityScore(overallCC2),
    overallHelpfulnessRate: calculateHelpfulnessRate(overallCC3),
    avgSQDSatisfaction,
  };
};
