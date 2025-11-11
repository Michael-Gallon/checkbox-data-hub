import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download } from "lucide-react";
import { FormData } from "@/types/form";
import {
  generateConsolidatedSQDTable,
  generateOfficePerformanceTable,
  generateClientTypeTable,
  generateDemographicTable,
  generateServiceUtilizationTable,
  generateCampusComparisonTable,
} from "@/utils/tabularReportAnalytics";

const TabularReport = () => {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<FormData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("encodedData");
    if (saved) {
      const data: FormData[] = JSON.parse(saved);
      setAllData(data);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (allData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              There is no data to generate a report. Please submit some responses first.
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

  const consolidatedSQD = generateConsolidatedSQDTable(allData);
  const officePerformance = generateOfficePerformanceTable(allData);
  const clientType = generateClientTypeTable(allData);
  const demographics = generateDemographicTable(allData);
  const serviceUtilization = generateServiceUtilizationTable(allData);
  const campusComparison = generateCampusComparisonTable(allData);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#800000] text-white py-4 shadow-lg print:hidden">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tabular Report</h1>
            <p className="text-sm opacity-90">Statistical Tables and Data Summary</p>
          </div>
          <div className="flex gap-2">
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

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Report Header */}
        <div className="text-center space-y-2 print:mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Customer Satisfaction Survey - Tabular Report
          </h2>
          <p className="text-muted-foreground">
            Generated on {new Date().toLocaleDateString()} | Total Responses: {allData.length}
          </p>
        </div>

        {/* Table 1: Consolidated SQD Results */}
        <Card>
          <CardHeader>
            <CardTitle>Table 1: Consolidated Service Quality Dimension (SQD) Results</CardTitle>
            <CardDescription>
              Comprehensive overview of all quality dimensions and CC awareness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Quality Dimension</TableHead>
                    <TableHead className="font-bold">Description</TableHead>
                    <TableHead className="font-bold text-right">Strongly Agree</TableHead>
                    <TableHead className="font-bold text-right">Agree</TableHead>
                    <TableHead className="font-bold text-right">Total Positive (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consolidatedSQD.map((row, idx) => (
                    <TableRow key={idx} className={row.dimension === "SQD0" ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium">{row.dimension}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell className="text-right">{row.stronglyAgree}</TableCell>
                      <TableCell className="text-right">{row.agree}</TableCell>
                      <TableCell className="text-right font-semibold">{row.totalPositive}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 2: Office Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Table 2: External Services Performance Summary</CardTitle>
            <CardDescription>
              Office-level transaction and satisfaction metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Office</TableHead>
                    <TableHead className="font-bold text-right">Total Transactions</TableHead>
                    <TableHead className="font-bold text-right">Total Responses</TableHead>
                    <TableHead className="font-bold text-right">Response Rate</TableHead>
                    <TableHead className="font-bold text-right">Client Mean Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officePerformance.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.office}</TableCell>
                      <TableCell className="text-right">{row.totalTransactions}</TableCell>
                      <TableCell className="text-right">{row.totalResponses}</TableCell>
                      <TableCell className="text-right">{row.responseRate}</TableCell>
                      <TableCell className="text-right font-semibold">{row.clientMeanRating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 3: Client Type */}
        <Card>
          <CardHeader>
            <CardTitle>Table 3: Client Type and Demographic Breakdown</CardTitle>
            <CardDescription>
              Distribution of responses by customer type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Customer Type</TableHead>
                    <TableHead className="font-bold text-right">External Clients</TableHead>
                    <TableHead className="font-bold text-right">Internal Clients</TableHead>
                    <TableHead className="font-bold text-right">Overall Clients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientType.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.customerType}</TableCell>
                      <TableCell className="text-right">{row.externalClients}</TableCell>
                      <TableCell className="text-right">{row.internalClients}</TableCell>
                      <TableCell className="text-right font-semibold">{row.overallClients}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 4: Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Table 4: Demographic Distribution by Age Group and Sex</CardTitle>
            <CardDescription>
              Respondent distribution across age groups and gender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Age Group</TableHead>
                    <TableHead className="font-bold text-right">Male</TableHead>
                    <TableHead className="font-bold text-right">Female</TableHead>
                    <TableHead className="font-bold text-right">Total</TableHead>
                    <TableHead className="font-bold text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demographics.map((row, idx) => (
                    <TableRow key={idx} className={row.category === "Total" ? "bg-muted/30 font-bold" : ""}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell className="text-right">{row.male}</TableCell>
                      <TableCell className="text-right">{row.female}</TableCell>
                      <TableCell className="text-right">{row.total}</TableCell>
                      <TableCell className="text-right">{row.percentage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 5: Service Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Table 5: Service Utilization and Satisfaction Analysis</CardTitle>
            <CardDescription>
              Most frequently used services with corresponding satisfaction levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Service</TableHead>
                    <TableHead className="font-bold text-right">Frequency Count</TableHead>
                    <TableHead className="font-bold text-right">Percentage</TableHead>
                    <TableHead className="font-bold text-right">Avg Satisfaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceUtilization.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.service}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">{row.percentage}</TableCell>
                      <TableCell className="text-right font-semibold">{row.avgSatisfaction}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 6: Campus Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Table 6: Campus-Level Performance Comparison</CardTitle>
            <CardDescription>
              Comparative analysis across different campus locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Campus</TableHead>
                    <TableHead className="font-bold text-right">Total Responses</TableHead>
                    <TableHead className="font-bold text-right">Avg SQD Score</TableHead>
                    <TableHead className="font-bold text-right">CC Awareness</TableHead>
                    <TableHead className="font-bold">Top Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campusComparison.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.campus}</TableCell>
                      <TableCell className="text-right">{row.totalResponses}</TableCell>
                      <TableCell className="text-right font-semibold">{row.avgSQD}</TableCell>
                      <TableCell className="text-right">{row.ccAwareness}</TableCell>
                      <TableCell>{row.topService}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>Key performance indicators across all metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{allData.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Campuses Surveyed</p>
                <p className="text-2xl font-bold">{campusComparison.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Offices Surveyed</p>
                <p className="text-2xl font-bold">{officePerformance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TabularReport;
