import { Table, MenuItem } from './types';

export const TABLES: Table[] = [
    { id: 't1', number: 1, capacity: 2, location: 'outdoor' },
    { id: 't2', number: 2, capacity: 2, location: 'indoor' },
    { id: 't3', number: 3, capacity: 4, location: 'outdoor' },
    { id: 't4', number: 4, capacity: 4, location: 'indoor' },
    { id: 't5', number: 5, capacity: 6, location: 'outdoor' },
    { id: 't6', number: 6, capacity: 6, location: 'indoor' },
    { id: 't7', number: 7, capacity: 8, location: 'outdoor' },
    { id: 't8', number: 8, capacity: 8, location: 'indoor' },
];

export const RESTAURANT_INFO = {
    name: "Aristello",
    cuisine: "Italian-French",
    hours: "5:00 PM - 11:00 PM Daily",
    address: "73 CLA Town Plaza, Binan, Pagsanjan, Laguna",
    landmarks: "Beside Plaza Theatre",
    directions: "Located in the main town plaza of Pagsanjan. From the National Highway, turn towards the municipal hall. We are located beside the historic Plaza Theatre.",
    parking: "Valet parking available ($15)",
    diningStyle: "Casual Dining"
};

export const MENU_ITEMS: MenuItem[] = [
    { id: 'm1', name: 'Gluten-Free Pancakes', price: 14.99, category: 'Appetizers', imageUrl: 'https://picsum.photos/id/20/100/100', isGlutenFree: true, description: 'Fluffy pancakes for a gluten-free start' },
    { id: 'm2', name: 'Avocado Toast', price: 12.50, category: 'Appetizers', imageUrl: 'https://picsum.photos/id/30/100/100', description: 'Fresh avocado on toasted sourdough' },
    { id: 'm3', name: 'Avocado Toast (GF)', price: 13.50, category: 'Appetizers', imageUrl: 'https://picsum.photos/id/40/100/100', isGlutenFree: true, description: 'Fresh avocado on toasted gluten-free bread' },
    { id: 'm4', name: 'Omelet Station', price: 16.00, category: 'Main Courses', imageUrl: 'https://picsum.photos/id/50/100/100', description: 'Build your own omelet' },
    { id: 'm5', name: 'Steak & Eggs', price: 24.00, category: 'Main Courses', imageUrl: 'https://picsum.photos/id/60/100/100', description: 'A hearty classic breakfast' },
    { id: 'm6', name: 'Fruit Platter', price: 9.99, category: 'Desserts', imageUrl: 'https://picsum.photos/id/70/100/100', description: 'A selection of fresh seasonal fruits' },
    { id: 'm7', name: 'Orange Juice', price: 4.50, category: 'Beverages', imageUrl: 'https://picsum.photos/id/80/100/100', description: 'Freshly squeezed orange juice' },
    { id: 'm8', name: 'Coffee', price: 3.50, category: 'Beverages', imageUrl: 'https://picsum.photos/id/90/100/100', description: 'Freshly brewed coffee' },
];

export const RESERVATION_SCENARIOS = [
    {
        id: 'res1',
        description: 'Standard booking for anniversary',
        prompt: "Hello, I'd like to make a reservation for my anniversary.",
        avatar: 'https://i.pravatar.cc/150?u=male1'
    },
    {
        id: 'res2',
        description: 'Group booking with a special request',
        prompt: "Hi there, I need to make a reservation for a large group.",
        avatar: 'https://i.pravatar.cc/150?u=female1'
    },
    {
        id: 'res3',
        description: 'Requesting a quiet table',
        prompt: "Hi, I'd like to book a table for Saturday evening. Do you have anything quiet available, perhaps outdoors?",
        avatar: 'https://i.pravatar.cc/150?u=male3'
    },
    {
        id: 'res4',
        description: 'Caller needs restaurant info',
        prompt: "Hi, I have a couple of questions. What type of cuisine do you serve? Also, what's your dining style, is it formal?",
        avatar: 'https://i.pravatar.cc/150?u=female3'
    }
];

export const ROOM_SERVICE_SCENARIOS = [
    {
        id: 'rs1',
        description: 'Breakfast order with allergy',
        prompt: "Hi, I'd like to order breakfast, but I have a gluten allergy. I am in room 501.",
        avatar: 'https://i.pravatar.cc/150?u=female2'
    },
    {
        id: 'rs2',
        description: 'Late-night snack order',
        prompt: "Hello, is it too late to get some room service? I'd love a steak and a coffee. My room number is 322.",
        avatar: 'https://i.pravatar.cc/150?u=male2'
    },
    {
        id: 'rs3',
        description: 'Large order for a family',
        prompt: "Hello, room service? I'd like to place an order for room 1205. We'll need two steaks, an omelet, and two fruit platters.",
        avatar: 'https://i.pravatar.cc/150?u=family1'
    },
    {
        id: 'rs4',
        description: 'Caller with questions about menu items',
        prompt: "Hi, I'm looking at the menu. Can you tell me what's in the Omelet Station? I'm in room 811.",
        avatar: 'https://i.pravatar.cc/150?u=male4'
    }
];

export const RESERVATION_SYSTEM_PROMPT = `You are a customer calling the restaurant 'Aristello' to make a reservation. Your goal is to interact naturally with the student, who is playing the role of the receptionist. Start the conversation with your initial request from the scenario. If the scenario involves asking for information, state your questions clearly. For booking scenarios, wait for the receptionist to ask you questions, and then provide the details needed (party size, date, time). Be conversational and cooperative. Today's date is {current_date_pht}. You MUST use this as the current date for all interactions. All times are in Philippine Time (PHT). Do not request a specific table number, but you can express a preference for a location like 'indoor', 'outdoor', or a quality like 'quiet'. Use the provided functions to get restaurant information and check availability. Do not mention that you are an AI. SPECIAL INSTRUCTION: After your main goal (like making a reservation) is confirmed by the student, or if the student asks if there is anything else they can help you with, you MUST ask one or two follow-up questions about the restaurant. Choose from: "Do you have parking available?", "What are your hours of operation?", "What is the dining style?", "How do I get there? What are some landmarks?", "What type of cuisine is it?", or "Could you tell me a bit about your menu?".`;

export const ROOM_SERVICE_SYSTEM_PROMPT = `You are a hotel guest calling room service. Your goal is to place an order, ask questions about the menu, and interact with the student, who is playing the role of the room service attendant. Use the provided functions to get menu information and place your order. Do not mention that you are an AI. Be polite but clear about your needs.`;