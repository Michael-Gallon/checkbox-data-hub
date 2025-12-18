import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, BarChart3, AlertTriangle } from "lucide-react";
import { FormData } from "@/types/form";
import {
  generateConsolidatedSQDTable,
  generateExternalServicesTable,
  generateDemographicDistribution,
  generateServiceUtilization,
  generateCampusComparison,
  type ConsolidatedSQDRow,
  type ExternalServicesRow,
  type DemographicRow,
  type ServiceUtilizationRow,
  type CampusPerformanceRow,
} from "@/utils/tabularReportAnalytics";

const TabularReport = () => {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<FormData[]>([]);
  const [filteredData, setFilteredData] = useState<FormData[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("All Campuses");
  const [selectedOffice, setSelectedOffice] = useState<string>("All Offices");
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);
  const [availableOffices, setAvailableOffices] = useState<string[]>([]);

  // Table data states
  const [consolidatedSQD, setConsolidatedSQD] = useState<ConsolidatedSQDRow[]>([]);
  const [externalServices, setExternalServices] = useState<ExternalServicesRow[]>([]);
  const [demographics, setDemographics] = useState<{ ageGroup: DemographicRow[]; sex: DemographicRow[] }>({
    ageGroup: [],
    sex: [],
  });
  const [serviceUtilization, setServiceUtilization] = useState<ServiceUtilizationRow[]>([]);
  const [campusComparison, setCampusComparison] = useState<CampusPerformanceRow[]>([]);
  const [transactionInputs, setTransactionInputs] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem("encodedData");
    if (saved) {
      const data: FormData[] = JSON.parse(saved);
      setAllData(data);
      setFilteredData(data);

      const campuses = Array.from(new Set(data.map(d => d.campus))).sort();
      const offices = Array.from(new Set(data.map(d => d.office))).sort();
      setAvailableCampuses(campuses);
      setAvailableOffices(offices);

      // Load saved transaction inputs
      const savedInputs = localStorage.getItem("transactionInputs");
      if (savedInputs) {
        setTransactionInputs(JSON.parse(savedInputs));
      }

      // Generate initial table data
      generateAllTables(data);
    }
  }, []);

  useEffect(() => {
    if (allData.length === 0) return;

    let filtered = allData;
    if (selectedCampus !== "All Campuses") {
      filtered = filtered.filter(d => d.campus === selectedCampus);
    }
    if (selectedOffice !== "All Offices") {
      filtered = filtered.filter(d => d.office === selectedOffice);
    }

    setFilteredData(filtered);
    generateAllTables(filtered);
  }, [selectedCampus, selectedOffice, allData, transactionInputs]);

  useEffect(() => {
    if (Object.keys(transactionInputs).length > 0) {
      localStorage.setItem("transactionInputs", JSON.stringify(transactionInputs));
    }
  }, [transactionInputs]);

  const generateAllTables = (data: FormData[]) => {
    setConsolidatedSQD(generateConsolidatedSQDTable(data));
    setExternalServices(generateExternalServicesTable(data, transactionInputs));
    setDemographics(generateDemographicDistribution(data));
    setServiceUtilization(generateServiceUtilization(data));
    setCampusComparison(generateCampusComparison(data));
  };

  const handleTransactionInputChange = (office: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setTransactionInputs(prev => ({
      ...prev,
      [office]: numValue
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const getPerformanceColor = (percentage: string): string => {
    const value = parseFloat(percentage);
    if (value >= 80) return "text-green-600 dark:text-green-400";
    if (value >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getRatingColor = (rating: string): string => {
    const value = parseFloat(rating);
    if (value >= 4.0) return "text-green-600 dark:text-green-400";
    if (value >= 3.0) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (allData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              There is no data to generate a tabular report. Please submit some responses first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#800000] text-white py-4 shadow-lg print:hidden">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tabular Report</h1>
            <p className="text-sm opacity-90">Statistical Analysis in Tables</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => navigate("/report")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Graphical Report
            </Button>
            <Button variant="secondary" onClick={() => navigate("/dissatisfaction-report")}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Dissatisfaction
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" />
              Print/Save PDF
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 print:hidden">
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Filter the report by campus and/or office</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Campus</label>
                <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Campuses">All Campuses</SelectItem>
                    {availableCampuses.map(campus => (
                      <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Office</label>
                <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Offices">All Offices</SelectItem>
                    {availableOffices.map(office => (
                      <SelectItem key={office} value={office}>{office}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>
              {selectedCampus !== "All Campuses" ? selectedCampus : "All Campuses"} 
              {" - "}
              {selectedOffice !== "All Offices" ? selectedOffice : "All Offices"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{filteredData.length}</div>
              <div className="text-sm text-muted-foreground mt-2">Total Responses</div>
            </div>
          </CardContent>
        </Card>

        {/* Table 1: Consolidated Service Quality Dimension Results */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table 1: Consolidated Service Quality Dimension (SQD) Results</CardTitle>
            <CardDescription>
              Overview of all quality dimensions with positive response rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quality Dimension</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Strongly Agree</TableHead>
                    <TableHead className="text-right">Agree</TableHead>
                    <TableHead className="text-right">Total Positive</TableHead>
                    <TableHead className="text-right">Positive %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedSQD.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.dimension}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell className="text-right">{row.stronglyAgree}</TableCell>
                      <TableCell className="text-right">{row.agree}</TableCell>
                      <TableCell className="text-right font-semibold">{row.totalPositive}</TableCell>
                      <TableCell className={`text-right font-semibold ${getPerformanceColor(row.positivePercentage)}`}>
                        {row.positivePercentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 2: External Services Performance Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table 2: External Services Performance Summary</CardTitle>
            <CardDescription>
              Office-level transaction metrics and satisfaction ratings. 
              <span className="text-yellow-600 dark:text-yellow-400 font-semibold"> 
                ⚠️ Enter actual transaction counts to calculate response rates
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Office</TableHead>
                    <TableHead className="text-right">Samples</TableHead>
                    <TableHead className="text-right">Total Responses</TableHead>
                    <TableHead className="text-right">Response Rate</TableHead>
                    <TableHead className="text-right">Mean Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {externalServices.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.office}</TableCell>
                      <TableCell className="text-right">
                        <input
                          type="number"
                          min="1"
                          value={transactionInputs[row.office] ?? row.totalTransactions}
                          onChange={(e) => handleTransactionInputChange(row.office, e.target.value)}
                          className="w-24 px-2 py-1 border border-input rounded text-right bg-background focus:outline-none focus:ring-2 focus:ring-ring print:border-0 print:bg-transparent print:p-0"
                          placeholder="Enter"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold">{row.totalResponses}</TableCell>
                      <TableCell className={`text-right ${getPerformanceColor(row.responseRate)}`}>
                        {row.responseRate}%
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getRatingColor(row.meanRating)}`}>
                        {row.meanRating}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Note:</strong> Total Transactions is editable. Enter the actual number of transactions 
              that occurred at each office. Total Responses shows the survey data collected. 
              Response Rate = (Total Responses ÷ Total Transactions) × 100%
            </p>
          </CardContent>
        </Card>

        {/* Table 3: Demographic Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table 3: Demographic Distribution by Age Group and Sex</CardTitle>
            <CardDescription>
              Response distribution and satisfaction levels across demographics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Age Group Distribution</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Group</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                        <TableHead className="text-right">Avg Satisfaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demographics.ageGroup.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.value}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{row.percentage}%</TableCell>
                          <TableCell className={`text-right ${getRatingColor(row.avgSatisfaction)}`}>
                            {row.avgSatisfaction}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Sex Distribution</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sex</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                        <TableHead className="text-right">Avg Satisfaction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demographics.sex.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.value}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{row.percentage}%</TableCell>
                          <TableCell className={`text-right ${getRatingColor(row.avgSatisfaction)}`}>
                            {row.avgSatisfaction}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table 4: Service Utilization and Satisfaction Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table 4: Service Utilization and Satisfaction Analysis</CardTitle>
            <CardDescription>
              Top services by usage frequency with satisfaction metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Frequency</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="text-right">Avg Satisfaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceUtilization.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.service}</TableCell>
                      <TableCell className="text-right">{row.frequency}</TableCell>
                      <TableCell className="text-right">{row.percentage}%</TableCell>
                      <TableCell className={`text-right ${getRatingColor(row.avgSatisfaction)}`}>
                        {row.avgSatisfaction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 5: Campus-Level Performance Comparison */}
        {selectedCampus === "All Campuses" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Table 5: Campus-Level Performance Comparison</CardTitle>
              <CardDescription>
                Side-by-side comparison of key performance indicators across campuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campus</TableHead>
                      <TableHead className="text-right">Total Responses</TableHead>
                      <TableHead className="text-right">Awareness Rate</TableHead>
                      <TableHead className="text-right">Visibility Score</TableHead>
                      <TableHead className="text-right">Helpfulness Rate</TableHead>
                      <TableHead className="text-right">Avg SQD Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campusComparison.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.campus}</TableCell>
                        <TableCell className="text-right">{row.totalResponses}</TableCell>
                        <TableCell className={`text-right ${getPerformanceColor(row.awarenessRate)}`}>
                          {row.awarenessRate}%
                        </TableCell>
                        <TableCell className={`text-right ${getPerformanceColor(row.visibilityScore)}`}>
                          {row.visibilityScore}%
                        </TableCell>
                        <TableCell className={`text-right ${getPerformanceColor(row.helpfulnessRate)}`}>
                          {row.helpfulnessRate}%
                        </TableCell>
                        <TableCell className={`text-right ${getRatingColor(row.avgSQDRating)}`}>
                          {row.avgSQDRating}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Generation Timestamp */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Report generated on {new Date().toLocaleString()}</p>
        </div>
      </main>
    </div>
  );
};

export default TabularReport;
