'use client'
import React, { useState } from 'react';

export default function Title() {

    return (
        <div className="w-full pt-8 pb-4">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                    CanSat-A
                </h1>
                <p className="mt-1 text-lg text-gray-500 font-light">
                    Mission Control Dashboard
                </p>

                <div className="mt-8 border-b border-gray-200">
                    <div className="flex space-x-8">
                        <button

                            className={`pb-4 px-1 font-medium text-sm 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Real-time Telemetry
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}