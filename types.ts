export enum View {
    Home,
    Reservations,
    RoomService,
}

export enum TableStatus {
    Available = 'Available',
    Seated = 'Seated',
}

export interface Table {
    id: string;
    number: number;
    capacity: number;
    location: 'indoor' | 'outdoor';
}

export interface Reservation {
    id: string;
    name: string;
    phone: string;
    guests: number;
    time: string;
    date: string; // YYYY-MM-DD format
    seatingPreference: 'Non-smoking' | 'Smoking';
    specialRequests?: string;
    tableId: string;
}

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: 'Appetizers' | 'Main Courses' | 'Desserts' | 'Beverages';
    description?: string;
    imageUrl: string;
    isGlutenFree?: boolean;
}

export interface OrderItem extends MenuItem {
    quantity: number;
    specialRequests?: string;
}

export interface CallMetric {
    label: string;
    value: number;
}

export interface TranscriptEntry {
    speaker: 'user' | 'model';
    text: string;
    isFinal?: boolean;
}

export interface EvaluationResult {
    scores: { [key: string]: number };
    good_points: string[];
    areas_for_improvement: string[];
}
