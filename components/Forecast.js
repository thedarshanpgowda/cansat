'use client'

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { format, parseISO } from 'date-fns';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import axios from 'axios';

export default function Home() {
    const [forecastData, setForecastData] = useState([]);
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [tempUnit, setTempUnit] = useState('C');
    const [location, setLocation] = useState('Hassan');

    useEffect(() => {
        async function fetchWeatherData() {
            try {
                const response = await axios.get('http://localhost:5000/forecast');
                const data = response.data.map((item) => ({
                    ...item,
                    date: parseISO(item.date),
                }));
                setForecastData(data);
                setSelectedDayData(data[0]); // Default to the first day
            } catch (error) {
                console.error('Error fetching forecast data:', error);
            }
        }
        fetchWeatherData();
    }, []);

    const selectDay = (index) => {
        setSelectedDayData(forecastData[index]);
    };

    const getWeatherIcon = (temperature) => {
        if (temperature > 35) return '☀'; // Sunny
        if (temperature > 20) return '☁'; // Cloudy
        return '🌧'; // Rainy
    };

    const getAccuracyIcon = (accuracy) => {
        if (accuracy < 50) return <XCircle className="text-red-500 ml-2" size={16} />; // Low accuracy
        if (accuracy < 60) return <AlertTriangle className="text-yellow-500 ml-2" size={16} />; // Moderate accuracy
        return <CheckCircle className="text-green-500 ml-2" size={16} />; // High accuracy
    };

    const getAirQualityStatus = (pressure) => {
        if (pressure > 1000) return { text: 'Excellent', emoji: '🌟' };
        if (pressure > 800) return { text: 'Good', emoji: '👍' };
        if (pressure > 600) return { text: 'Moderate', emoji: '👌' };
        return { text: 'Poor', emoji: '👎' };
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <Head>
                <title>Weather Dashboard</title>
            </Head>

            <div className="bg-white w-full max-w-7xl rounded-3xl p-8 shadow-lg">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-[30%] pr-0 md:pr-8 border-r-0 md:border-r border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-light text-gray-800">Forecasted Data</h2>
                            <button
                                className="bg-gray-100 p-2 rounded-full text-gray-600"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        <div className="mt-10 flex justify-center">
                            {selectedDayData && (
                                <div className="text-6xl">
                                    {getWeatherIcon(selectedDayData.Temperature.forecast)}
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-8">
                            <h1 className="text-8xl font-light text-gray-800">
                                {selectedDayData?.Temperature.forecast.toFixed(1)}°{tempUnit}
                            </h1>
                            <p className="mt-4 text-lg text-gray-600">
                                {selectedDayData
                                    ? format(selectedDayData.date, 'EEEE, MMM d')
                                    : ''}
                            </p>
                        </div>

                        <div className="mt-12">
                            <div className="relative h-40 rounded-xl overflow-hidden bg-gray-200">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-gray-800 text-xl font-light">{location}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-[69%] pl-0 md:pl-8 mt-8 md:mt-0">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-medium text-gray-800">Forecast</h2>
                            <button className="bg-gray-100 px-3 py-1 rounded-full text-gray-800 text-sm">
                                °{tempUnit}
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-4 mt-6">
                            {forecastData.map((day, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl flex flex-col items-center cursor-pointer ${selectedDayData === day
                                            ? 'bg-gray-100'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => selectDay(index)}
                                >
                                    <p className="font-medium text-gray-800">
                                        {format(day.date, 'EEE')}
                                    </p>
                                    <div className="my-3 text-2xl">
                                        {getWeatherIcon(day.Temperature.forecast)}
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <span className="font-medium text-gray-800">
                                            {day.Temperature.forecast.toFixed(1)}°
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-xl font-medium text-gray-800 mt-10 mb-4">
                            Today&apos;s Highlights
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Pressure</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">
                                        {selectedDayData?.Pressure.forecast.toFixed(1)}
                                    </h3>
                                    <p className="ml-1 mb-1 text-gray-500">hPa</p>
                                    {getAccuracyIcon(selectedDayData?.Pressure.accuracy)}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Humidity</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">
                                        {selectedDayData?.Humidity.forecast.toFixed(1)}
                                    </h3>
                                    <p className="ml-1 mb-1 text-gray-500">%</p>
                                    {getAccuracyIcon(selectedDayData?.Humidity.accuracy)}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Gas Resistance</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">
                                        {selectedDayData?.['Gas Resistance'].forecast.toFixed(1)}
                                    </h3>
                                    <p className="ml-1 mb-1 text-gray-500">kΩ</p>
                                    {getAccuracyIcon(selectedDayData?.['Gas Resistance'].accuracy)}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Air Quality</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">
                                        {selectedDayData?.Pressure.forecast.toFixed(1)}
                                    </h3>
                                    <p className="ml-1 mb-1 text-gray-500">
                                        {getAirQualityStatus(selectedDayData?.Pressure.forecast).text}{' '}
                                        {getAirQualityStatus(selectedDayData?.Pressure.forecast).emoji}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}