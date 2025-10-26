
import React from 'react';
import { View } from '../types';
import { CalendarIcon, RoomServiceIcon } from '../components/icons';

interface HomeViewProps {
  setCurrentView: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ setCurrentView }) => {
  return (
    <div className="text-center p-8 max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold mb-4 text-white">Hospitality AI Simulator</h1>
      <p className="text-xl text-gray-300 mb-12">Hone your skills in realistic customer interaction scenarios.</p>
      <div className="flex flex-col md:flex-row gap-8 justify-center">
        <button
          onClick={() => setCurrentView(View.Reservations)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center text-xl"
        >
          <CalendarIcon className="w-8 h-8 mr-4" />
          Reservation Simulator
        </button>
        <button
          onClick={() => setCurrentView(View.RoomService)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center text-xl"
        >
          <RoomServiceIcon className="w-8 h-8 mr-4" />
          Room Service Simulator
        </button>
      </div>
    </div>
  );
};

export default HomeView;
