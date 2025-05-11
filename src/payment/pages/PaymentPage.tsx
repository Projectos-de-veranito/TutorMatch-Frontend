import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import PaymentModal from '../components/PaymentModal';
import { useNavigate } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import { PaymentPlan } from '../types/Payment';
import { PaymentService } from '../services/PaymentService';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';


const PaymentPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
    const [plans, setPlans] = useState<PaymentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const toastRef = React.useRef<Toast>(null);

    const userId = localStorage.getItem("currentUserId") || "";

    // Cargar planes desde Supabase al montar el componente
    useEffect(() => {
        const loadPlans = async () => {
            try {
                setLoading(true);
                setError(null);
                const plansData = await PaymentService.getPlans();

                if (plansData && plansData.length > 0) {
                    // Los datos ya vienen transformados desde el PaymentService
                    setPlans(plansData);
                } else {
                    // Si no hay planes disponibles, mostrar un mensaje
                    setError('No hay planes disponibles en este momento. Por favor, inténtalo más tarde.');
                    toastRef.current?.show({
                        severity: 'warn',
                        summary: 'Sin planes disponibles',
                        detail: 'No se encontraron planes en el servidor.',
                        life: 5000
                    });
                }
            } catch (err) {
                console.error('Error al cargar planes:', err);
                setError('Error al conectar con el servidor. Por favor, intenta más tarde.');

                toastRef.current?.show({
                    severity: 'error',
                    summary: 'Error de conexión',
                    detail: 'No se pudo conectar con el servidor de planes. Por favor, intenta más tarde.',
                    life: 5000
                });
            } finally {
                setLoading(false);
            }
        };

        loadPlans();
    }, []);

    const handleSelectPlan = (planId: string) => {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            setSelectedPlan(plan);
            setShowModal(true);
        }
    };

    const handlePaymentSuccess = (planId: string) => {
        console.log(`Plan ${planId} activado correctamente`);

        toastRef.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tu suscripción ha sido activada correctamente.',
            life: 5000
        });
        // Redirigir al dashboard después de un pequeño retraso
        setTimeout(() => {
            navigate('/dashboard');
        }, 3000);
    };

    // Convertir PaymentPlan a Plan para el PlanCard
    const convertToPlanCardFormat = (paymentPlan: PaymentPlan): PaymentPlan => {
        return {
            id: paymentPlan.id,
            name: paymentPlan.name,
            description: paymentPlan.description || "",
            amount: paymentPlan.amount,
        };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#1f1f1f] text-white">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                <p className="mt-4">Cargando planes disponibles...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#1f1f1f] text-white p-4 md:p-6">
            <Toast ref={toastRef} position="top-right" />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <Button
                    icon="pi pi-arrow-left"
                    className="p-button-text text-white"
                    onClick={() => navigate('/dashboard')}
                />
                <div className="flex items-center">
                    <img src="/tutormatch-logo.svg" alt="TutorMatch" className="h-8 mr-2" />
                    <span className="font-bold text-xl">TutorMatch</span>
                </div>
                <div className="w-10"></div> {/* Espaciador para centrar el logo */}
            </div>

            {/* Headline */}
            <div className="text-center mb-10 bg-primary py-10 px-4 rounded-lg">
                <h1 className="text-3xl font-bold mb-4">Conviértete en tutor y guía el éxito académico de otros.</h1>
                <p className="text-lg max-w-3xl mx-auto">
                    Ofrece tu conocimiento y ayuda a otros a alcanzar el éxito académico, ¡comienza a ofrecer tus tutorías hoy!
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 mb-8 text-center">
                    <p className="text-white">{error}</p>
                </div>
            )}

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map(plan => (
                    <PlanCard
                        key={plan.id}
                        plan={convertToPlanCardFormat(plan)}
                        onSelect={() => handleSelectPlan(plan.id)}
                        buttonText="Comprar Plan"
                    />
                ))}
            </div>

            {/* Modal de pago - ahora pasamos el plan seleccionado */}
            {selectedPlan && (
                <PaymentModal
                    userId={userId}
                    visible={showModal}
                    onHide={() => setShowModal(false)}
                    onSuccess={handlePaymentSuccess}
                    selectedPlan={selectedPlan}
                />
            )}
        </div>
    );
};

export default PaymentPage;