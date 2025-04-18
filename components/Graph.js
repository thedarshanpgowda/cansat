'use client'
import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Thermometer,
    Droplets,
    Gauge,
    Zap,
    Mountain,
    ArrowUpDown
} from 'lucide-react';
import axios from 'axios';

const generateData = () => {
    const now = new Date();
    const data = [];

    for (let i = 20; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3000);
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temperature: 20 + Math.random() * 10,
            humidity: 40 + Math.random() * 30,
            pressure: 1010 + Math.random() * 10,
            gasResistance: 8 + Math.random() * 4
        });
    }

    return data;
};

export default function EnvironmentalDashboard({ bmeData }) {
    const [activeMetric, setActiveMetric] = useState('temperature');
    const [data, setData] = useState(bmeData || generateData());

    const metrics = {
        temperature: {
            name: 'Temperature',
            unit: '°C',
            color: '#FF6B6B',
            icon: <Thermometer size={20} strokeWidth={2} />,
            current: Math.round(data[data.length - 1]?.temperature * 10) / 10,
            graphable: true
        },
        humidity: {
            name: 'Humidity',
            unit: '%',
            color: '#4ECDC4',
            icon: <Droplets size={20} strokeWidth={2} />,
            current: Math.round(data[data.length - 1]?.humidity),
            graphable: true
        },
        pressure: {
            name: 'Pressure',
            unit: 'hPa',
            color: '#FFB347',
            icon: <Gauge size={20} strokeWidth={2} />,
            current: Math.round(data[data.length - 1]?.pressure * 10) / 10,
            graphable: true
        },
        gasResistance: {
            name: 'Gas Resistance',
            unit: 'kΩ',
            color: '#6A0572',
            icon: <Zap size={20} strokeWidth={2} />,
            current: Math.round(data[data.length - 1]?.gasResistance * 10) / 10,
            graphable: true
        },
        altitude: {
            name: 'Altitude',
            unit: 'm',
            color: '#1E88E5',
            icon: <Mountain size={20} strokeWidth={2} />,
            current: Math.round(150 + Math.random() * 10),
            graphable: false
        },
        verticalSpeed: {
            name: 'Vertical Speed',
            unit: 'm/s',
            color: '#43A047',
            icon: <ArrowUpDown size={20} strokeWidth={2} />,
            current: Math.round((Math.random() * 2 - 1) * 10) / 10,
            graphable: false
        }
    };


    useEffect(() => {
        if (data.length > 0) {
            const latestData = data[data.length - 1];
            metrics.temperature.current = Math.round(latestData.temperature * 10) / 10;
            metrics.humidity.current = Math.round(latestData.humidity);
            metrics.pressure.current = Math.round(latestData.pressure * 10) / 10;
            metrics.gasResistance.current = Math.round(latestData.gasResistance * 10) / 10;
        }
    }, [data]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <p className="text-gray-600 font-medium">{label}</p>
                    <p className="font-semibold text-lg" style={{ color: metrics[activeMetric].color }}>
                        {`${metrics[activeMetric].name}: ${payload[0].value.toFixed(1)} ${metrics[activeMetric].unit}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const getYAxisDomain = () => {
        switch (activeMetric) {
            case 'temperature':
                return [15, 35];
            case 'humidity':
                return [30, 80];
            case 'pressure':
                return [900, 950];
            case 'gasResistance':
                return [0, 100];
            default:
                return [0, 100];
        }
    };

    const graphableMetrics = Object.keys(metrics).filter(key => metrics[key].graphable);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto  font-sans">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Environmental Data</h2>
                    <div className="text-sm text-gray-500">1 minute data with 3s intervals</div>
                </div>

                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {graphableMetrics.map(key => (
                        <button
                            key={key}
                            onClick={() => setActiveMetric(key)}
                            className={`flex items-center px-4 py-2 rounded-full transition-all ${activeMetric === key
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <span className="mr-2">{metrics[key].icon}</span>
                            <span>{metrics[key].name}</span>
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="time"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={{ stroke: '#e5e7eb' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                domain={getYAxisDomain()}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={{ stroke: '#e5e7eb' }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                label={{
                                    value: metrics[activeMetric].unit,
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fill: '#6b7280', fontSize: 12 }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey={activeMetric}
                                stroke={metrics[activeMetric].color}
                                strokeWidth={3}
                                dot={{ r: 0 }}
                                activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                                animationDuration={500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Object.keys(metrics).map(key => (
                    <div
                        key={key}
                        className={`bg-white rounded-2xl shadow-md p-5 border border-gray-100 transition-all hover:shadow-lg ${activeMetric === key && metrics[key].graphable ? 'ring-2 ring-offset-2' : ''
                            } ${metrics[key].graphable ? 'cursor-pointer' : ''}`}
                        style={{ ringColor: metrics[key].color }}
                        onClick={() => metrics[key].graphable && setActiveMetric(key)}
                    >
                        <div className="flex items-center mb-3">
                            <div
                                className="p-2 rounded-full mr-3"
                                style={{ backgroundColor: `${metrics[key].color}15` }}
                            >
                                <div style={{ color: metrics[key].color }}>{metrics[key].icon}</div>
                            </div>
                            <span className="text-base font-medium text-gray-500">{metrics[key].name}</span>
                        </div>
                        <div className="flex items-baseline">
                            <div className="text-2xl font-bold tracking-tight" style={{ color: metrics[key].color }}>
                                {metrics[key].current}
                            </div>
                            <div className="ml-2 text-gray-500 font-small">{metrics[key].unit}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}