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
