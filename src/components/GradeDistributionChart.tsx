
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Subject } from './Dashboard';

interface GradeDistributionChartProps {
  subjects: Subject[];
}

export const GradeDistributionChart = ({ subjects }: GradeDistributionChartProps) => {
  // Raggruppa i voti per fasce
  const allGrades = subjects.flatMap(subject => subject.grades);
  
  const gradeRanges = [
    { name: 'Insufficiente (< 6)', min: 0, max: 5.99, color: '#ef4444', count: 0 },
    { name: 'Sufficiente (6-6.99)', min: 6, max: 6.99, color: '#f59e0b', count: 0 },
    { name: 'Buono (7-7.99)', min: 7, max: 7.99, color: '#3b82f6', count: 0 },
    { name: 'Distinto (8-8.99)', min: 8, max: 8.99, color: '#10b981', count: 0 },
    { name: 'Ottimo (9-10)', min: 9, max: 10, color: '#8b5cf6', count: 0 }
  ];

  // Conta i voti per ogni fascia
  allGrades.forEach(grade => {
    const range = gradeRanges.find(r => grade.value >= r.min && grade.value <= r.max);
    if (range) range.count++;
  });

  // Filtra le fasce con almeno un voto
  const chartData = gradeRanges.filter(range => range.count > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.count / allGrades.length) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.count} voti ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Non mostrare label per fette troppo piccole
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color, fontSize: '12px' }}>
                {value} ({entry.payload.count})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
