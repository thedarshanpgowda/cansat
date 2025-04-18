'use client'

import React, { useState } from 'react'
import axios from 'axios'

function Page() {
    const [date, setDate] = useState('')
    const [sensor, setSensor] = useState('bme680')
    const [loading, setLoading] = useState(false)
    const [document, setDocument] = useState(null)
    const [error, setError] = useState(null)

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await axios.post("http://localhost:3000/archive", {
                date: date,
                sensor: sensor
            })
            console.log(response.data)
            setDocument(response.data)
            setError(null)
        } catch (err) {
            setError("Failed to retrieve document")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        const downloadUrl = document.downloadUrl || `http://localhost:3000/api/download/${document.id}`
        window.open(downloadUrl, '_blank')
    }

    const handleCancel = () => {
        setDocument(null)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Document Request</h1>

                <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-2">
                        Select Date
                    </label>
                    <input
                        type="date"
                        id="date"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="sensor" className="block text-sm font-medium text-gray-600 mb-2">
                        Select Sensor
                    </label>
                    <select
                        id="sensor"
                        value={sensor}
                        onChange={(e) => setSensor(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                    >
                        <option value="bme680">bme680</option>
                        <option value="mpu6050">mpu6050</option>
                        <option value="neom8n">neom8n</option>
                    </select>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !date || !sensor}
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Request Document"}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p>{error}</p>
                    </div>
                )}

                {document && (
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="ml-2 text-lg font-medium text-gray-800">Document Available</h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">{`Document for ${date} using sensor ${sensor} is ready for download.`}</p>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleDownload}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out"
                            >
                                Download
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Page
