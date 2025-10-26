import React from 'react';
import { Table, Reservation } from '../types';

interface DayViewProps {
    tables: Table[];
    reservations: Reservation[];
    selectedDate: string;
    isTableAvailableAtTime: (date: string, time: string, tableId: string) => boolean;
    onHourSelect: (hour: string) => void;
}

const DayView: React.FC<DayViewProps> = ({ tables, selectedDate, isTableAvailableAtTime, onHourSelect }) => {
    const hours = ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];
    
    const getAvailabilityInfo = (hour: string) => {
        const availableTables = tables.filter(table => isTableAvailableAtTime(selectedDate, hour, table.id));
        // FIX: Explicitly type sort function parameters to resolve TypeScript error.
        const availableSizes = [...new Set(availableTables.map(t => t.capacity))].sort((a: number, b: number) => a - b);
        return {
            count: availableTables.length,
            sizes: availableSizes,
        };
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg h-full flex flex-col border">
            {/* FIX: Parse date string as local time to prevent timezone-related display errors. */}
            <h3 className="text-xl font-bold mb-4 text-center">Availability for {new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {hours.map(hour => {
                    const info = getAvailabilityInfo(hour);
                    const isAvailable = info.count > 0;
                    return (
                        <button
                            key={hour}
                            onClick={() => isAvailable && onHourSelect(hour)}
                            disabled={!isAvailable}
                            className={`w-full text-left p-4 rounded-lg flex justify-between items-center transition ${isAvailable ? 'bg-white hover:bg-blue-50 hover:ring-2 hover:ring-blue-400 cursor-pointer' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        >
                            <span className="font-bold text-lg">{hour}</span>
                            <div className="text-right">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                    {info.count} Tables Available
                                </span>
                                {isAvailable && info.sizes.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">Seats: {info.sizes.join(', ')}</p>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default DayView;