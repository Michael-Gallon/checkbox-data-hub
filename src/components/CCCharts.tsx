import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CC1Distribution, CC2Distribution, CC3Distribution } from "@/utils/reportAnalytics";

const COLORS = {
  awareness: ['#10b981', '#3b82f6', '#f59e0b', '#9ca3af'],
  visibility: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#9ca3af'],
  helpfulness: ['#10b981', '#3b82f6', '#ef4444', '#9ca3af'],
};

interface CC1AwarenessChartProps {
  data: CC1Distribution;
}

export const CC1AwarenessChart = ({ data }: CC1AwarenessChartProps) => {
  const chartData = [
    { name: "Knew and saw charter", value: data["Knew and saw charter"], fill: COLORS.awareness[0] },
    { name: "Knew but didn't see", value: data["Knew but didn't see"], fill: COLORS.awareness[1] },
    { name: "Learned from this visit", value: data["Learned from this visit"], fill: COLORS.awareness[2] },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No awareness data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-20} textAnchor="end" height={100} interval={0} fontSize={12} />
          <YAxis label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value: number) => [`${value} responses (${((value / total) * 100).toFixed(1)}%)`, '']}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CC2VisibilityChartProps {
  data: CC2Distribution;
}

export const CC2VisibilityChart = ({ data }: CC2VisibilityChartProps) => {
  const chartData = [
    { name: "Easy to see", value: data["Easy to see"], fill: COLORS.visibility[0] },
    { name: "Somewhat easy to see", value: data["Somewhat easy to see"], fill: COLORS.visibility[1] },
    { name: "Difficult to see", value: data["Difficult to see"], fill: COLORS.visibility[2] },
    { name: "Not visible at all", value: data["Not visible at all"], fill: COLORS.visibility[3] },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No visibility data available
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" label={{ value: 'Number of Responses', position: 'insideBottom', offset: -5 }} />
          <YAxis type="category" dataKey="name" width={150} fontSize={12} />
          <Tooltip 
            formatter={(value: number) => [`${value} responses (${((value / total) * 100).toFixed(1)}%)`, '']}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CC3HelpfulnessChartProps {
  data: CC3Distribution;
}

export const CC3HelpfulnessChart = ({ data }: CC3HelpfulnessChartProps) => {
  const chartData = [
    { name: "Helped very much", value: data["Helped very much"], fill: COLORS.helpfulness[0] },
    { name: "Somewhat helped", value: data["Somewhat helped"], fill: COLORS.helpfulness[1] },
    { name: "Did not help", value: data["Did not help"], fill: COLORS.helpfulness[2] },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No helpfulness data available
      </div>
    );
  }

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name}: ${value} (${((value / total) * 100).toFixed(1)}%)`}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} responses (${((value / total) * 100).toFixed(1)}%)`, '']} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};