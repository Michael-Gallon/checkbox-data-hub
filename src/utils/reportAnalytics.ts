import { FormData } from "@/types/form";

export interface CampusMetrics {
  campus: string;
  totalResponses: number;
  clientTypeDistribution: Record<string, number>;
  sexDistribution: Record<string, number>;
  ageGroupDistribution: Record<string, number>;
  officeDistribution: Record<string, number>;
  ccAverages: {
    cc1: number;
    cc2: number;
    cc3: number;
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

    // CC Averages
    const ccValues = items.map(item => ({
      cc1: convertCCToNumber(item.cc1),
      cc2: convertCCToNumber(item.cc2),
      cc3: convertCCToNumber(item.cc3),
    }));
    
    const ccAverages = {
      cc1: ccValues.reduce((sum, v) => sum + v.cc1, 0) / ccValues.length,
      cc2: ccValues.reduce((sum, v) => sum + v.cc2, 0) / ccValues.length,
      cc3: ccValues.reduce((sum, v) => sum + v.cc3, 0) / ccValues.length,
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
      ccAverages,
      sqdDistribution,
      sqdAverages,
      topServices,
      timeSeriesData,
      satisfactionByDemographic,
      responseRateByOffice,
    };
  });
};

export const calculateOverallMetrics = (data: FormData[]) => {
  const totalResponses = data.length;
  const campusCount = new Set(data.map(d => d.campus)).size;
  
  const allCC = data.map(item => [
    convertCCToNumber(item.cc1),
    convertCCToNumber(item.cc2),
    convertCCToNumber(item.cc3),
  ]).flat().filter(v => v > 0);
  
  const avgCCSatisfaction = allCC.length > 0 
    ? allCC.reduce((sum, v) => sum + v, 0) / allCC.length 
    : 0;

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
    avgCCSatisfaction,
    avgSQDSatisfaction,
  };
};
