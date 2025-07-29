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
  // Sort data by date and format for Chart.js
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const labels = sortedData.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
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
        text: 'Milestone Completion Over Time',
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
          <p className="text-gray-500 mb-4">Complete some milestones to see your progress over time!</p>
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
