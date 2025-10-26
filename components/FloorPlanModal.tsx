import React from 'react';
import { Table } from '../types';

interface FloorPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTable: (table: Table) => void;
    tables: Table[];
    selectedDate: string;
    selectedTime: string;
    isTableAvailableAtTime: (date: string, time: string, tableId: string) => boolean;
}

const FloorPlanModal: React.FC<FloorPlanModalProps> = ({ isOpen, onClose, onSelectTable, tables, selectedDate, selectedTime, isTableAvailableAtTime }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl text-gray-800 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Select a Table for {selectedTime}</h3>
                <div className="grid grid-cols-4 gap-4 bg-gray-100 p-4 rounded-lg">
                    {tables.map(table => {
                        const isAvailable = isTableAvailableAtTime(selectedDate, selectedTime, table.id);
                        return (
                            <button
                                key={table.id}
                                disabled={!isAvailable}
                                onClick={() => onSelectTable(table)}
                                className={`h-20 rounded-md text-white font-bold flex flex-col items-center justify-center transition ${isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                            >
                                <span>T{table.number}</span>
                                <span className="text-xs">({table.capacity} Guests)</span>
                                <span className="text-xs font-normal capitalize">{table.location}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-end mt-4">
                     <button onClick={onClose} className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default FloorPlanModal;
