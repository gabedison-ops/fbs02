import React, { useState } from 'react';
import CallSimulator from '../components/CallSimulator';
import ReservationSystem from '../components/ReservationSystem';
import { Table, Reservation, TableStatus } from '../types';
import { TABLES, RESERVATION_SCENARIOS, RESERVATION_SYSTEM_PROMPT, RESTAURANT_INFO } from '../constants';
import { FunctionDeclaration, Type } from '@google/genai';

interface ReservationViewProps {
    goHome: () => void;
}

const phtTimeZone = 'Asia/Manila';

// Gets today's date string (YYYY-MM-DD) in PHT
const getTodayInPHT = () => {
    const now = new Date();
    // Using en-CA locale gives YYYY-MM-DD format, which is safe for input fields.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: phtTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(now);
};

// Gets today's long date string (e.g., "Tuesday, November 5, 2024") in PHT
const getLongDateInPHT = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
        timeZone: phtTimeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(now);
};

const HOURS = ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];

// Deterministic function to simulate table unavailability for a specific time slot
const isTableSimulatedUnavailability = (date: string, time: string, tableId: string): boolean => {
    const seed = date + time + tableId;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const percentage = Math.abs(hash % 100);
    // 35% chance of being "unavailable" for maintenance, etc.
    return percentage < 35;
};


const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'makeReservation',
        description: 'Creates a new reservation in the system. The system will automatically assign the best available table.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                customerName: { type: Type.STRING, description: 'Full name of the customer.' },
                phone: { type: Type.STRING, description: 'Contact phone number for the reservation.' },
                guests: { type: Type.NUMBER, description: 'The number of guests in the party.' },
                date: { type: Type.STRING, description: 'The date of the reservation in YYYY-MM-DD format.' },
                time: { type: Type.STRING, description: 'The time of the reservation (e.g., "7:00 PM").' },
                seatingPreference: { type: Type.STRING, description: 'Customer seating preference, "Smoking" for outdoor or "Non-smoking" for indoor.' },
            },
            required: ['customerName', 'guests', 'date', 'time', 'seatingPreference'],
        }
    },
    {
        name: 'checkAvailability',
        description: 'Checks for available times and tables based on date, number of guests, and seating preference.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                date: { type: Type.STRING, description: 'The date to check in YYYY-MM-DD format.' },
                guests: { type: Type.NUMBER, description: 'The number of guests needing a table.' },
                seatingPreference: { type: Type.STRING, description: 'Customer seating preference, "Smoking" for outdoor or "Non-smoking" for indoor.' },
            },
            required: ['date', 'guests', 'seatingPreference'],
        }
    },
    {
        name: 'getRestaurantInfo',
        description: 'Gets general information about the restaurant like hours and parking.',
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    }
];

const ReservationView: React.FC<ReservationViewProps> = ({ goHome }) => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [activeScenario, setActiveScenario] = useState(RESERVATION_SCENARIOS[0]);
    const [selectedDate, setSelectedDate] = useState(getTodayInPHT());
    
    const isTableAvailableAtTime = (date: string, time: string, tableId: string): boolean => {
        const isReserved = reservations.some(r => r.tableId === tableId && r.date === date && r.time === time);
        if (isReserved) return false;
        
        const isBlocked = isTableSimulatedUnavailability(date, time, tableId);
        if (isBlocked) return false;

        return true;
    };

    const handleNewReservation = (reservation: Omit<Reservation, 'id'>) => {
        const newReservation = { ...reservation, id: `res-${Date.now()}` };
        setReservations(prev => [...prev, newReservation]);
        return newReservation;
    };

    const handleToolCall = async (name: string, args: any) => {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 90);
        
        if (args.date && new Date(args.date) > maxDate) {
            return { success: false, message: `Unfortunately we can only reserve up until 90 days from today.` };
        }

        if (name === 'getRestaurantInfo') {
            return RESTAURANT_INFO;
        }

        if (name === 'checkAvailability') {
            const requestedLocation = args.seatingPreference === 'Smoking' ? 'outdoor' : 'indoor';
            const suitableTables = TABLES.filter(t => t.capacity >= args.guests && t.location === requestedLocation);
            
            const availableSlots: string[] = [];
            
            HOURS.forEach(hour => {
                const hasAvailableTable = suitableTables.some(table => isTableAvailableAtTime(args.date, hour, table.id));
                if (hasAvailableTable) {
                    availableSlots.push(hour);
                }
            });

            if (availableSlots.length > 0) {
                return { available: true, options: `We have tables available at ${availableSlots.join(', ')}.` };
            }
            return { available: false, message: `No ${requestedLocation} tables available for ${args.guests} guests on ${args.date}. Perhaps another day?` };
        }

        if (name === 'makeReservation') {
            const requestedLocation = args.seatingPreference === 'Smoking' ? 'outdoor' : 'indoor';
    
            // Find the first available table that fits the criteria
            const tableToBook = TABLES.find(table => 
                table.capacity >= args.guests &&
                table.location === requestedLocation &&
                isTableAvailableAtTime(args.date, args.time, table.id)
            );

            if (!tableToBook) {
                return { success: false, message: `Sorry, we have no tables available for ${args.guests} guests with a ${requestedLocation} preference at ${args.time} on ${args.date}.` };
            }

            const reservation = handleNewReservation({
                name: args.customerName,
                phone: args.phone || 'N/A',
                guests: args.guests,
                date: args.date,
                time: args.time,
                tableId: tableToBook.id,
                seatingPreference: args.seatingPreference,
            });
            return { success: true, confirmationId: reservation.id, message: `Reservation confirmed for ${args.customerName} at table ${tableToBook.number}.` };
        }
        return { error: 'Unknown function' };
    };

    const systemPromptWithDate = RESERVATION_SYSTEM_PROMPT.replace('{current_date_pht}', getLongDateInPHT());

    return (
        <div className="w-full h-screen p-4 flex gap-4 bg-gray-100 max-w-screen-2xl mx-auto">
            <CallSimulator 
                title="RESERVATION CALL SIMULATOR" 
                scenarios={RESERVATION_SCENARIOS}
                activeScenario={activeScenario}
                setActiveScenario={setActiveScenario}
                systemInstruction={systemPromptWithDate}
                goHome={goHome}
                metrics={[
                    { label: 'Politeness', value: 0 },
                    { label: 'Efficiency', value: 0 },
                    { label: 'Accuracy', value: 0 }
                ]}
                functionDeclarations={functionDeclarations}
                onToolCall={handleToolCall}
            />
            <ReservationSystem 
                tables={TABLES} 
                reservations={reservations}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                onNewReservation={handleNewReservation}
                isTableAvailableAtTime={isTableAvailableAtTime}
            />
        </div>
    );
};

export default ReservationView;