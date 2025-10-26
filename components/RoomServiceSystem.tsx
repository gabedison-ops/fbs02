
import React, { useState } from 'react';
import { MenuItem, OrderItem } from '../types';
import { AddIcon, RemoveIcon } from './icons';

interface RoomServiceSystemProps {
    menu: MenuItem[];
    order: OrderItem[];
    onAddToOrder: (itemId: string, quantity: number) => void;
    onRemoveFromOrder: (itemId: string) => void;
}

const RoomServiceSystem: React.FC<RoomServiceSystemProps> = ({ menu, order, onAddToOrder, onRemoveFromOrder }) => {
    const [activeCategory, setActiveCategory] = useState<'Appetizers' | 'Main Courses' | 'Desserts' | 'Beverages'>('Appetizers');
    
    const categories: ('Appetizers' | 'Main Courses' | 'Desserts' | 'Beverages')[] = ['Appetizers', 'Main Courses', 'Desserts', 'Beverages'];
    const filteredMenu = menu.filter(item => item.category === activeCategory);

    const subtotal = order.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="w-2/3 bg-white rounded-lg shadow-2xl p-8 text-gray-800 flex gap-8">
            <div className="w-2/3">
                <h2 className="text-2xl font-bold mb-4">INTEGRATED ROOM SERVICE ORDER SYSTEM</h2>
                <div className="border-b mb-4">
                    <nav className="-mb-px flex gap-6">
                        {categories.map(cat => (
                           <button key={cat} onClick={() => setActiveCategory(cat)} className={`py-2 px-1 border-b-2 font-semibold ${activeCategory === cat ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                               {cat}
                           </button> 
                        ))}
                    </nav>
                </div>
                <div className="space-y-3 pr-4 overflow-y-auto max-h-[calc(100vh-250px)]">
                    {filteredMenu.map(item => (
                        <div key={item.id} className="flex items-center bg-gray-50 p-3 rounded-lg">
                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md mr-4 object-cover"/>
                            <div className="flex-grow">
                                <h4 className="font-bold">{item.name} {item.isGlutenFree && '(GF)'}</h4>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                <p className="font-semibold text-gray-800">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => onAddToOrder(item.id, 1)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"><AddIcon className="w-5 h-5"/></button>
                                <span className="font-bold w-4 text-center">{order.find(o => o.id === item.id)?.quantity || 0}</span>
                                <button onClick={() => onRemoveFromOrder(item.id)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"><RemoveIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-1/3 bg-gray-100 rounded-lg p-6 flex flex-col">
                <h3 className="text-lg font-bold mb-4">CURRENT ORDER FOR ROOM 501</h3>
                <div className="flex-grow space-y-2 overflow-y-auto">
                   {order.map(item => (
                       <div key={item.id} className="flex justify-between items-center text-sm">
                           <span>{item.name} ({item.quantity})</span>
                           <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                   ))}
                </div>
                <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg mb-4">
                        <span>SUBTOTAL</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <button className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition mb-2">CONFIRM ORDER</button>
                    <button className="w-full bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition">CANCEL</button>
                </div>
            </div>
        </div>
    );
};

export default RoomServiceSystem;
