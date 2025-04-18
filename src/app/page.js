'use client'

import Title from "../../components/Landing1";
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('../../components/Dashboard'), {
  ssr: false,
});
export default function Home() {
  return (
    <div>
      <Title />
      <Dashboard />
      {/* <EnvironmentalDashboard /> */}
      {/* <AppleMinimalistSensorVisualizer /> */}
    </div>
  );
}
