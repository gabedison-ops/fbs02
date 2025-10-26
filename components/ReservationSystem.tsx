import React, { useState, useEffect } from 'react';
import { Table, Reservation } from '../types';
import { RESTAURANT_INFO, MENU_ITEMS } from '../constants';
import DayView from './DayView';
import WeeklyView from './WeeklyView';
import FloorPlanModal from './FloorPlanModal';
import RestaurantInfoModal from './RestaurantInfoModal';

interface ReservationSystemProps {
    tables: Table[];
    reservations: Reservation[];
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    onNewReservation: (reservation: Omit<Reservation, 'id'>) => void;
    isTableAvailableAtTime: (date: string, time: string, tableId: string) => boolean;
}

const MenuModal: React.FC<{onClose: () => void}> = ({onClose}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white p-8 rounded-lg shadow-xl text-gray-800 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">Menu Highlights at {RESTAURANT_INFO.name}</h3>
            <div className="space-y-4">
                {MENU_ITEMS.slice(0, 4).map(item => (
                    <div key={item.id}>
                        <h4 className="font-bold">{item.name} - ${item.price.toFixed(2)}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                ))}
            </div>
            <button onClick={onClose} className="mt-6 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg w-full">Close</button>
        </div>
    </div>
)

const ReservationSystem: React.FC<ReservationSystemProps> = ({ tables, reservations, selectedDate, setSelectedDate, onNewReservation, isTableAvailableAtTime }) => {
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [numGuests, setNumGuests] = useState(2);
    const [seatingPreference, setSeatingPreference] = useState<'Non-smoking' | 'Smoking'>('Non-smoking');
    const [specialRequests, setSpecialRequests] = useState('');
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    
    useEffect(() => {
        // Reset selection when date changes
        setSelectedTable(null);
        setSelectedTime('');
    }, [selectedDate]);

    const handleHourSelect = (time: string) => {
        setSelectedTime(time);
        setIsFloorPlanModalOpen(true);
    };

    const handleTableSelect = (table: Table) => {
        setSelectedTable(table);
        setIsFloorPlanModalOpen(false);
        // Set seating preference based on table location
        setSeatingPreference(table.location === 'indoor' ? 'Non-smoking' : 'Smoking');
    };

    const clearForm = () => {
        setSelectedTable(null);
        setSelectedTime('');
        setCustomerName('');
        setPhoneNumber('');
        setNumGuests(2);
        setSpecialRequests('');
        setSeatingPreference('Non-smoking');
    };

    const handleConfirm = () => {
        if (selectedTable && customerName && selectedTime) {
            onNewReservation({
                name: customerName,
                phone: phoneNumber,
                guests: numGuests,
                time: selectedTime,
                date: selectedDate,
                seatingPreference,
                specialRequests,
                tableId: selectedTable.id,
            });
            clearForm();
        }
    };
    
    return (
        <div className="w-2/3 bg-white rounded-lg shadow-2xl p-6 text-gray-800 flex flex-col h-full">
            {isMenuModalOpen && <MenuModal onClose={() => setIsMenuModalOpen(false)} />}
            {isInfoModalOpen && <RestaurantInfoModal onClose={() => setIsInfoModalOpen(false)} />}
            {isFloorPlanModalOpen && (
                <FloorPlanModal
                    isOpen={isFloorPlanModalOpen}
                    onClose={() => setIsFloorPlanModalOpen(false)}
                    onSelectTable={handleTableSelect}
                    tables={tables}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    isTableAvailableAtTime={isTableAvailableAtTime}
                />
            )}
            <div className="flex justify-between items-start mb-4 border-b pb-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{RESTAURANT_INFO.name} Restaurant</h1>
                    <p className="text-md text-gray-600">Reservation System V.1</p>
                </div>
                 <div className="flex gap-2">
                    <button onClick={() => setIsInfoModalOpen(true)} className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 flex-shrink-0">Restaurant Details</button>
                    <button onClick={() => setIsMenuModalOpen(true)} className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 flex-shrink-0">View Menu</button>
                </div>
            </div>
            
            <div className="flex-grow flex gap-6 min-h-0">
                {/* Left Column */}
                <div className="w-1/2 flex flex-col gap-4">
                    <WeeklyView 
                        tables={tables} 
                        reservations={reservations} 
                        selectedDate={selectedDate} 
                        isTableAvailableAtTime={isTableAvailableAtTime} 
                        setSelectedDate={setSelectedDate} 
                    />
                    {/* Reservation Form */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-bold text-lg mb-3">Booking Details</h3>
                         {selectedTable ? (
                            <div className="bg-blue-100 text-blue-800 p-3 rounded-md mb-4 text-center font-semibold">
                                Selected: Table {selectedTable.number} for {numGuests} {numGuests === 1 ? 'guest' : 'guests'} at {selectedTime} on {selectedDate}
                            </div>
                        ) : (
                            <div className="bg-gray-200 text-gray-700 p-3 rounded-md mb-4 text-center">
                                Please select a time and table.
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="p-2 border rounded-md"/>
                            <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="p-2 border rounded-md"/>
                            <input type="number" placeholder="Guests" value={numGuests} onChange={e => setNumGuests(parseInt(e.target.value))} className="p-2 border rounded-md"/>
                            <select value={seatingPreference} onChange={e => setSeatingPreference(e.target.value as any)} className="p-2 border rounded-md">
                                <option value="Non-smoking">Non-smoking (Indoor)</option>
                                <option value="Smoking">Smoking (Outdoor)</option>
                            </select>
                            <textarea placeholder="Special Requests" value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className="p-2 border rounded-md col-span-2" rows={1}></textarea>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={handleConfirm} disabled={!selectedTable || !customerName} className="w-full bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400">CONFIRM</button>
                            <button onClick={clearForm} className="w-full bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400">CLEAR</button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="w-1/2">
                    <DayView 
                        tables={tables}
                        reservations={reservations}
                        selectedDate={selectedDate}
                        isTableAvailableAtTime={isTableAvailableAtTime}
                        onHourSelect={handleHourSelect}
                    />
                </div>
            </div>
        </div>
    );
}

export default ReservationSystem;