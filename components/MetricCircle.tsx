
import React from 'react';

interface MetricCircleProps {
    label: string;
    percentage: number;
}

const MetricCircle: React.FC<MetricCircleProps> = ({ label, percentage }) => {
    const circumference = 2 * Math.PI * 45; // r = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = percentage > 80 ? 'text-green-400' : percentage > 50 ? 'text-yellow-400' : 'text-red-400';
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        className="text-gray-600"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    {/* Progress circle */}
                    <circle
                        className={color}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                    />
                    <text x="50" y="52" className="text-2xl font-bold fill-current text-white" textAnchor="middle" dominantBaseline="middle">
                        {percentage}%
                    </text>
                </svg>
            </div>
            <span className="mt-2 text-sm font-semibold">{label}</span>
        </div>
    );
};

export default MetricCircle;
