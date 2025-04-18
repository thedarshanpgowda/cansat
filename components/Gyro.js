import { useState, useEffect, useRef } from 'react';

export default function AppleMinimalistSensorVisualizer({ data }) {
    const [sensorData, setSensorData] = useState({
        accelerometer: { x: 0, y: 0, z: 0 },
        gyroscope: { x: 0, y: 0, z: 0 }
    });

    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const animationRef = useRef(null);

    const accelCanvasRef = useRef(null);
    const gyroCanvasRef = useRef(null);

    // Update the sensor data when the data prop changes
    useEffect(() => {
        if (data) {
            setSensorData({
                accelerometer: {
                    x: parseFloat(data.accleremeter_x) || 0,
                    y: parseFloat(data.accleremeter_y) || 0,
                    z: parseFloat(data.accleremeter_z) || 0
                },
                gyroscope: {
                    x: parseFloat(data.gyroscope_x) || 0,
                    y: parseFloat(data.gyroscope_y) || 0,
                    z: parseFloat(data.gyroscope_z) || 0
                }
            });

            if (data.date_time) {
                setLastUpdated(new Date(data.date_time).getTime());
            }
        }
    }, [data]);

    useEffect(() => {
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

        const animate = () => {
            if (accelCanvasRef.current) {
                drawAccelerometer();
            }

            if (gyroCanvasRef.current) {
                drawGyroscope();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [sensorData]);

    useEffect(() => {
        const resizeCanvas = () => {
            const canvases = [accelCanvasRef, gyroCanvasRef];
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
    }, []);

    return (
        <div className="pb-15 text-gray-900">
            <div className="max-w-7xl mx-auto p-4">
                <header className="py-6">
                    <h1 className="text-3xl font-semibold text-gray-800">Orientation Data</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Accelerometer Card */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800">Accelerometer</h2>
                        </div>
                        <div className="relative aspect-video">
                            <canvas ref={accelCanvasRef} className="w-full h-full"></canvas>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4">
                            {['x', 'y', 'z'].map(axis => {
                                const value = sensorData.accelerometer[axis];
                                const unit = ' m/s²';

                                return (
                                    <div
                                        key={`accelerometer-${axis}`}
                                        className="bg-gray-50 rounded-xl p-3 border border-amber-100"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-900">Axis {axis.toUpperCase()}</div>
                                        </div>

                                        <div className="text-xl font-light mb-2 text-gray-800">
                                            {value}{unit}
                                        </div>

                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-300 rounded-full bg-blue-500"
                                                style={{
                                                    width: `${Math.min(100, Math.abs(value / 20 * 100))}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Gyroscope Card */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800">Gyroscope</h2>
                        </div>
                        <div className="relative aspect-video">
                            <canvas ref={gyroCanvasRef} className="w-full h-full"></canvas>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4">
                            {['x', 'y', 'z'].map(axis => {
                                const value = sensorData.gyroscope[axis];
                                const unit = '°';

                                return (
                                    <div
                                        key={`gyroscope-${axis}`}
                                        className="bg-gray-50 rounded-xl p-3"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-900">Axis {axis.toUpperCase()}</div>
                                        </div>

                                        <div className="text-xl font-light mb-2 text-gray-800">
                                            {value}{unit}
                                        </div>

                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-300 rounded-full bg-pink-500"
                                                style={{
                                                    width: `${Math.min(100, Math.abs(value / 180 * 100))}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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