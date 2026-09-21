import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export interface TrendDataPoint {
  date: string;
  attendanceRate: number;
}

export interface StudentAtRisk {
  name: string;
  studentId: string;
  missedClasses: number;
}

interface AttendanceTrendsChartProps {
  trendData: TrendDataPoint[];
  atRiskStudents: StudentAtRisk[];
}

export const AttendanceTrendsChart: React.FC<AttendanceTrendsChartProps> = ({
  trendData,
  atRiskStudents,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Line Chart for Attendance Trends */}
      <div className="bg-white p-5 rounded-2xl border border-[#e1e3e4] shadow-xs">
        <h3 className="text-[15px] font-bold text-[#031635] mb-4">Overall Attendance Trend</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f5" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#75777f' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#75777f' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e1e3e4', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="attendanceRate"
                name="Attendance Rate (%)"
                stroke="#031635"
                strokeWidth={3}
                dot={{ r: 4, fill: '#031635', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#a0f399', stroke: '#005312', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart for At-Risk Students */}
      <div className="bg-white p-5 rounded-2xl border border-[#e1e3e4] shadow-xs">
        <h3 className="text-[15px] font-bold text-[#ba1a1a] mb-4">Students Consistently Missing Classes</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={atRiskStudents} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#75777f' }} />
              <YAxis tick={{ fontSize: 11, fill: '#75777f' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #ffdad6', fontSize: '12px', color: '#ba1a1a' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
              <Bar
                dataKey="missedClasses"
                name="Missed Classes"
                fill="#ffdad6"
                stroke="#ba1a1a"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
