import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MilestoneData {
  date: string;
  milestones: number;
}

interface MilestoneChartProps {
  data: MilestoneData[];
  chartType?: 'line' | 'bar';
}

const MilestoneChart: React.FC<MilestoneChartProps> = ({ data, chartType = 'line' }) => {
  // Sort data by week and format for Chart.js
  const sortedData = [...data].sort((a, b) => {
    // Extract week numbers for sorting (e.g., "Week 30, 2025" -> 30)
    const extractWeek = (str: string) => {
      const match = str.match(/Week (\d+), (\d+)/);
      if (match) {
        const year = parseInt(match[2]);
        const week = parseInt(match[1]);
        return year * 100 + week; // Simple sorting key
      }
      return 0;
    };
    return extractWeek(a.date) - extractWeek(b.date);
  });
  
  const labels = sortedData.map(item => {
    // Convert week format to date range (e.g., "Week 30, 2025" -> "Jul 21-27")
    const match = item.date.match(/Week (\d+), (\d+)/);
    if (match) {
      const week = parseInt(match[1]);
      const year = parseInt(match[2]);
      
      // Calculate the start date of the week (assuming week starts on Monday)
      // Week 1 is the first week with a Thursday in the year
      const jan1 = new Date(year, 0, 1);
      const jan1Day = jan1.getDay() || 7; // Convert Sunday (0) to 7
      const firstThursday = new Date(year, 0, 1 + (4 - jan1Day + 7) % 7);
      const weekStart = new Date(firstThursday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
      
      // Adjust to Monday (start of week)
      const monday = new Date(weekStart);
      monday.setDate(weekStart.getDate() - 3);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      // Format the date range
      const currentYear = new Date().getFullYear();
      const formatOptions: Intl.DateTimeFormatOptions = { 
        month: 'short', 
        day: 'numeric'
      };
      
      if (year !== currentYear) {
        formatOptions.year = 'numeric';
      }
      
      const startStr = monday.toLocaleDateString('en-US', formatOptions);
      const endStr = sunday.toLocaleDateString('en-US', formatOptions);
      
      // If both dates are in the same month, show "Jul 21-27"
      if (monday.getMonth() === sunday.getMonth()) {
        const monthDay = startStr.split(' ');
        return `${monthDay[0]} ${monthDay[1]}-${sunday.getDate()}`;
      } else {
        // If different months, show "Jul 30-Aug 5"
        return `${startStr}-${endStr}`;
      }
    }
    return item.date;
  });
  
  const milestoneData = sortedData.map(item => item.milestones);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Milestones Completed',
        data: milestoneData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: chartType === 'bar' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: chartType === 'line',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
      },
      title: {
        display: true,
        text: 'Weekly Milestone Completions',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#1F2937',
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            // Show full week info in tooltip
            const index = context[0].dataIndex;
            return sortedData[index]?.date || '';
          },
          label: function(context: any) {
            const count = context.parsed.y;
            return `${count} milestone${count !== 1 ? 's' : ''} completed`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          stepSize: 1,
        },
      },
    },
  };

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No milestone data yet</h3>
          <p className="text-gray-500 mb-4">Complete some milestones to see your weekly progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="h-80">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total milestones completed: <span className="font-semibold text-blue-600">
            {milestoneData.reduce((sum, count) => sum + count, 0)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default MilestoneChart;
