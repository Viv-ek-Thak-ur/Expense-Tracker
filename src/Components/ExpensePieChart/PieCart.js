import {
  ResponsiveContainer,
  Pie,
  PieChart,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

function PieChartDisplay({ data }) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // convert object to array if needed
  const safeData = Array.isArray(data)
    ? data
    : Object.entries(data || {}).map(([name, value]) => ({
        name,
        value,
      }));

  return (
    <div style={{ width: "100%", height: 400 }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={safeData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
        >
          {safeData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          layout="horizontal" // legends in a row
          verticalAlign="bottom" // below the chart
          align="center" // center horizontally
        />
      </PieChart>
    </ResponsiveContainer>
    </div>
  );
}
export default PieChartDisplay;
