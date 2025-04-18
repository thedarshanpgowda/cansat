'use client'
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import {
    MapPin,
    Satellite,
    Clock
} from 'lucide-react';


delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LocationTrackingDashboard() {

    const [position, setPosition] = useState([12.9441, 77.6983]);
    const [gpxTrack, setGpxTrack] = useState([]);


    const [satellites, setSatellites] = useState(7);
    const [hdop, setHdop] = useState(1.4);
    const [speed, setSpeed] = useState(4.2);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/telemetry');
                // -----------------------------------------------------------------
                const data = await res.json();
                setPosition([12.9441, 77.6983]);
                setSatellites(data.satellites);
                setHdop(data.hdop);
                setSpeed(data.speed);

                setVerticalSpeed(data.verticalSpeed);
            } catch (error) {
                console.error('Failed to fetch telemetry:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto bg-white font-sans">
            <div className="bg-white overflow-hidden ">
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

                    <div className="w-full md:w-4/12 p-6 flex flex-col justify-between ml-3  border rounded-2xl border-gray-200 shadow-md ">
                        <div>
                            <div className="flex items-center mb-4">
                                <MapPin className="mr-3" size={24} strokeWidth={2} />
                                <h2 className="text-2xl font-semibold tracking-tight">Location</h2>
                            </div>
                            <p className="text-gray-600 mb-6 font-medium">
                                {position[0].toFixed(6)}, {position[1].toFixed(6)}
                            </p>

                            <div className="space-y-6 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-600">Satellites</span>
                                    <div className="flex items-center">
                                        <div className="flex items-end h-5 mr-3">
                                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
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
                                        <span className="text-xl font-semibold">{speed} km/h</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                            <div className="flex items-center mb-4">
                                <Satellite className="mr-3" size={24} strokeWidth={2} />
                                <h2 className="text-2xl font-semibold tracking-tight">Satellite Information</h2>
                            </div>
                            <div className='flex justify-between items-center'>
                                {[1, 2, 3].map(i => {
                                    return (
                                        <div key={Math.random()} className='py-4 px-8 border rounded-2xl border-gray-200 shadow-md '>Sat {i} </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}