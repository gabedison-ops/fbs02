import React from 'react';
import { EvaluationResult } from '../types';

interface EvaluationModalProps {
    result: EvaluationResult;
    onClose: () => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ result, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white text-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Call Evaluation Report</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* What Went Well */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="text-xl font-semibold text-green-800 mb-3">What Went Well</h3>
                        <ul className="list-disc list-inside space-y-2 text-green-700">
                            {result.good_points.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                             {result.good_points.length === 0 && <li>No specific strengths identified.</li>}
                        </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h3 className="text-xl font-semibold text-red-800 mb-3">Areas for Improvement</h3>
                        <ul className="list-disc list-inside space-y-2 text-red-700">
                            {result.areas_for_improvement.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                            {result.areas_for_improvement.length === 0 && <li>Great job, no major improvements needed!</li>}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvaluationModal;
