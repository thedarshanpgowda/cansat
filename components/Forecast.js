'use client'

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { format, parseISO } from 'date-fns';
import { RefreshCw, Droplets, Wind, Activity, Thermometer } from 'lucide-react';
import axios from 'axios';

export default function Home() {
    const [forecastData, setForecastData] = useState([]);
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [tempUnit, setTempUnit] = useState('C');
    const [location, setLocation] = useState('Hassan');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchWeatherData() {
            setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        }
        fetchWeatherData();
    }, []);

    const selectDay = (index) => {
        setSelectedDayData(forecastData[index]);
    };

    const toggleTempUnit = () => {
        setTempUnit(tempUnit === 'C' ? 'F' : 'C');
    };

    const getWeatherIcon = (temperature) => {
        if (temperature > 35) return '☀️'; // Hot/Sunny
        if (temperature > 25) return '🌤️'; // Warm/Partly Cloudy
        if (temperature > 15) return '☁️'; // Mild/Cloudy
        if (temperature > 5) return '🌦️'; // Cool/Light Rain
        return '🌧️'; // Cold/Rainy
    };

    const getAirQualityStatus = (value) => {
        if (value > 100) return { text: 'Poor', color: 'text-red-500', emoji: '😷' };
        if (value > 50) return { text: 'Moderate', color: 'text-yellow-500', emoji: '😐' };
        return { text: 'Good', color: 'text-green-500', emoji: '😊' };
    };

    const convertTemp = (temp) => {
        if (tempUnit === 'F') {
            return (temp * 9 / 5) + 32;
        }
        return temp;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center p-4">
            <Head>
                <title>Weather Dashboard</title>
            </Head>

            <div className="bg-white/90 backdrop-blur-sm w-full max-w-6xl rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 pr-0 md:pr-8 border-r-0 md:border-r border-gray-100">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-medium text-gray-700">Weather Forecast</h2>
                            <div className="flex space-x-2">
                                <button
                                    className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full text-gray-500 transition-all duration-300"
                                    onClick={() => window.location.reload()}
                                    aria-label="Refresh data"
                                >
                                    <RefreshCw size={16} />
                                </button>
                                <button
                                    onClick={toggleTempUnit}
                                    className="bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-full text-gray-500 text-sm transition-all duration-300"
                                >
                                    °{tempUnit}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            {selectedDayData && (
                                <div className="text-6xl md:text-7xl">
                                    {getWeatherIcon(selectedDayData.Temperature.forecast)}
                                </div>
                            )}
                        </div>

                        <div className="text-center mt-6">
                            <h1 className="text-6xl md:text-7xl font-light text-gray-800">
                                {convertTemp(selectedDayData?.Temperature.forecast).toFixed(1)}°{tempUnit}
                            </h1>
                            <p className="mt-3 text-lg text-gray-500">
                                {selectedDayData
                                    ? format(selectedDayData.date, 'EEEE, MMM d')
                                    : ''}
                            </p>
                        </div>

                        <div className="mt-20">
                            <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-100 to-blue-100">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-indigo-800 text-xl font-medium">{location}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-2/3 pl-0 md:pl-8 mt-8 md:mt-0">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">7-Day Forecast</h2>

                        <div className="grid grid-cols-7 gap-2">
                            {forecastData.map((day, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-xl flex flex-col items-center cursor-pointer transition-all duration-300 ${selectedDayData === day
                                            ? 'bg-blue-50 shadow-sm'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => selectDay(index)}
                                >
                                    <p className="font-medium text-sm text-gray-600">
                                        {format(day.date, 'EEE')}
                                    </p>
                                    <div className="my-2 text-2xl">
                                        {getWeatherIcon(day.Temperature.forecast)}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">
                                        {convertTemp(day.Temperature.forecast).toFixed(0)}°
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-lg font-medium text-gray-700 mt-10 mb-4">
                            Today's Highlights
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <Thermometer size={18} className="text-blue-500 mr-2" />
                                    <p className="text-gray-500 text-sm">Temperature</p>
                                </div>
                                <div className="flex items-baseline">
                                    <h3 className="text-3xl font-medium text-gray-800">
                                        {convertTemp(selectedDayData?.Temperature.forecast).toFixed(1)}
                                    </h3>
                                    <p className="ml-1 text-gray-500">°{tempUnit}</p>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    Accuracy: {selectedDayData?.Temperature.accuracy}%
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <Droplets size={18} className="text-blue-500 mr-2" />
                                    <p className="text-gray-500 text-sm">Humidity</p>
                                </div>
                                <div className="flex items-baseline">
                                    <h3 className="text-3xl font-medium text-gray-800">
                                        {selectedDayData?.Humidity.forecast.toFixed(0)}
                                    </h3>
                                    <p className="ml-1 text-gray-500">%</p>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    Accuracy: {selectedDayData?.Humidity.accuracy}%
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <Wind size={18} className="text-blue-500 mr-2" />
                                    <p className="text-gray-500 text-sm">Pressure</p>
                                </div>
                                <div className="flex items-baseline">
                                    <h3 className="text-3xl font-medium text-gray-800">
                                        {selectedDayData?.Pressure.forecast.toFixed(0)}
                                    </h3>
                                    <p className="ml-1 text-gray-500">hPa</p>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    Accuracy: {selectedDayData?.Pressure.accuracy}%
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center mb-4">
                                    <Activity size={18} className="text-blue-500 mr-2" />
                                    <p className="text-gray-500 text-sm">Air Quality</p>
                                </div>
                                <div className="flex items-baseline">
                                    <h3 className="text-3xl font-medium text-gray-800">
                                        {selectedDayData?.['Gas Resistance'].forecast.toFixed(0)}
                                    </h3>
                                    <p className="ml-1 text-gray-500">kΩ</p>
                                </div>
                                <div className="mt-2 flex items-center">
                                    <span className={`text-sm ${getAirQualityStatus(selectedDayData?.['Gas Resistance'].forecast).color}`}>
                                        {getAirQualityStatus(selectedDayData?.['Gas Resistance'].forecast).text}
                                    </span>
                                    <span className="ml-1">
                                        {getAirQualityStatus(selectedDayData?.['Gas Resistance'].forecast).emoji}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}