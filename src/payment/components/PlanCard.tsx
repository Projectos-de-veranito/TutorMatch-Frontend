import React from 'react';
import { PaymentPlan } from '../types/Payment';

interface PlanCardProps {
  plan: PaymentPlan;
  isActive?: boolean;
  onSelect: (planId: string) => void;
  buttonText?: string;
  disabled?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  isActive = false, 
  onSelect,
  buttonText = "Buy Plan",
  disabled = false
}) => {
  // Obtener el color de cabecera según el tipo de plan
  const getHeaderBgColor = () => {
    if (plan.name.toUpperCase().includes('BASIC')) {
      return 'bg-[#8b0000]'; // Rojo oscuro
    } else if (plan.name.toUpperCase().includes('STANDARD')) {
      return 'bg-[#c92020]'; // Rojo primario (primary)
    } else if (plan.name.toUpperCase().includes('PREMIUM')) {
      return 'bg-[#a51b1b]'; // Rojo hover (primary-hover)
    }
    return 'bg-[#c92020]'; // Por defecto, usar el color primario
  };

  return (
    <div className={`rounded-lg ${isActive ? 'ring-2 ring-primary' : ''} overflow-hidden h-full flex flex-col shadow-lg`}>
      {/* Cabecera del plan */}
      <div className={`p-4 ${getHeaderBgColor()} text-white text-center`}>
        <h3 className="text-xl font-bold">{plan.name}</h3>
      </div>

      {/* Características del plan */}
      <div className="p-6 bg-dark-card text-white flex-grow flex flex-col">
        {plan.amount > 0 && (
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-primary">S/ {plan.amount.toFixed(2)}</span>
            <span className="text-light-gray text-sm ml-1">/ mes</span>
          </div>
        )}
        
        <div className="space-y-3 mb-8 flex-grow">
          <div className="flex items-start text-sm">
            <div className="mr-2 text-primary">•</div>
            <span className="text-light-gray">{plan.description}</span>
          </div>
        </div>

        <button
          onClick={() => !disabled && onSelect(plan.id)}
          className={`w-full py-3 rounded font-bold mt-6 transition-colors
            ${disabled 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-hover'}`}
          disabled={disabled}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;