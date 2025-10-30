import { BarChart, Bar, PieChart, Pie, Cell, LineChart, LabelList, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CC1Distribution, CC2Distribution, CC3Distribution } from "@/utils/reportAnalytics";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa', '#f472b6', '#fb923c', '#34d399'];


interface DistributionChartProps {
  data: Record<string, number>;
  title: string;
  type?: "bar" | "pie";
  layout?: "horizontal" | "vertical";
}

export const DistributionChart = ({ data, title, type = "bar" }: DistributionChartProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No data available for {title}
      </div>
    );
  }

  if (type === "pie") {
    return (
      <div className="w-full h-80">
        <h4 className="text-sm font-semibold mb-4 text-center">{title}</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} interval={0}/>
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8">
            <LabelList 
            dataKey="value" 
              position="top"
              style={{
                fontSize: 9,
                fill: "#000", // visible when printed
              }}
            />
          </Bar>
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface AverageChartProps {
  data: Record<string, number>;
  title: string;
}

export const AverageChart = ({ data, title }: AverageChartProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.toUpperCase(),
    average: parseFloat(value.toFixed(2)),
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No data available for {title}
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2}>
            <LabelList
              dataKey="average"
              position="top"
              style={{
                fontSize: 9,
                fill: "#000",
              }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TopServicesChartProps {
  data: Array<{ service: string; count: number }>;
}

export const TopServicesChart = ({ data }: TopServicesChartProps) => {
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No services data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <h4 className="text-sm font-semibold mb-4">Top 10 Services Requested</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="service" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d">
            <LabelList 
              dataKey="count" 
              position="right"
              style={{
                fontSize: 9,
                fill: "#000", // visible when printed
              }}
            />
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TimeSeriesChartProps {
  data: Array<{ date: string; responses: number; avgCC: number; avgSQD: number }>;
}

export const TimeSeriesChart = ({ data }: TimeSeriesChartProps) => {
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No time series data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <h4 className="text-sm font-semibold mb-4">Response Trends Over Time</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="responses" stroke="#8884d8" name="Responses" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="avgCC" stroke="#82ca9d" name="Avg CC" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="avgSQD" stroke="#ffc658" name="Avg SQD" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SatisfactionComparisonProps {
  data: Record<string, { avgCC: number; avgSQD: number; count: number }>;
  title: string;
  categoryName: string;
}

export const SatisfactionComparisonChart = ({ data, title, categoryName }: SatisfactionComparisonProps) => {
  const chartData = Object.entries(data).map(([name, values]) => ({
    name,
    'CC Rating': values.avgCC,
    'SQD Rating': values.avgSQD,
    responses: values.count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No data available for {title}
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{top:30}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          {/* <Bar dataKey="CC Rating" fill="#8884d8" /> */}
          <Bar dataKey="SQD Rating" fill="#3b82f6" >
            <LabelList
              dataKey="SQD Rating"
              position="top"
              style={{
                fontSize: 9,
                fill: "#000", // visible when printed
              }}
            />
          </Bar>
          
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface OfficePerformanceProps {
  data: Array<{ office: string; count: number; avgCC: number; avgSQD: number }>;
}

export const OfficePerformanceChart = ({ data }: OfficePerformanceProps) => {
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No office performance data available
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <h4 className="text-sm font-semibold mb-4">Office Performance Metrics</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="office" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Responses">
            <LabelList 
            dataKey="count"
              position="right"
              style={{
                fontSize: 9,
                fill: "#000", // visible when printed
              }}
            />
          </Bar>
          {/* <Bar dataKey="avgSQD" fill="#ffc658" name="Avg SQD" /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
