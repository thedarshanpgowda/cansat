'use client'

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { format, addDays } from 'date-fns';
import { Search, RefreshCw, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const [weekData, setWeekData] = useState([]);
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [view, setView] = useState('week');
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('San Francisco');
    const [tempUnit, setTempUnit] = useState('C');
    const [showDashboard, setShowDashboard] = useState(true); 

    useEffect(() => {
        if (selectedDate && showDashboard) {
            const weekForecast = [];

            for (let i = 0; i < 7; i++) {
                const day = addDays(selectedDate, i);
                const temperature = Math.floor(Math.random() * 20) + (i === 0 ? 10 : 3); 
                const lowTemp = temperature - Math.floor(Math.random() * 5) - 3;

                weekForecast.push({
                    date: day,
                    day: format(day, 'EEE'),
                    highTemp: temperature,
                    lowTemp: lowTemp,
                    weather: i === 4 ? 'Snow' : i === 0 || i === 1 ? 'Rain' : i % 2 === 0 ? 'Sunny' : 'Cloudy',
                    humidity: Math.floor(Math.random() * 40) + 10,
                    pressure: Math.floor(Math.random() * 20) + 1000,
                    airQuality: Math.floor(Math.random() * 150) + 50,
                    rainChance: i === 0 || i === 1 ? 30 : 0,
                    uvIndex: Math.floor(Math.random() * 10) + 1,
                    windSpeed: (Math.random() * 15).toFixed(2),
                    windDirection: 'WSW',
                    visibility: (Math.random() * 10).toFixed(1),
                    sunrise: '6:35 AM',
                    sunset: '5:42 PM',
                });
            }

            setWeekData(weekForecast);
            setSelectedDayData(weekForecast[0]);
        }
    }, [selectedDate, showDashboard]);

    const selectDay = (index) => {
        setSelectedDayData(weekData[index]);
    };

    const getWeatherIcon = (weather, size = 'large') => {
        switch (weather) {
            case 'Rain':
                return (
                    <div className={`flex items-center ${size === 'large' ? '' : 'justify-center'}`}>
                        <div className={`text-yellow-400 ${size === 'large' ? 'text-6xl' : 'text-2xl'} relative`}>
                            ☀
                        </div>
                        <div className={`text-blue-500 absolute ${size === 'large' ? 'ml-10' : 'ml-3'}`}>
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`bg-blue-600 ${size === 'large' ? 'w-2.5 h-10 mb-1 ml-1' : 'w-1 h-5 mb-0.5 ml-0.5'} rounded-full inline-block`}
                                />
                            ))}
                        </div>
                    </div>
                );
            case 'Snow':
                return (
                    <div className={`${size === 'large' ? 'text-6xl' : 'text-2xl'} text-blue-300 flex justify-center items-center`}>
                        ❄
                    </div>
                );
            case 'Cloudy':
                return (
                    <div className={`${size === 'large' ? 'text-6xl' : 'text-2xl'} text-gray-400 flex justify-center items-center`}>
                        ☁
                    </div>
                );
            case 'Sunny':
                return (
                    <div className={`${size === 'large' ? 'text-6xl' : 'text-2xl'} text-yellow-400 flex justify-center items-center`}>
                        ☀
                    </div>
                );
            default:
                return (
                    <div className={`${size === 'large' ? 'text-6xl' : 'text-2xl'} text-gray-400 flex justify-center items-center`}>
                        ☁
                    </div>
                );
        }
    };

    const getAirQualityStatus = (value) => {
        if (value < 50) return { text: 'Good', emoji: '👍' };
        if (value < 100) return { text: 'Normal', emoji: '👌' };
        return { text: 'Unhealthy', emoji: '👎' };
    };

    const getVisibilityStatus = (value) => {
        if (value > 8) return { text: 'Good', emoji: '😄' };
        if (value > 4) return { text: 'Average', emoji: '😐' };
        return { text: 'Poor', emoji: '😞' };
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <Head>
                <title>Weather Dashboard</title>
            </Head>

            <div className="bg-white w-full max-w-7xl rounded-3xl p-8 shadow-lg">
                <div className="flex flex-col md:flex-row">

                    <div className="w-full md:w-[30%] pr-0 md:pr-8 border-r-0 md:border-r border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-light text-gray-800">{"Forecasted Data"}</h2>
                            <div className="flex space-x-2">
                                <button className="bg-gray-100 p-2 rounded-full text-gray-600" onClick={() => setSelectedDate(new Date())}>
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-center">
                            {selectedDayData && getWeatherIcon(selectedDayData.weather, 'large')}
                        </div>

                        <div className="text-center mt-8">
                            <h1 className="text-8xl font-light text-gray-800">{selectedDayData?.highTemp}°{tempUnit}</h1>
                            <p className="mt-4 text-lg text-gray-600">
                                {format(selectedDayData?.date || new Date(), 'EEEE')}, {format(selectedDayData?.date || new Date(), 'HH:mm')}
                            </p>
                            <div className="flex items-center justify-center mt-4 text-gray-600">
                                <div className="flex items-center mr-4">
                                    <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
                                    <span>{selectedDayData?.weather}</span>
                                </div>
                            </div>
                            {selectedDayData?.rainChance > 0 && (
                                <div className="flex items-center justify-center mt-2 text-gray-600">
                                    <div className="mr-2 text-blue-600">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-1 h-4 mb-0.5 bg-blue-600 rounded-full inline-block mx-0.5" />
                                        ))}
                                    </div>
                                    <span>Rain - {selectedDayData.rainChance}%</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-12">
                            <div className="relative h-40 rounded-xl overflow-hidden bg-gray-200">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-gray-800 text-xl font-light">{location}</p>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="w-full md:w-[69%] pl-0 md:pl-8 mt-8 md:mt-0">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-medium text-gray-800">7-Day Forecast</h2>
                            <div className="flex space-x-2">
                                <button className="bg-gray-100 px-3 py-1 rounded-full text-gray-800 text-sm">
                                    °{tempUnit}
                                </button>
                            </div>
                        </div>


                        <div className="grid grid-cols-7 gap-4 mt-6">
                            {weekData.map((day, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl flex flex-col items-center cursor-pointer ${index === weekData.indexOf(selectedDayData)
                                        ? 'bg-gray-100'
                                        : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => selectDay(index)}
                                >
                                    <p className="font-medium text-gray-800">{day.day}</p>
                                    <div className="my-3">
                                        {getWeatherIcon(day.weather, 'small')}
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <span className="font-medium text-gray-800">{day.highTemp}°</span>
                                        <span className="text-gray-400 ml-1">{day.lowTemp}°</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-xl font-medium text-gray-800 mt-10 mb-4">Today&apos;s Highlights</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Pressure</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">{selectedDayData?.windSpeed}</h3>
                                    <p className="ml-1 mb-1 text-gray-500">km/h</p>
                                </div>
                                <div className="flex items-center mt-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <p className="text-gray-700">{selectedDayData?.windDirection}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Humidity</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">{selectedDayData?.humidity}</h3>
                                    <p className="ml-1 mb-1 text-gray-500">%</p>
                                </div>
                                <div className="flex items-center mt-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <p className="text-gray-700">Normal 👌</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Temperature</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">{selectedDayData?.visibility}</h3>
                                    <p className="ml-1 mb-1 text-gray-500">km</p>
                                </div>
                                <div className="flex items-center mt-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <p className="text-gray-700">{getVisibilityStatus(selectedDayData?.visibility).text} {getVisibilityStatus(selectedDayData?.visibility).emoji}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-gray-500 mb-4">Air Quality</p>
                                <div className="flex items-end">
                                    <h3 className="text-4xl font-medium text-gray-800">{selectedDayData?.airQuality}</h3>
                                </div>
                                <div className="flex items-center mt-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <p className="text-gray-700">{getAirQualityStatus(selectedDayData?.airQuality).text} {getAirQualityStatus(selectedDayData?.airQuality).emoji}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}