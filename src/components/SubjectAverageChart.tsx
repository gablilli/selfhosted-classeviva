
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Subject } from './Dashboard';

interface SubjectAverageChartProps {
  subjects: Subject[];
}

export const SubjectAverageChart = ({ subjects }: SubjectAverageChartProps) => {
  const chartData = subjects.map(subject => ({
    name: subject.name,
    average: Number(subject.average.toFixed(2)),
    grades: subject.grades.length
  })).sort((a, b) => b.average - a.average);

  // Colori basati sulla media
  const getBarColor = (average: number) => {
    if (average >= 8) return '#10b981'; // Verde per ottimo
    if (average >= 7) return '#3b82f6'; // Blu per buono
    if (average >= 6) return '#f59e0b'; // Giallo per sufficiente
    return '#ef4444'; // Rosso per insufficiente
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: getBarColor(data.average) }}>
            Media: {data.average}
          </p>
          <p className="text-sm text-gray-600">{data.grades} voti</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[5, 10]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Media', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="average" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.average)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
