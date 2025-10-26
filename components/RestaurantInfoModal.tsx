import React from 'react';
import { RESTAURANT_INFO } from '../constants';

interface RestaurantInfoModalProps {
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <dt className="font-semibold text-gray-800">{label}</dt>
        <dd className="text-gray-600">{value}</dd>
    </div>
);

const RestaurantInfoModal: React.FC<RestaurantInfoModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-xl text-gray-800 max-w-lg w-full m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{RESTAURANT_INFO.name} Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>
                
                <dl className="space-y-4">
                    <DetailItem label="Cuisine" value={RESTAURANT_INFO.cuisine} />
                    <DetailItem label="Dining Style" value={RESTAURANT_INFO.diningStyle} />
                    <DetailItem label="Hours of Operation" value={RESTAURANT_INFO.hours} />
                    <DetailItem label="Parking" value={RESTAURANT_INFO.parking} />
                    <DetailItem label="Address" value={RESTAURANT_INFO.address} />
                    <DetailItem label="Landmarks" value={RESTAURANT_INFO.landmarks} />
                    <DetailItem label="Directions" value={RESTAURANT_INFO.directions} />
                </dl>

                <div className="mt-6 text-right">
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantInfoModal;