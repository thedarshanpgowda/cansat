'use client'

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import {
    MapPin,
    Satellite,
    Clock,
    Thermometer,
    Droplets,
    Gauge,
    Zap,
    Mountain,
    ArrowUpDown
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import AppleMinimalistSensorVisualizer from './Gyro';

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LocationTrackingDashboard() {
    const [position, setPosition] = useState([13.023742, 76.102257]);
    const [gpxTrack, setGpxTrack] = useState([]);
    const [satellites, setSatellites] = useState(0);
    const [hdop, setHdop] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [mpu60, setMpu60] = useState({})
    const [bmeData, setBmeData] = useState({
        temperature: 0,
        humidity: 0,
        pressure: 0,
        gasResistance: 0
    });
    const [data, setData] = useState([]);
    const [activeMetric, setActiveMetric] = useState('temperature');

    const metrics = {
        temperature: {
            name: 'Temperature',
            unit: '°C',
            color: '#FF6B6B',
            icon: <Thermometer size={20} strokeWidth={2} />,
            current: bmeData.temperature,
            graphable: true
        },
        humidity: {
            name: 'Humidity',
            unit: '%',
            color: '#4ECDC4',
            icon: <Droplets size={20} strokeWidth={2} />,
            current: bmeData.humidity,
            graphable: true
        },
        pressure: {
            name: 'Pressure',
            unit: 'hPa',
            color: '#FFB347',
            icon: <Gauge size={20} strokeWidth={2} />,
            current: bmeData.pressure,
            graphable: true
        },
        gasResistance: {
            name: 'Gas Resistance',
            unit: 'kΩ',
            color: '#6A0572',
            icon: <Zap size={20} strokeWidth={2} />,
            current: bmeData.gasResistance,
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
        const eventSource = new EventSource('http://localhost:3000/data');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(data);
                const newPosition = [
                    parseFloat(data.neom8n.latitude),
                    parseFloat(data.neom8n.longitude)
                ];

                setPosition(newPosition);
                setGpxTrack(prevTrack => [...prevTrack, newPosition]);


                setSatellites(parseInt(data.neom8n.satellites, 10));
                setHdop(parseFloat(data.neom8n.hdop));
                setSpeed(parseFloat(data.neom8n.speed_kmh));


                setBmeData({
                    temperature: parseFloat(data.bme680.temperature),
                    humidity: parseFloat(data.bme680.humidity),
                    pressure: parseFloat(data.bme680.pressure),
                    gasResistance: parseFloat(data.bme680.gas_resistance)
                });

                setMpu60(data.mpu6050);

                setData(prevData => [
                    ...prevData.slice(-19),
                    {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        temperature: parseFloat(data.bme680.temperature),
                        humidity: parseFloat(data.bme680.humidity),
                        pressure: parseFloat(data.bme680.pressure),
                        gasResistance: parseFloat(data.bme680.gas_resistance)
                    }
                ]);
            } catch (error) {
                console.error('Failed to parse SSE data:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

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
        <>
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto bg-white font-sans">
                <div className="bg-white overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-8/12 h-96 md:h-auto rounded-2xl overflow-hidden">
                            <MapContainer
                                center={position}
                                zoom={16}
                                style={{ height: '100%', width: '100%', minHeight: '500px' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={position}>
                                    <Popup>
                                        Current Location
                                    </Popup>
                                </Marker>

                                <Polyline
                                    positions={gpxTrack}
                                    pathOptions={{ color: '#10b981', weight: 5, opacity: 0.8 }}
                                />
                            </MapContainer>
                        </div>

                        <div className="w-full md:w-4/12 p-6 flex flex-col justify-between ml-3 border rounded-2xl border-gray-200 shadow-md">
                            <div>
                                <div className='flex items-center justify-between h-11 border-b border-gray-200 mb-6'>
                                    <div className="flex items-center mb-4">
                                        <MapPin className="mr-3" size={24} strokeWidth={2} />
                                        <h2 className="text-2xl font-semibold tracking-tight">Location</h2>
                                    </div>
                                    <p className="text-gray-600 mb-6 font-medium">
                                        {position[0].toFixed(6)}, {position[1].toFixed(6)}
                                    </p>
                                </div>

                                <div className="space-y-6 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-600">Satellites</span>
                                        <div className="flex items-center">
                                            <div className="flex items-end h-5 mr-3">
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 mx-0.5 rounded-t-sm ${i <= satellites
                                                            ? "bg-gray-800"
                                                            : "bg-gray-200"
                                                            }`}
                                                        style={{ height: `${i * 3}px` }}
                                                    ></div>
                                                ))}
                                            </div>
                                            <span className="text-xl font-semibold">{satellites}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-600">HDOP</span>
                                        <span className="text-xl font-semibold">{hdop}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-600">Speed</span>
                                        <div className="flex items-center">
                                            <Clock className="mr-2" size={16} strokeWidth={2} />
                                            <span className="text-xl font-semibold">{speed.toFixed(2)} km/h</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <AppleMinimalistSensorVisualizer data={mpu60} />
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 my-7">
                    {Object.keys(metrics).map(key => (
                        <div
                            key={key}
                            className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 transition-all hover:shadow-lg"
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

                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold tracking-tight">Telemetry Graphs</h2>
                        <div className="text-sm text-gray-500">Live data updates every 3 seconds</div>
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


            </div>
        </>
    );
}