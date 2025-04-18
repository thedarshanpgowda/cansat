import { useState, useEffect, useRef } from 'react';

export default function AppleMinimalistSensorVisualizer() {
    const [sensorData, setSensorData] = useState({
        accelerometer: { x: 0, y: 0, z: 0 },
        gyroscope: { x: 0, y: 0, z: 0 },
        magnetometer: { x: 0, y: 0, z: 0 }
    });

    const [activeTab, setActiveTab] = useState('accelerometer');
    const [permission, setPermission] = useState('pending');
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const animationRef = useRef(null);

    const accelCanvasRef = useRef(null);
    const gyroCanvasRef = useRef(null);
    const magCanvasRef = useRef(null);

    useEffect(() => {
        if (!window.DeviceMotionEvent || !window.DeviceOrientationEvent) {
            setPermission('unsupported');
            return;
        }

        const requestSensorPermission = async () => {
            try {
                if (typeof DeviceMotionEvent.requestPermission === 'function') {
                    const permissionState = await DeviceMotionEvent.requestPermission();
                    setPermission(permissionState);
                } else {
                    setPermission('granted');
                }
            } catch (error) {
                setPermission('denied');
                console.error('Error requesting sensor permission:', error);
            }
        };

        const handleMotion = (event) => {
            const currentTime = Date.now();
            if (currentTime - lastUpdated >= 3000) {
                const accel = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

                setSensorData(prev => ({
                    ...prev,
                    accelerometer: {
                        x: accel.x ? parseFloat(accel.x.toFixed(2)) : 0,
                        y: accel.y ? parseFloat(accel.y.toFixed(2)) : 0,
                        z: accel.z ? parseFloat(accel.z.toFixed(2)) : 0
                    }
                }));
                setLastUpdated(currentTime);
            }
        };

        const handleOrientation = (event) => {
            const currentTime = Date.now();
            if (currentTime - lastUpdated >= 3000) {
                setSensorData(prev => ({
                    ...prev,
                    gyroscope: {
                        x: event.alpha ? parseFloat(event.alpha.toFixed(2)) : 0,
                        y: event.beta ? parseFloat(event.beta.toFixed(2)) : 0,
                        z: event.gamma ? parseFloat(event.gamma.toFixed(2)) : 0
                    }
                }));
            }
        };

        const simulateMagnetometer = () => {
            const interval = setInterval(() => {
                setSensorData(prev => ({
                    ...prev,
                    magnetometer: {
                        x: parseFloat((Math.sin(Date.now() / 5000) * 50).toFixed(2)),
                        y: parseFloat((Math.cos(Date.now() / 7000) * 50).toFixed(2)),
                        z: parseFloat((Math.sin(Date.now() / 9000) * 50).toFixed(2))
                    }
                }));
            }, 3000);

            return () => clearInterval(interval);
        };

        if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            window.addEventListener('deviceorientation', handleOrientation);
            const cleanupMagnetometer = simulateMagnetometer();

            return () => {
                window.removeEventListener('devicemotion', handleMotion);
                window.removeEventListener('deviceorientation', handleOrientation);
                cleanupMagnetometer();
            };
        }

        if (permission === 'pending') {
            requestSensorPermission();
        }
    }, [permission, lastUpdated]);

    useEffect(() => {
        if (permission !== 'granted') return;

        const drawAccelerometer = () => {
            const canvas = accelCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            ctx.fillStyle = 'rgba(250, 250, 250, 0.9)';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            ctx.strokeStyle = 'rgba(210, 210, 210, 0.8)';
            ctx.lineWidth = 1;

            for (let x = 0; x <= width; x += width / 10) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            for (let y = 0; y <= height; y += height / 10) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            ctx.strokeStyle = 'rgba(180, 180, 180, 0.9)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, height);
            ctx.stroke();

            const scale = 20;
            const posX = centerX + (sensorData.accelerometer.x * scale);
            const posY = centerY - (sensorData.accelerometer.y * scale);
            const radius = 20 + Math.abs(sensorData.accelerometer.z * 0.8);

            const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, radius);
            gradient.addColorStop(0, 'rgba(0, 122, 255, 1)');
            gradient.addColorStop(0.6, 'rgba(10, 132, 255, 0.7)');
            gradient.addColorStop(1, 'rgba(50, 173, 230, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(posX, posY, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.fillStyle = 'rgba(0, 122, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(posX, posY, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
            ctx.font = '14px SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`X: ${sensorData.accelerometer.x}`, 15, 15);
            ctx.fillText(`Y: ${sensorData.accelerometer.y}`, 15, 35);
            ctx.fillText(`Z: ${sensorData.accelerometer.z}`, 15, 55);
        };

        const drawGyroscope = () => {
            const canvas = gyroCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            
            ctx.fillStyle = 'rgba(250, 250, 250, 0.9)';
            ctx.fillRect(0, 0, width, height);

            
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.7;

            
            ctx.save();
            ctx.translate(centerX, centerY);

            
            const degToRad = Math.PI / 180;
            ctx.rotate(sensorData.gyroscope.z * degToRad);

            
            ctx.strokeStyle = 'rgba(220, 220, 220, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.stroke();

            
            for (let i = 0; i < 360; i += 30) {
                const angle = i * degToRad;
                const innerRadius = size / 2 - 15;
                const outerRadius = size / 2 - 5;

                ctx.strokeStyle = i % 90 === 0 ? 'rgba(100, 100, 100, 0.9)' : 'rgba(180, 180, 180, 0.6)';
                ctx.lineWidth = i % 90 === 0 ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle));
                ctx.lineTo(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle));
                ctx.stroke();
            }

            
            ctx.fillStyle = 'rgba(80, 80, 80, 0.9)';
            ctx.font = '16px SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const directions = ['N', 'E', 'S', 'W'];
            const directionAngles = [270, 0, 90, 180]; 

            directions.forEach((dir, i) => {
                const angle = directionAngles[i] * degToRad;
                const textRadius = size / 2 - 30;
                ctx.fillText(dir, textRadius * Math.cos(angle), textRadius * Math.sin(angle));
            });

            
            const betaRadians = sensorData.gyroscope.y * degToRad;
            const gammaRadians = sensorData.gyroscope.x * degToRad;

            
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 4);
            gradient.addColorStop(0, 'rgba(255, 45, 85, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 45, 85, 0.3)');

            ctx.fillStyle = gradient;

            
            ctx.beginPath();
            ctx.ellipse(
                Math.sin(gammaRadians) * 10,
                Math.sin(betaRadians) * 10,
                size / 4 * Math.abs(Math.cos(betaRadians) * Math.cos(gammaRadians) * 0.8 + 0.2),
                size / 4 * Math.abs(Math.cos(betaRadians) * Math.cos(gammaRadians) * 0.8 + 0.2),
                0, 0, Math.PI * 2
            );
            ctx.fill();

            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 3;

            
            ctx.beginPath();
            ctx.moveTo(-size / 10, 0);
            ctx.lineTo(size / 10, 0);
            ctx.stroke();

            
            ctx.beginPath();
            ctx.moveTo(0, -size / 10);
            ctx.lineTo(0, size / 10);
            ctx.stroke();

            ctx.restore();

            
            ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
            ctx.font = '14px SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`α: ${sensorData.gyroscope.x}°`, 15, 15);
            ctx.fillText(`β: ${sensorData.gyroscope.y}°`, 15, 35);
            ctx.fillText(`γ: ${sensorData.gyroscope.z}°`, 15, 55);
        };

        const drawMagnetometer = () => {
            const canvas = magCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            
            ctx.fillStyle = 'rgba(250, 250, 250, 0.9)';
            ctx.fillRect(0, 0, width, height);

            
            const centerX = width / 2;
            const centerY = height / 2;
            const size = Math.min(width, height) * 0.7;

            
            const { x, y, z } = sensorData.magnetometer;
            const fieldStrength = Math.sqrt(x * x + y * y + z * z);
            const normalizedStrength = Math.min(1, fieldStrength / 100);

            
            const angle = Math.atan2(y, x);

            
            ctx.fillStyle = 'rgba(240, 240, 240, 0.8)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(220, 220, 220, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();

            
            const numRings = 3;
            for (let i = 1; i <= numRings; i++) {
                const radius = (size / 2) * (i / numRings);

                ctx.strokeStyle = `rgba(200, 200, 200, ${0.6 - (i / numRings) * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            
            const directions = ['N', 'E', 'S', 'W'];
            const directionAngles = [270, 0, 90, 180]; 

            ctx.fillStyle = 'rgba(80, 80, 80, 0.9)';
            ctx.font = '16px SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            directionAngles.forEach((angle, i) => {
                const radian = angle * (Math.PI / 180);
                const textRadius = size / 2 - 20;
                ctx.fillText(directions[i],
                    centerX + textRadius * Math.cos(radian),
                    centerY + textRadius * Math.sin(radian));
            });

            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);

            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            
            ctx.fillStyle = 'rgba(255, 59, 48, 0.9)';
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(0, -size / 3);
            ctx.lineTo(8, 0);
            ctx.closePath();
            ctx.fill();

            
            ctx.fillStyle = 'rgba(0, 122, 255, 0.9)';
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(0, size / 3);
            ctx.lineTo(8, 0);
            ctx.closePath();
            ctx.fill();

            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();

            
            const barWidth = width * 0.6;
            const barHeight = 6;
            const barX = (width - barWidth) / 2;
            const barY = height - 40;

            
            ctx.fillStyle = 'rgba(220, 220, 220, 0.8)';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth, barHeight, 3);
            ctx.fill();

            
            ctx.fillStyle = 'rgba(88, 86, 214, 0.8)';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth * normalizedStrength, barHeight, 3);
            ctx.fill();

            
            ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
            ctx.font = '12px SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Field Strength: ${fieldStrength.toFixed(2)} μT`, centerX, barY + 20);

            
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`X: ${x.toFixed(2)} μT`, 15, 15);
            ctx.fillText(`Y: ${y.toFixed(2)} μT`, 15, 35);
            ctx.fillText(`Z: ${z.toFixed(2)} μT`, 15, 55);
        };

        
        const animate = () => {
            if (accelCanvasRef.current && activeTab === 'accelerometer') {
                drawAccelerometer();
            }

            if (gyroCanvasRef.current && activeTab === 'gyroscope') {
                drawGyroscope();
            }

            if (magCanvasRef.current && activeTab === 'magnetometer') {
                drawMagnetometer();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [permission, sensorData, activeTab]);

    
    useEffect(() => {
        const resizeCanvas = () => {
            const canvases = [accelCanvasRef, gyroCanvasRef, magCanvasRef];
            canvases.forEach(canvasRef => {
                if (canvasRef.current) {
                    const canvas = canvasRef.current;
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;
                }
            });
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [permission]);

    if (permission === 'pending') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-semibold mb-6">Sensor Access</h1>
                    <p className="mb-8 text-gray-500">This visualization requires access to your devices motion and orientation sensors.</p>
                    <button
                        onClick={() => setPermission('granted')}
                        className="bg-blue-500 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:bg-blue-600"
                    >
                        Enable Sensors
                    </button>
                </div>
            </div>
        );
    }

    if (permission === 'denied' || permission === 'unsupported') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-semibold mb-6">
                        {permission === 'denied' ? 'Sensor Access Denied' : 'Sensors Not Supported'}
                    </h1>
                    <p className="mb-6 text-gray-500">
                        {permission === 'denied'
                            ? 'Please allow access to device motion and orientation sensors in your browser settings.'
                            : 'Your device does not support the required motion and orientation sensors.'}
                    </p>
                    {permission === 'denied' && (
                        <button
                            onClick={() => setPermission('granted')}
                            className="bg-blue-500 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="max-w-4xl mx-auto p-4">
                <header className="py-6">
                    <h1 className="text-3xl font-semibold text-center text-gray-800">Sensor Data</h1>
                </header>

                <div className="flex justify-center mb-6">
                    <div className="bg-gray-200 rounded-lg p-1">
                        {['accelerometer', 'gyroscope', 'magnetometer'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${activeTab === tab
                                    ? 'bg-white text-blue-500 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative aspect-video bg-white rounded-2xl overflow-hidden shadow-md mb-8">
                    <div className={`absolute inset-0 ${activeTab === 'accelerometer' ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-500`}>
                        <canvas ref={accelCanvasRef} className="w-full h-full"></canvas>
                    </div>

                    <div className={`absolute inset-0 ${activeTab === 'gyroscope' ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-500`}>
                        <canvas ref={gyroCanvasRef} className="w-full h-full"></canvas>
                    </div>

                    <div className={`absolute inset-0 ${activeTab === 'magnetometer' ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-500`}>
                        <canvas ref={magCanvasRef} className="w-full h-full"></canvas>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-2 text-sm flex items-center shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        <span className="text-gray-500">Updates every 3s</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {['x', 'y', 'z'].map(axis => {
                        const value = sensorData[activeTab][axis];
                        const unit = activeTab === 'gyroscope' ? '°' : activeTab === 'magnetometer' ? ' μT' : ' m/s²';

                        return (
                            <div
                                key={`${activeTab}-${axis}`}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-gray-900">Axis {axis.toUpperCase()}</div>
                                    <div className="text-xs text-gray-400 uppercase">{activeTab}</div>
                                </div>

                                <div className="text-2xl font-light mb-2 text-gray-800">
                                    {value}{unit}
                                </div>

                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 rounded-full ${activeTab === 'accelerometer' ? 'bg-blue-500' :
                                            activeTab === 'gyroscope' ? 'bg-pink-500' : 'bg-purple-500'
                                            }`}
                                        style={{
                                            width: `${Math.min(100, Math.abs(value / (
                                                activeTab === 'gyroscope' ? 180 :
                                                    activeTab === 'magnetometer' ? 100 : 20
                                            ) * 100))}%`
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">Move your device to update sensor readings every 3 seconds</p>
                    <p className="mt-2 text-xs text-gray-400">Device orientation and position are shown in real-time</p>
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                        <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}