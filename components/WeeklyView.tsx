import React from 'react';
import { Table, Reservation } from '../types';

interface WeeklyViewProps {
    tables: Table[];
    reservations: Reservation[];
    selectedDate: string;
    isTableAvailableAtTime: (date: string, time: string, tableId: string) => boolean;
    setSelectedDate: (date: string) => void;
}

const toYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ tables, selectedDate, isTableAvailableAtTime, setSelectedDate }) => {
    const hours = ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];

    const getWeekDays = (startDate: string) => {
        // FIX: Parse date string as local time to avoid timezone shifts.
        const parts = startDate.split('-').map(s => parseInt(s, 10));
        const start = new Date(parts[0], parts[1] - 1, parts[2]);
        
        // Adjust to start of the week (Sunday)
        start.setDate(start.getDate() - start.getDay());
        const week = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(day.getDate() + i);
            week.push(day);
        }
        return week;
    };

    const weekDays = getWeekDays(selectedDate);
    
    const getAvailabilityStatus = (date: Date) => {
        const dateString = toYYYYMMDD(date);
        const totalSlots = tables.length * hours.length;
        if (totalSlots === 0) return { text: 'N/A', color: 'bg-gray-200 text-gray-800' };

        let unavailableSlots = 0;
        tables.forEach(table => {
            hours.forEach(hour => {
                if (!isTableAvailableAtTime(dateString, hour, table.id)) {
                    unavailableSlots++;
                }
            });
        });

        const percentage = (unavailableSlots / totalSlots) * 100;
        
        if (percentage >= 90) return { text: 'Fully Booked', color: 'bg-red-200 text-red-800' };
        if (percentage > 50) return { text: 'Limited', color: 'bg-yellow-200 text-yellow-800' };
        return { text: 'Available', color: 'bg-green-200 text-green-800' };
    }

    return (
        <div className="bg-gray-100 p-4 rounded-lg border">
            <div className="mb-4">
                <label htmlFor="date-picker" className="block text-sm font-bold text-gray-700 mb-1">Select Date</label>
                <input
                    type="date"
                    id="date-picker"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border rounded-md w-full"
                />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-bold text-gray-600 text-sm">{day}</div>
                ))}
            </div>
             <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(day => {
                    const status = getAvailabilityStatus(day);
                    const dateString = toYYYYMMDD(day);
                    const isSelected = dateString === selectedDate;

                    return (
                        <button 
                            key={day.toISOString()} 
                            onClick={() => setSelectedDate(dateString)}
                            className={`p-2 rounded-lg h-24 flex flex-col justify-between items-start text-left transition ${isSelected ? 'ring-2 ring-blue-500 bg-white' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <span className={`font-bold text-sm ${isSelected ? 'text-blue-600' : ''}`}>{day.getDate()}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default WeeklyView;