import React from 'react';
import { Plan } from '../types/Plan';

interface PlanCardProps {
  plan: Plan;
  isActive?: boolean;
  onSelect: (planId: number) => void;
  buttonText?: string;
  disabled?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  isActive = false, 
  onSelect,
  buttonText = "Buy Plan",
  disabled
}) => {
  // Definir colores según el tipo de plan
  const getBgColor = () => {
    if (plan.name.toUpperCase().includes('BASIC') || plan.name.toUpperCase().includes('BÁSICO')) {
      return 'bg-[#6B0F0F]';
    } else if (plan.name.toUpperCase().includes('STANDARD') || plan.name.toUpperCase().includes('ESTÁNDAR')) {
      return 'bg-[#6B0F0F]';
    } else if (plan.name.toUpperCase().includes('PREMIUM')) {
      return 'bg-[#6B0F0F]';
    }
    return 'bg-[#6B0F0F]'; // Color por defecto
  };

  return (
    <div className={`rounded-lg ${isActive ? 'ring-2 ring-primary' : ''} overflow-hidden h-full flex flex-col`}>
      {/* Cabecera del plan */}
      <div className={`p-4 ${getBgColor()} text-white text-center`}>
        <h3 className="text-xl font-bold">{plan.name}</h3>
      </div>

      {/* Características del plan */}
      <div className="p-6 bg-[#6B0F0F] text-white flex-grow flex flex-col">
        <ul className="space-y-3 mb-8 flex-grow">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <div className="mr-2 text-white">•</div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
        onClick={() => onSelect(plan.id)}
        className={`w-full py-3 rounded font-bold mt-6 transition-colors
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-white text-[#951924] hover:bg-gray-200'}`}
        disabled={disabled}
      >
        {buttonText}
      </button>
        
        
      </div>
    </div>
  );
};

export default PlanCard;