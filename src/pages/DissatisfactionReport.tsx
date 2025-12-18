import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, BarChart3, Table2, AlertTriangle, AlertCircle, MessageSquare } from "lucide-react";
import { FormData } from "@/types/form";
import {
  generateDissatisfactionSummary,
  generateSQDDissatisfactionTable,
  generateOfficeDissatisfactionTable,
  generateCCIssuesAnalysis,
  generateCommentsList,
  generateDemographicDissatisfaction,
  generateDissatisfactionTrends,
  type DissatisfactionSummary,
  type SQDDissatisfactionRow,
  type OfficeDissatisfactionRow,
  type CCIssuesRow,
  type CommentAnalysis,
  type DemographicDissatisfaction,
  type TrendData,
} from "@/utils/dissatisfactionAnalytics";

const DissatisfactionReport = () => {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<FormData[]>([]);
  const [filteredData, setFilteredData] = useState<FormData[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("All Campuses");
  const [selectedOffice, setSelectedOffice] = useState<string>("All Offices");
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);
  const [availableOffices, setAvailableOffices] = useState<string[]>([]);

  // Data states
  const [summary, setSummary] = useState<DissatisfactionSummary | null>(null);
  const [sqdTable, setSqdTable] = useState<SQDDissatisfactionRow[]>([]);
  const [officeTable, setOfficeTable] = useState<OfficeDissatisfactionRow[]>([]);
  const [ccIssues, setCcIssues] = useState<CCIssuesRow[]>([]);
  const [comments, setComments] = useState<CommentAnalysis[]>([]);
  const [demographics, setDemographics] = useState<{
    byAgeGroup: DemographicDissatisfaction[];
    bySex: DemographicDissatisfaction[];
    byClientType: DemographicDissatisfaction[];
  }>({ byAgeGroup: [], bySex: [], byClientType: [] });
  const [trends, setTrends] = useState<TrendData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("encodedData");
    if (saved) {
      const data: FormData[] = JSON.parse(saved);
      setAllData(data);
      setFilteredData(data);

      const campuses = Array.from(new Set(data.map(d => d.campus))).filter(c => c && c.trim() !== '').sort();
      const offices = Array.from(new Set(data.map(d => d.office))).filter(o => o && o.trim() !== '').sort();
      setAvailableCampuses(campuses);
      setAvailableOffices(offices);

      generateAllData(data);
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
    generateAllData(filtered);
  }, [selectedCampus, selectedOffice, allData]);

  const generateAllData = (data: FormData[]) => {
    setSummary(generateDissatisfactionSummary(data));
    setSqdTable(generateSQDDissatisfactionTable(data));
    setOfficeTable(generateOfficeDissatisfactionTable(data));
    setCcIssues(generateCCIssuesAnalysis(data));
    setComments(generateCommentsList(data));
    setDemographics(generateDemographicDissatisfaction(data));
    setTrends(generateDissatisfactionTrends(data));
  };

  const handlePrint = () => {
    window.print();
  };

  const getSeverityColor = (percentage: string): string => {
    const value = parseFloat(percentage);
    if (value >= 20) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    if (value >= 10) return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
  };

  const getSeverityTextColor = (percentage: string): string => {
    const value = parseFloat(percentage);
    if (value >= 20) return "text-red-600 dark:text-red-400";
    if (value >= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  if (allData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              There is no data to generate a dissatisfaction report. Please submit some responses first.
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
        <div className="container mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Dissatisfaction Analysis Report
            </h1>
            <p className="text-sm opacity-90">Comprehensive Analysis of Negative Feedback</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => navigate("/report")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Graphical
            </Button>
            <Button variant="secondary" onClick={() => navigate("/tabular-report")}>
              <Table2 className="w-4 h-4 mr-2" />
              Tabular
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" />
              Print/PDF
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
            <CardDescription>Filter by campus and/or office to focus the analysis</CardDescription>
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardDescription>Total Dissatisfied Responses</CardDescription>
                <CardTitle className="text-3xl text-red-600">{summary.totalDissatisfied}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">out of {summary.totalResponses} total</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardDescription>Dissatisfaction Rate</CardDescription>
                <CardTitle className={`text-3xl ${getSeverityTextColor(summary.dissatisfactionRate)}`}>
                  {summary.dissatisfactionRate}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {summary.totalNegativeRatings} negative + {summary.totalNeutralRatings} neutral ratings
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardDescription>Most Problematic Dimension</CardDescription>
                <CardTitle className="text-lg">{summary.mostProblematicDimension}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardDescription>Office Needing Most Attention</CardDescription>
                <CardTitle className="text-lg truncate">{summary.officeWithMostIssues}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Highest dissatisfaction</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table 1: SQD Dissatisfaction Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Table 1: SQD Dissatisfaction Analysis
            </CardTitle>
            <CardDescription>
              Detailed breakdown of negative and neutral responses by service quality dimension (sorted by worst performing)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimension</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">SD</TableHead>
                    <TableHead className="text-right">D</TableHead>
                    <TableHead className="text-right">ND</TableHead>
                    <TableHead className="text-right">Negative (SD+D)</TableHead>
                    <TableHead className="text-right">Negative %</TableHead>
                    <TableHead className="text-right">Neutral+Negative %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sqdTable.map((row, index) => (
                    <TableRow key={index} className={parseFloat(row.negativePercentage) >= 20 ? "bg-red-50 dark:bg-red-900/10" : ""}>
                      <TableCell className="font-medium">{row.dimension}</TableCell>
                      <TableCell className="max-w-xs truncate">{row.description}</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">{row.stronglyDisagree}</TableCell>
                      <TableCell className="text-right text-orange-600 dark:text-orange-400">{row.disagree}</TableCell>
                      <TableCell className="text-right text-yellow-600 dark:text-yellow-400">{row.neither}</TableCell>
                      <TableCell className="text-right font-semibold">{row.totalNegative}</TableCell>
                      <TableCell className={`text-right font-semibold ${getSeverityTextColor(row.negativePercentage)}`}>
                        {row.negativePercentage}%
                      </TableCell>
                      <TableCell className={`text-right ${getSeverityTextColor(row.neutralNegativePercentage)}`}>
                        {row.neutralNegativePercentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>Legend:</strong> SD = Strongly Disagree (1), D = Disagree (2), ND = Neither Agree nor Disagree (3). 
              Red highlighting indicates ≥20% negative responses.
            </p>
          </CardContent>
        </Card>

        {/* Table 2: Office-Level Dissatisfaction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Table 2: Office-Level Dissatisfaction Analysis
            </CardTitle>
            <CardDescription>
              Offices ranked by dissatisfaction rate with top issues identified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Office</TableHead>
                    <TableHead>Campus</TableHead>
                    <TableHead className="text-right">Responses</TableHead>
                    <TableHead className="text-right">Dissatisfied</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Top Issues</TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officeTable.map((row, index) => (
                    <TableRow key={index} className={parseFloat(row.dissatisfactionRate) >= 20 ? "bg-red-50 dark:bg-red-900/10" : ""}>
                      <TableCell className="font-medium">{row.office}</TableCell>
                      <TableCell>{row.campus}</TableCell>
                      <TableCell className="text-right">{row.totalResponses}</TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">{row.dissatisfiedResponses}</TableCell>
                      <TableCell className={`text-right font-semibold ${getSeverityTextColor(row.dissatisfactionRate)}`}>
                        {row.dissatisfactionRate}%
                      </TableCell>
                      <TableCell>
                        {row.topIssues.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {row.topIssues.map((issue, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                                {issue}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-600">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{row.commentsCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Table 3: Citizen's Charter Issues */}
        {ccIssues.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Table 3: Citizen's Charter Issues
              </CardTitle>
              <CardDescription>
                Problems related to Citizen's Charter visibility, awareness, and helpfulness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead>Affected Offices</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ccIssues.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.category}</TableCell>
                        <TableCell>{row.issue}</TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">{row.count}</TableCell>
                        <TableCell className={`text-right ${getSeverityTextColor(row.percentage)}`}>
                          {row.percentage}%
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {row.affectedOffices.map((office, i) => (
                              <span key={i} className="px-2 py-0.5 bg-muted rounded text-xs">
                                {office}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table 4: Demographic Dissatisfaction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Table 4: Demographic Dissatisfaction Analysis</CardTitle>
            <CardDescription>
              Dissatisfaction patterns across age groups, sex, and client types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* By Age Group */}
              <div>
                <h4 className="font-semibold mb-3">By Age Group</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Group</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Dissatisfied</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demographics.byAgeGroup.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.value}</TableCell>
                          <TableCell className="text-right">{row.totalResponses}</TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">{row.dissatisfiedCount}</TableCell>
                          <TableCell className={`text-right font-semibold ${getSeverityTextColor(row.dissatisfactionRate)}`}>
                            {row.dissatisfactionRate}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* By Sex */}
              <div>
                <h4 className="font-semibold mb-3">By Sex</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sex</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Dissatisfied</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demographics.bySex.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.value}</TableCell>
                          <TableCell className="text-right">{row.totalResponses}</TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">{row.dissatisfiedCount}</TableCell>
                          <TableCell className={`text-right font-semibold ${getSeverityTextColor(row.dissatisfactionRate)}`}>
                            {row.dissatisfactionRate}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* By Client Type */}
              <div>
                <h4 className="font-semibold mb-3">By Client Type</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Type</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Dissatisfied</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demographics.byClientType.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.value}</TableCell>
                          <TableCell className="text-right">{row.totalResponses}</TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">{row.dissatisfiedCount}</TableCell>
                          <TableCell className={`text-right font-semibold ${getSeverityTextColor(row.dissatisfactionRate)}`}>
                            {row.dissatisfactionRate}%
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

        {/* Table 5: Dissatisfaction Trends */}
        {trends.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Table 5: Dissatisfaction Trends Over Time</CardTitle>
              <CardDescription>
                Daily breakdown of dissatisfaction patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total Responses</TableHead>
                      <TableHead className="text-right">Dissatisfied</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trends.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell className="text-right">{row.totalResponses}</TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">{row.dissatisfiedResponses}</TableCell>
                        <TableCell className={`text-right font-semibold ${getSeverityTextColor(row.dissatisfactionRate)}`}>
                          {row.dissatisfactionRate}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table 6: All Comments/Suggestions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Table 6: All Comments and Suggestions ({comments.length})
            </CardTitle>
            <CardDescription>
              Complete feedback with dissatisfied responses highlighted first
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No comments available.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Client Type</TableHead>
                      <TableHead>Doc #</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.map((row, index) => (
                      <TableRow key={index} className={row.hasDissatisfaction ? "bg-red-50 dark:bg-red-900/10" : ""}>
                        <TableCell className="text-xs whitespace-nowrap">{row.timestamp}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.office}</TableCell>
                        <TableCell>{row.clientType}</TableCell>
                        <TableCell>{row.documentNumber || "-"}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="line-clamp-3">{row.comment}</div>
                        </TableCell>
                        <TableCell>
                          {row.hasDissatisfaction ? (
                            <div className="flex gap-1 flex-wrap">
                              {row.problematicDimensions.map((dim, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">
                                  {dim}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 text-xs">None</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print Header */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-center">Dissatisfaction Analysis Report</h1>
          <p className="text-center text-muted-foreground">
            {selectedCampus !== "All Campuses" ? selectedCampus : "All Campuses"} - 
            {selectedOffice !== "All Offices" ? selectedOffice : "All Offices"}
          </p>
          <p className="text-center text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  );
};

export default DissatisfactionReport;
