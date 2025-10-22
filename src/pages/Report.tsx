import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download } from "lucide-react";
import { FormData } from "@/types/form";
import { analyzeByCampus, calculateOverallMetrics, CampusMetrics } from "@/utils/reportAnalytics";
import { DistributionChart, AverageChart, TopServicesChart } from "@/components/ReportCharts";

const Report = () => {
  const navigate = useNavigate();
  const [campusMetrics, setCampusMetrics] = useState<CampusMetrics[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("encodedData");
    if (saved) {
      const data: FormData[] = JSON.parse(saved);
      setCampusMetrics(analyzeByCampus(data));
      setOverallMetrics(calculateOverallMetrics(data));
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!overallMetrics) {
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
      <header className="bg-[#800000] text-white py-4 shadow-lg print:hidden">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Statistical Report</h1>
            <p className="text-sm opacity-90">Comprehensive Data Analysis</p>
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

      <main className="container mx-auto px-4 py-8">
        {/* Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Executive Summary</CardTitle>
            <CardDescription>Overall metrics across all campuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{overallMetrics.totalResponses}</div>
                <div className="text-sm text-muted-foreground mt-2">Total Responses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{overallMetrics.campusCount}</div>
                <div className="text-sm text-muted-foreground mt-2">Campuses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {overallMetrics.avgCCSatisfaction.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Avg CC Rating (out of 5)</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {overallMetrics.avgSQDSatisfaction.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Avg SQD Rating (out of 5)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campus-by-Campus Analysis */}
        {campusMetrics.map((campus, index) => (
          <div key={campus.campus} className="mb-12">
            {index > 0 && <Separator className="my-8" />}
            
            <h2 className="text-3xl font-bold mb-6 text-primary">{campus.campus}</h2>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Campus Overview</CardTitle>
                <CardDescription>{campus.totalResponses} total responses collected</CardDescription>
              </CardHeader>
            </Card>

            {/* Demographics */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DistributionChart 
                    data={campus.clientTypeDistribution} 
                    title="" 
                    type="pie"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sex Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DistributionChart 
                    data={campus.sexDistribution} 
                    title="" 
                    type="pie"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Age Group Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DistributionChart 
                    data={campus.ageGroupDistribution} 
                    title="" 
                    type="bar"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Office Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DistributionChart 
                    data={campus.officeDistribution} 
                    title="" 
                    type="bar"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Citizen's Charter */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Citizen's Charter (CC) - Average Ratings</CardTitle>
                <CardDescription>Scale: 1 (Poor) to 5 (Excellent)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {campus.ccAverages.cc1.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">CC1 Average</div>
                  </div>
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {campus.ccAverages.cc2.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">CC2 Average</div>
                  </div>
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {campus.ccAverages.cc3.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">CC3 Average</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Quality Dimensions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Service Quality Dimensions (SQD) - Average Ratings</CardTitle>
                <CardDescription>Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)</CardDescription>
              </CardHeader>
              <CardContent>
                <AverageChart 
                  data={campus.sqdAverages} 
                  title=""
                />
              </CardContent>
            </Card>

            {/* Top Services */}
            {campus.topServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Requested Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopServicesChart data={campus.topServices} />
                </CardContent>
              </Card>
            )}
          </div>
        ))}

        {/* Key Insights */}
        <Separator className="my-8" />
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Overall Satisfaction</h4>
              <p className="text-sm text-muted-foreground">
                The average Citizen's Charter rating across all campuses is{" "}
                <span className="font-semibold text-foreground">
                  {overallMetrics.avgCCSatisfaction.toFixed(2)}/5.0
                </span>
                , indicating {overallMetrics.avgCCSatisfaction >= 4 ? "high" : overallMetrics.avgCCSatisfaction >= 3 ? "moderate" : "low"} satisfaction
                with service delivery standards.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Service Quality</h4>
              <p className="text-sm text-muted-foreground">
                The Service Quality Dimensions average rating is{" "}
                <span className="font-semibold text-foreground">
                  {overallMetrics.avgSQDSatisfaction.toFixed(2)}/5.0
                </span>
                , suggesting {overallMetrics.avgSQDSatisfaction >= 4 ? "strong" : overallMetrics.avgSQDSatisfaction >= 3 ? "adequate" : "areas requiring improvement in"} service
                quality across multiple dimensions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Campus Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Analysis shows varying response rates across {overallMetrics.campusCount} campuses.
                Consider focusing improvement efforts on campuses with lower satisfaction scores
                and replicating best practices from high-performing campuses.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-8 print:mt-4">
          Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </main>
    </div>
  );
};

export default Report;
