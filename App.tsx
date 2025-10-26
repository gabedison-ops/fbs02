
import React, { useState } from 'react';
import HomeView from './views/HomeView';
import ReservationView from './views/ReservationView';
import RoomServiceView from './views/RoomServiceView';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);

  const renderView = () => {
    switch (currentView) {
      case View.Reservations:
        return <ReservationView goHome={() => setCurrentView(View.Home)} />;
      case View.RoomService:
        return <RoomServiceView goHome={() => setCurrentView(View.Home)} />;
      case View.Home:
      default:
        return <HomeView setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center">
        {renderView()}
      </main>
      <footer className="text-center p-4 bg-gray-900 text-gray-400 text-sm">
        <p>Created by "Edison Gabrido (FBS NCII Trainer)"</p>
        <p>Please contact me if you'd like to use this app for your School or institution.</p>
      </footer>
    </div>
  );
};

export default App;
