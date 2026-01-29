import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Table2, AlertTriangle, CheckCircle, XCircle, AlertCircle, MessageSquare, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormData } from "@/types/form";
import {
  calculateSummaryStatistics,
  calculateOfficeMetrics,
  calculateDemographicBreakdown,
  getScoreColor,
  getScoreBgColor,
  getInterpretation,
  SQD_LABELS,
  type SummaryStatistics,
  type OfficeMetrics,
  type DemographicBreakdown,
} from "@/utils/artaScoring";
import { DistributionChart } from "@/components/ReportCharts";
import { CC1AwarenessChart, CC2VisibilityChart, CC3HelpfulnessChart } from "@/components/CCCharts";
import { analyzeByCampus, CampusMetrics } from "@/utils/reportAnalytics";

const Report = () => {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<FormData[]>([]);
  const [filteredData, setFilteredData] = useState<FormData[]>([]);
  const [summary, setSummary] = useState<SummaryStatistics | null>(null);
  const [officeMetrics, setOfficeMetrics] = useState<OfficeMetrics[]>([]);
  const [campusMetrics, setCampusMetrics] = useState<CampusMetrics[]>([]);
  const [demographics, setDemographics] = useState<{
    byClientType: DemographicBreakdown[];
    bySex: DemographicBreakdown[];
    byAgeGroup: DemographicBreakdown[];
  }>({ byClientType: [], bySex: [], byAgeGroup: [] });
  
  const [selectedCampus, setSelectedCampus] = useState<string>("All Campuses");
  const [selectedOffice, setSelectedOffice] = useState<string>("All Offices");
  const [availableCampuses, setAvailableCampuses] = useState<string[]>([]);
  const [availableOffices, setAvailableOffices] = useState<string[]>([]);

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
      
      generateAllMetrics(data);
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
    generateAllMetrics(filtered);
  }, [selectedCampus, selectedOffice, allData]);

  const generateAllMetrics = (data: FormData[]) => {
    setSummary(calculateSummaryStatistics(data));
    setOfficeMetrics(calculateOfficeMetrics(data));
    setCampusMetrics(analyzeByCampus(data));
    setDemographics({
      byClientType: calculateDemographicBreakdown(data, "clientType"),
      bySex: calculateDemographicBreakdown(data, "sex"),
      byAgeGroup: calculateDemographicBreakdown(data, "ageGroup"),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getInterpretationBadge = (level: string) => {
    const colors: Record<string, string> = {
      "Very High": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      "High": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "Moderate": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      "Low": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      "Very Low": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  if (!summary || allData.length === 0) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#800000] text-white py-4 shadow-lg print:hidden">
        <div className="container mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Client Satisfaction Measurement Report</h1>
            <p className="text-sm opacity-90">Consolidated Analysis (ARTA-Compliant)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => navigate("/tabular-report")}>
              <Table2 className="w-4 h-4 mr-2" />
              Tabular
            </Button>
            <Button variant="secondary" onClick={() => navigate("/dissatisfaction-report")}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Dissatisfaction
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

      {/* Print Header */}
      <div className="hidden print:block text-center py-6">
        <h1 className="text-2xl font-bold">Client Satisfaction Measurement Report</h1>
        <p className="text-muted-foreground">Consolidated Analysis</p>
        <p className="text-sm text-muted-foreground mt-2">
          Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 print:hidden">
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Filter by campus and/or office</CardDescription>
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

        {/* I. Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">I. Executive Summary</CardTitle>
            <CardDescription>
              Overall metrics for {selectedCampus} - {selectedOffice}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{summary.totalResponses}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Responses</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{summary.campusCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Campuses</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-primary">{summary.officeCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Offices</div>
              </div>
              <div className={`text-center p-4 rounded-lg ${getScoreBgColor(summary.overallSQD)}`}>
                <div className={`text-3xl font-bold ${getScoreColor(summary.overallSQD)}`}>
                  {summary.overallSQD.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Overall SQD Score</div>
              </div>
            </div>

            {/* CC Summary Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${getScoreBgColor(summary.overallAwareness)}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">CC1: Awareness</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getInterpretationBadge(summary.awarenessInterpretation)}`}>
                    {summary.awarenessInterpretation}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(summary.overallAwareness)}`}>
                  {summary.overallAwareness.toFixed(1)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${getScoreBgColor(summary.overallVisibility)}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">CC2: Visibility</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getInterpretationBadge(summary.visibilityInterpretation)}`}>
                    {summary.visibilityInterpretation}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(summary.overallVisibility)}`}>
                  {summary.overallVisibility.toFixed(1)}%
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${getScoreBgColor(summary.overallHelpfulness)}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">CC3: Helpfulness</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getInterpretationBadge(summary.helpfulnessInterpretation)}`}>
                    {summary.helpfulnessInterpretation}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(summary.overallHelpfulness)}`}>
                  {summary.overallHelpfulness.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Problem Areas Alert */}
            {summary.problemAreas.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800 dark:text-red-200">Areas Requiring Attention</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {summary.problemAreas.map((area, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-sm">
                      {area.area}: {area.score.toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* II. Client Demographics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">II. Client Demographics</CardTitle>
            <CardDescription>Distribution of respondents by demographic factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* By Client Type */}
              <div>
                <h4 className="font-semibold mb-3">By Client Type</h4>
                {campusMetrics[0] && (
                  <DistributionChart 
                    data={campusMetrics[0].clientTypeDistribution} 
                    title="" 
                    type="pie"
                  />
                )}
                <div className="mt-4 space-y-2">
                  {demographics.byClientType.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.value}</span>
                      <span className="font-medium">{item.count} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Sex */}
              <div>
                <h4 className="font-semibold mb-3">By Sex</h4>
                {campusMetrics[0] && (
                  <DistributionChart 
                    data={campusMetrics[0].sexDistribution} 
                    title="" 
                    type="pie"
                  />
                )}
                <div className="mt-4 space-y-2">
                  {demographics.bySex.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.value}</span>
                      <span className="font-medium">{item.count} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Age Group */}
              <div>
                <h4 className="font-semibold mb-3">By Age Group</h4>
                {campusMetrics[0] && (
                  <DistributionChart 
                    data={campusMetrics[0].ageGroupDistribution} 
                    title="" 
                    type="bar"
                  />
                )}
                <div className="mt-4 space-y-2">
                  {demographics.byAgeGroup.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.value}</span>
                      <span className="font-medium">{item.count} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* III. Citizen's Charter Results */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">III. Citizen's Charter Results</CardTitle>
            <CardDescription>
              Assessment of Citizen's Charter awareness, visibility, and helpfulness
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* CC Summary Table */}
            <div className="overflow-x-auto mb-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CC Code</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Interpretation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">CC1</TableCell>
                    <TableCell>Awareness</TableCell>
                    <TableCell className={`text-right font-bold ${getScoreColor(summary.overallAwareness)}`}>
                      {summary.overallAwareness.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-xs ${getInterpretationBadge(summary.awarenessInterpretation)}`}>
                        {summary.awarenessInterpretation} Awareness
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">CC2</TableCell>
                    <TableCell>Visibility</TableCell>
                    <TableCell className={`text-right font-bold ${getScoreColor(summary.overallVisibility)}`}>
                      {summary.overallVisibility.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-xs ${getInterpretationBadge(summary.visibilityInterpretation)}`}>
                        {summary.visibilityInterpretation} Visibility
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">CC3</TableCell>
                    <TableCell>Helpfulness</TableCell>
                    <TableCell className={`text-right font-bold ${getScoreColor(summary.overallHelpfulness)}`}>
                      {summary.overallHelpfulness.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-xs ${getInterpretationBadge(summary.helpfulnessInterpretation)}`}>
                        {summary.helpfulnessInterpretation} Helpfulness
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* CC Distribution Charts */}
            {campusMetrics[0] && (
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">CC1: Awareness Distribution</h4>
                  <CC1AwarenessChart data={campusMetrics[0].ccDistributions.cc1} />
                </div>
                <div>
                  <h4 className="font-semibold mb-3">CC2: Visibility Distribution</h4>
                  <CC2VisibilityChart data={campusMetrics[0].ccDistributions.cc2} />
                </div>
                <div>
                  <h4 className="font-semibold mb-3">CC3: Helpfulness Distribution</h4>
                  <CC3HelpfulnessChart data={campusMetrics[0].ccDistributions.cc3} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* IV. Service Quality Dimensions Results */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">IV. Service Quality Dimensions (SQD) Results</CardTitle>
            <CardDescription>
              Assessment across 9 service quality dimensions using % Favorable scoring (Agree + Strongly Agree)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Overall SQD Summary */}
            <div className={`p-4 rounded-lg border mb-6 ${getScoreBgColor(summary.overallSQD)}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">Overall Average Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(summary.overallSQD)}`}>
                    {summary.overallSQD.toFixed(2)}%
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${getInterpretationBadge(summary.overallSQDInterpretation)}`}>
                  {summary.overallSQDInterpretation} Service Quality
                </span>
              </div>
            </div>

            {/* SQD Breakdown Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SQD Code</TableHead>
                    <TableHead>Dimension</TableHead>
                    <TableHead className="max-w-xs">Sample Question</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Interpretation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.sqdByDimension.map((sqd, index) => (
                    <TableRow key={index} className={sqd.score < 70 ? "bg-red-50 dark:bg-red-900/10" : ""}>
                      <TableCell className="font-medium">{sqd.code}</TableCell>
                      <TableCell>{sqd.dimension}</TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">
                        {SQD_LABELS[sqd.code.toLowerCase()]?.question}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${getScoreColor(sqd.score)}`}>
                        {sqd.score.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs ${getInterpretationBadge(sqd.interpretation)}`}>
                          {sqd.interpretation}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Interpretation Legend */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h5 className="font-semibold mb-3">Interpretation Guide (ARTA Guidelines)</h5>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${getInterpretationBadge("Very High")}`}>Very High (90-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${getInterpretationBadge("High")}`}>High (80-89)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${getInterpretationBadge("Moderate")}`}>Moderate (70-79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${getInterpretationBadge("Low")}`}>Low (60-69)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${getInterpretationBadge("Very Low")}`}>Very Low (&lt;60)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* V. Office-Level Results */}
        {selectedOffice === "All Offices" && officeMetrics.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">V. Office-Level Results</CardTitle>
              <CardDescription>
                Citizen's Charter and SQD scores by office
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* CC Results by Office */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4">Citizen's Charter Results by Office</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Office</TableHead>
                        <TableHead className="text-right">Responses</TableHead>
                        <TableHead className="text-right">CC1 Awareness</TableHead>
                        <TableHead>Interpretation</TableHead>
                        <TableHead className="text-right">CC2 Visibility</TableHead>
                        <TableHead>Interpretation</TableHead>
                        <TableHead className="text-right">CC3 Helpfulness</TableHead>
                        <TableHead>Interpretation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {officeMetrics.map((office, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{office.office}</TableCell>
                          <TableCell className="text-right">{office.totalResponses}</TableCell>
                          <TableCell className={`text-right font-medium ${getScoreColor(office.cc1Score)}`}>
                            {office.cc1Score.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getInterpretationBadge(office.cc1Interpretation)}`}>
                              {office.cc1Interpretation}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${getScoreColor(office.cc2Score)}`}>
                            {office.cc2Score.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getInterpretationBadge(office.cc2Interpretation)}`}>
                              {office.cc2Interpretation}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${getScoreColor(office.cc3Score)}`}>
                            {office.cc3Score.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getInterpretationBadge(office.cc3Interpretation)}`}>
                              {office.cc3Interpretation}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* SQD0 Results by Office */}
              <div>
                <h4 className="font-semibold mb-4">SQD0 (Overall Satisfaction) Results by Office</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Office</TableHead>
                        <TableHead className="text-right">SQD0 Score</TableHead>
                        <TableHead>Interpretation</TableHead>
                        <TableHead className="text-right">Overall SQD</TableHead>
                        <TableHead>Interpretation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {officeMetrics.map((office, index) => (
                        <TableRow key={index} className={office.sqdScores.sqd0 < 70 ? "bg-red-50 dark:bg-red-900/10" : ""}>
                          <TableCell className="font-medium">{office.office}</TableCell>
                          <TableCell className={`text-right font-medium ${getScoreColor(office.sqdScores.sqd0)}`}>
                            {office.sqdScores.sqd0.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getInterpretationBadge(office.sqdInterpretations.sqd0)}`}>
                              {office.sqdInterpretations.sqd0}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${getScoreColor(office.overallSQDScore)}`}>
                            {office.overallSQDScore.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getInterpretationBadge(office.overallSQDInterpretation)}`}>
                              {office.overallSQDInterpretation}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* VI. Key Findings & Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">VI. Key Findings & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Positive Findings */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Strengths (Scores ≥80%)
              </h4>
              <div className="space-y-2">
                {summary.sqdByDimension.filter(s => s.score >= 80).length > 0 ? (
                  summary.sqdByDimension.filter(s => s.score >= 80).map((sqd, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                        {sqd.code}: {sqd.score.toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">{sqd.dimension}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No dimensions currently meet the 80% threshold.</p>
                )}
                {summary.overallAwareness >= 80 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      CC1: {summary.overallAwareness.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">Citizen's Charter Awareness</span>
                  </div>
                )}
                {summary.overallVisibility >= 80 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      CC2: {summary.overallVisibility.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">Citizen's Charter Visibility</span>
                  </div>
                )}
                {summary.overallHelpfulness >= 80 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      CC3: {summary.overallHelpfulness.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">Citizen's Charter Helpfulness</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Areas for Improvement */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Areas for Improvement (Scores &lt;70%)
              </h4>
              {summary.problemAreas.length > 0 ? (
                <div className="space-y-3">
                  {summary.problemAreas.map((area, idx) => (
                    <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-red-800 dark:text-red-200">{area.area}</span>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-sm">
                          {area.score.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {area.type === "SQD" 
                          ? "Clients rated this service dimension below acceptable levels. Review and improve service delivery processes."
                          : "The Citizen's Charter effectiveness in this area needs immediate attention."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-600">
                  Excellent! All dimensions are above the 70% threshold.
                </p>
              )}
            </div>

            <Separator />

            {/* General Recommendations */}
            <div>
              <h4 className="font-semibold mb-3">General Recommendations</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Continue monitoring and maintaining strong performance in dimensions scoring above 90%.</li>
                <li>Focus improvement efforts on dimensions scoring below 80%, particularly those in the "Low" or "Very Low" categories.</li>
                <li>Conduct targeted interventions for offices showing consistently lower scores.</li>
                <li>Enhance Citizen's Charter visibility through digital displays and strategic placement.</li>
                <li>Regular staff training on service quality standards and client interaction.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* VII. Comments & Suggestions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              VII. Comments & Suggestions
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span>Client feedback from respondents</span>
              {(selectedCampus !== "All Campuses" || selectedOffice !== "All Offices") && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-muted-foreground">—</span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCampus !== "All Campuses" && selectedCampus}
                    {selectedCampus !== "All Campuses" && selectedOffice !== "All Offices" && " / "}
                    {selectedOffice !== "All Offices" && selectedOffice}
                  </Badge>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const comments = filteredData
                .filter(row => row.comments && row.comments.trim() !== "")
                .map(row => ({
                  timestamp: row.timestamp,
                  campus: row.campus,
                  office: row.office,
                  clientType: row.clientType,
                  documentNumber: row.documentNumber,
                  comment: row.comments,
                }))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

              if (comments.length === 0) {
                return (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No comments available for the selected filter.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try selecting a different campus or office, or view all data.
                    </p>
                  </div>
                );
              }

              return (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
                    <Badge variant="outline" className="text-sm">
                      {comments.length} comment{comments.length !== 1 ? 's' : ''}
                    </Badge>
                    {(selectedCampus !== "All Campuses" || selectedOffice !== "All Offices") && (
                      <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
                        <Filter className="w-3 h-3" />
                        <span>Filtered by:</span>
                        {selectedCampus !== "All Campuses" && (
                          <Badge variant="outline" className="text-xs">{selectedCampus}</Badge>
                        )}
                        {selectedOffice !== "All Offices" && (
                          <Badge variant="outline" className="text-xs">{selectedOffice}</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <ScrollArea className="max-h-[500px] print:max-h-none">
                    <div className="space-y-4">
                      {comments.map((comment, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10"
                        >
                          {/* Header */}
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="font-medium text-foreground bg-background">
                              {comment.office}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {comment.campus}
                            </Badge>
                            <span>•</span>
                            <span>Client: {comment.clientType}</span>
                            <span>•</span>
                            <span>{comment.timestamp}</span>
                            {comment.documentNumber && (
                              <>
                                <span>•</span>
                                <span>Doc #{comment.documentNumber}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Comment Text */}
                          <p className="text-foreground">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Report Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
          <p className="mt-1">Based on ARTA Memorandum Circular No. 2022-05 Guidelines</p>
        </div>
      </main>
    </div>
  );
};

export default Report;
