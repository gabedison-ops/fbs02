import React, { useState } from 'react';
import CallSimulator from '../components/CallSimulator';
import RoomServiceSystem from '../components/RoomServiceSystem';
import { OrderItem } from '../types';
import { MENU_ITEMS, ROOM_SERVICE_SCENARIOS, ROOM_SERVICE_SYSTEM_PROMPT } from '../constants';
import { FunctionDeclaration, Type } from '@google/genai';

interface RoomServiceViewProps {
    goHome: () => void;
}

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'getMenuItems',
        description: 'Fetches menu items, optionally filtering by category or dietary needs like gluten-free.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                category: { 
                    type: Type.STRING, 
                    description: 'The category of menu items to fetch (e.g., "Appetizers", "Main Courses").' 
                },
                isGlutenFree: { 
                    type: Type.BOOLEAN, 
                    description: 'Set to true to only fetch gluten-free items.' 
                },
            },
        }
    },
    {
        name: 'placeOrder',
        description: 'Places a room service order for a specific room with a list of items.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                roomNumber: {
                    type: Type.NUMBER,
                    description: 'The room number to deliver the order to.'
                },
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            itemName: { type: Type.STRING, description: "Name of the menu item."},
                            quantity: { type: Type.NUMBER, description: "Number of this item to order."}
                        },
                        required: ['itemName', 'quantity']
                    },
                    description: 'A list of items to be included in the order.'
                }
            },
            required: ['roomNumber', 'items']
        }
    }
];

const RoomServiceView: React.FC<RoomServiceViewProps> = ({ goHome }) => {
    const [order, setOrder] = useState<OrderItem[]>([]);
    const [activeScenario, setActiveScenario] = useState(ROOM_SERVICE_SCENARIOS[0]);

    const addToOrder = (itemId: string, quantity: number) => {
        const item = MENU_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        setOrder(prevOrder => {
            const existingItem = prevOrder.find(i => i.id === itemId);
            if (existingItem) {
                return prevOrder.map(i => i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i).filter(i => i.quantity > 0);
            } else if(quantity > 0) {
                return [...prevOrder, { ...item, quantity }];
            }
            return prevOrder;
        });
    };
    
    const removeFromOrder = (itemId: string) => {
       addToOrder(itemId, -1);
    }

    const handleToolCall = async (name: string, args: any) => {
        if (name === 'getMenuItems') {
            let results = [...MENU_ITEMS];
            if (args.category) {
                results = results.filter(item => item.category === args.category);
            }
            if (args.isGlutenFree === true) {
                results = results.filter(item => item.isGlutenFree);
            }
            return { 
                items: results.map(item => ({ name: item.name, price: item.price, description: item.description })) 
            };
        }
        if (name === 'placeOrder') {
            const newOrderItems: OrderItem[] = [];
            for (const orderItem of args.items) {
                const menuItem = MENU_ITEMS.find(mi => mi.name.toLowerCase() === orderItem.itemName.toLowerCase());
                if (menuItem) {
                    newOrderItems.push({ ...menuItem, quantity: orderItem.quantity });
                }
            }
            setOrder(currentOrder => [...currentOrder, ...newOrderItems]);
            return { success: true, confirmationNumber: `order-${Date.now()}`, totalItems: newOrderItems.length };
        }
        return { error: 'Unknown function' };
    };

    return (
        <div className="w-full h-screen p-4 flex gap-4 bg-gray-100">
            <CallSimulator 
                title="ROOM SERVICE CALL SIMULATOR"
                scenarios={ROOM_SERVICE_SCENARIOS}
                activeScenario={activeScenario}
                setActiveScenario={setActiveScenario}
                systemInstruction={ROOM_SERVICE_SYSTEM_PROMPT}
                goHome={goHome}
                metrics={[
                    { label: 'Accuracy', value: 0 },
                    { label: 'Upselling', value: 0 },
                    { label: 'Resolution', value: 0 }
                ]}
                functionDeclarations={functionDeclarations}
                onToolCall={handleToolCall}
            />
            <RoomServiceSystem 
                menu={MENU_ITEMS}
                order={order}
                onAddToOrder={addToOrder}
                onRemoveFromOrder={removeFromOrder}
            />
        </div>
    );
};

export default RoomServiceView;