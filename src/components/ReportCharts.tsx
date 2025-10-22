import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a78bfa', '#f472b6', '#fb923c', '#34d399'];

interface DistributionChartProps {
  data: Record<string, number>;
  title: string;
  type?: "bar" | "pie";
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
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
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
          <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
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
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
