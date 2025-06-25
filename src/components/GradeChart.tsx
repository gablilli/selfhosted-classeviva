
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Subject } from './Dashboard';

interface GradeChartProps {
  subjects: Subject[];
}

export const GradeChart = ({ subjects }: GradeChartProps) => {
  // Prepara i dati per il grafico combinando tutti i voti
  const chartData = subjects
    .flatMap(subject => 
      subject.grades.map(grade => ({
        date: grade.date,
        value: grade.value,
        subject: grade.subject,
        description: grade.description,
        timestamp: new Date(grade.date).getTime()
      }))
    )
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((grade, index) => ({
      ...grade,
      index: index + 1,
      formattedDate: new Date(grade.date).toLocaleDateString('it-IT', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));

  // Calcola media mobile per trend
  const dataWithTrend = chartData.map((item, index) => {
    const recentGrades = chartData.slice(Math.max(0, index - 2), index + 1);
    const trend = recentGrades.reduce((sum, g) => sum + g.value, 0) / recentGrades.length;
    return {
      ...item,
      trend: Number(trend.toFixed(2))
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.subject}</p>
          <p className="text-sm text-gray-600">{data.description}</p>
          <p className="text-sm text-gray-500">{new Date(data.date).toLocaleDateString('it-IT')}</p>
          <p className="text-lg font-bold text-blue-600">Voto: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dataWithTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[4, 10]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Voto', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
            name="Voti"
          />
          <Line 
            type="monotone" 
            dataKey="trend" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Trend (media mobile)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
