'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Title() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Real Time Dashboard', path: '/' },
        { name: 'Forecast', path: '/forecast' },
        { name: 'Get Data', path: '/get-data' }
    ];

    return (
        <div className="w-full pt-8 pb-4">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                    CanSat-A
                </h1>
                <p className="mt-1 text-lg text-gray-500 font-light">
                    Mission Control Dashboard
                </p>
                <div className="mt-6 border-b border-gray-200"></div>

                <div className="flex mt-4 space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`pb-2 px-1 text-sm font-medium transition-colors duration-200 ${pathname === item.path
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}