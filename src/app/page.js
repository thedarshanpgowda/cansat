'use client'

import Image from "next/image";
import LocationTrackingDashboard from "../../components/Dashboard";
import EnvironmentalDashboard from "../../components/Graph";
import Title from "../../components/Landing1";
import dynamic from 'next/dynamic';
import AppleMinimalistSensorVisualizer from "../../components/Gyro";

const Dashboard = dynamic(() => import('../../components/Dashboard'), {
  ssr: false,
});
export default function Home() {
  return (
    <div>
      <Title />
      <EnvironmentalDashboard />
      <Dashboard />
      {/* <AppleMinimalistSensorVisualizer /> */}
    </div>
  );
}
