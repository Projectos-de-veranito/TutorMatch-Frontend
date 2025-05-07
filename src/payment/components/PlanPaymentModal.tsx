import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Plan } from '../types/Plan';
import { PlanService } from '../services/PlanService';

interface PlanPaymentModalProps {
  visible: boolean;
  onHide: () => void;
  planId: number | null;
  userId: number;
  onSuccess: () => void;
}

const PlanPaymentModal: React.FC<PlanPaymentModalProps> = ({
  visible,
  onHide,
  planId,
  userId,
  onSuccess
}) => {
  const toast = useRef<Toast>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  
  // Datos del formulario de pago
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  
  // Cargar datos del plan cuando cambia el planId o se abre el modal
  useEffect(() => {
    const loadPlanData = async () => {
      if (!planId || !visible) {
        return;
      }
      
      try {
        setLoading(true);
        const planData = await PlanService.getPlanById(planId);
        if (planData) {
          setPlan(planData);
        } 
      } catch (error) {
        console.error('Error al cargar datos del plan:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un problema al cargar los datos del plan',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPlanData();
  }, [planId, visible]);
  
  // Función para formatear el número de tarjeta mientras se escribe
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substr(0, 16);
    
    // Formatear con espacios cada 4 dígitos
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formattedValue);
  };
  
  // Función para formatear la fecha de expiración mientras se escribe
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substr(0, 4);
    
    // Formatear como MM/YY
    if (value.length > 2) {
      value = value.substr(0, 2) + '/' + value.substr(2);
    }
    
    setExpiryDate(value);
  };
  
  // Validación del formulario
  const isFormValid = () => {
    return (
      cardNumber.replace(/\s/g, '').length === 16 &&
      cardName.trim().length >= 3 &&
      expiryDate.length === 5 &&
      cvv.length >= 3
    );
  };
  
  // Procesar el pago
  const handleProcessPayment = async () => {
    if (!isFormValid() || !planId || processing) {
      return;
    }
    
    try {
      setProcessing(true);
      
      // Aquí iría la integración real con una pasarela de pago
      // Por ahora simulamos un pago exitoso
      
      // Generar un ID de transacción aleatorio para simular
      const paymentId = Math.floor(Math.random() * 1000000);
      
      // Asociar el plan al usuario
      const result = await PlanService.subscribeToPlan(userId, planId, paymentId);
      
      if (result) {
        toast.current?.show({
          severity: 'success',
          summary: 'Pago exitoso',
          detail: 'Tu suscripción ha sido activada correctamente',
          life: 3000
        });
        
        // Limpiar el formulario
        setCardNumber('');
        setCardName('');
        setExpiryDate('');
        setCvv('');
        
        // Cerrar modal y notificar éxito
        setTimeout(() => {
          onHide();
          onSuccess();
        }, 1500);
      } else {
        throw new Error('No se pudo completar la suscripción');
      }
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo procesar el pago. Por favor, intenta nuevamente.',
        life: 3000
      });
    } finally {
      setProcessing(false);
    }
  };
  
  // Título personalizado del modal
  const header = (
    <div className="flex justify-between items-center w-full">
      <h2 className="text-xl font-bold text-white">Completa tu suscripción</h2>
      <button
        onClick={onHide}
        className="bg-transparent border-none text-gray-300 hover:text-white cursor-pointer"
      >
        <i className="pi pi-times" style={{ fontSize: '1.25rem' }}></i>
      </button>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={header}
        visible={visible}
        style={{ width: '90%', maxWidth: '550px' }}
        className="payment-modal"
        onHide={onHide}
        draggable={false}
        resizable={false}
        modal={true}
        blockScroll={true}
        contentClassName="bg-[#1f1f1f] text-white p-0"
        headerClassName="bg-[#252525] border-b border-gray-700"
      >
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="p-5">
            {/* Detalles del Plan */}
            {plan && (
              <div className="mb-6 bg-[#282828] p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-gray-300 text-sm">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">S/. {plan.price}</span>
                    <p className="text-xs text-gray-400">Duración: {plan.duration} días</p>
                  </div>
                </div>
                
                <div className="text-sm">
                  <h4 className="text-gray-300 font-medium mb-1">Incluye:</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <i className="pi pi-check text-green-500 mr-2 mt-1"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-gray-400 italic">
                        ...y {plan.features.length - 3} beneficios más
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Formulario de Pago */}
            <div>
              <h3 className="text-lg font-bold mb-4">Información de Pago</h3>
              
              <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Número de Tarjeta
                </label>
                <InputText
                  id="cardNumber"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-[#2a2a2a] border border-gray-600 text-white"
                  maxLength={19}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre en la Tarjeta
                </label>
                <InputText
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full bg-[#2a2a2a] border border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">
                    Fecha de Expiración
                  </label>
                  <InputText
                    id="expiryDate"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    className="w-full bg-[#2a2a2a] border border-gray-600 text-white"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-300 mb-1">
                    CVV
                  </label>
                  <InputText
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    className="w-full bg-[#2a2a2a] border border-gray-600 text-white"
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-6">
                <p className="flex items-center">
                  <i className="pi pi-lock mr-1"></i>
                  Tus datos están seguros y encriptados
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  className="px-4 py-2 bg-transparent border border-gray-500 text-white rounded hover:bg-gray-800"
                  onClick={onHide}
                >
                  Cancelar
                </button>
                <button
                  className={`px-6 py-2 bg-primary text-white rounded flex items-center justify-center
                    ${!isFormValid() || processing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
                  onClick={handleProcessPayment}
                  disabled={!isFormValid() || processing}
                >
                  {processing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white border-solid rounded-full animate-spin mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    `Pagar S/. ${plan?.price || '0.00'}`
                  )}
                </button>
              </div>
            </div>

            {/* Información de seguridad y políticas */}
            <div className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-400">
              <p className="mb-1">
                Al completar este pago, aceptas nuestros <a href="#" className="text-blue-400 hover:underline">Términos de Servicio</a> y <a href="#" className="text-blue-400 hover:underline">Política de Privacidad</a>.
              </p>
              <p>
                Para cancelar tu suscripción en cualquier momento, puedes hacerlo desde la sección de perfil.
              </p>
            </div>
          </div>
        )}
      </Dialog>
      
      {/* Agregar estilos personalizados para el modal */}
      <style>{`
        :global(.payment-modal .p-dialog-header-icons) {
          display: none;
        }
        :global(.payment-modal .p-inputtext:focus) {
          box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
          border-color: #dc2626 !important;
        }
        :global(.payment-modal .p-dialog-content) {
          border-radius: 0 0 6px 6px;
        }
      `}</style>
    </>
  );
};

export default PlanPaymentModal;