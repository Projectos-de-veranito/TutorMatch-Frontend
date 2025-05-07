import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import { Plan } from '../types/Plan';
import { PlanService } from '../services/PlanService';
import PlanPaymentModal from '../components/PlanPaymentModal';
import { User } from '../../user/types/User';
import { Button } from 'primereact/button';
import { AuthService } from '../../public/services/authService';

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewTutor = searchParams.get('newTutor') === 'true';
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [isJustRegistered, setIsJustRegistered] = useState<boolean>(false);


  // Planes disponibles
  const plans: Plan[] = [
    {
      id: 1,
      name: "BASIC Plan",
      description: "Para iniciantes en tutoría",
      price: 9.99,
      duration: 30,
      features: [
        "Perfil básico de tutor en la plataforma",
        "Creación de hasta 2 tutorías",
        "Acceso a estudiantes interesados",
        "Historial de tutorías impartidas",
        "Visibilidad estándar en búsquedas",
        "Soporte con tiempo de respuesta de 48 horas",
        "Acceso limitado a estadísticas"
      ],
      color: "#6B0F0F"
    },
    {
      id: 2,
      name: "STANDARD Plan",
      description: "Para tutores regulares",
      price: 19.99,
      duration: 30,
      features: [
        "Todo lo incluido en el plan básico",
        "Creación de hasta 8 tutorías simultáneas",
        "Herramientas avanzadas de gestión de tutorías",
        "Calendario de disponibilidad con recordatorios automáticos",
        "Recomendaciones personalizadas para estudiantes",
        "Mejor visibilidad en búsquedas",
        "Etiqueta de 'Tutor Verificado'",
        "Subida de materiales adicionales por tutoría",
        "Soporte con tiempo de respuesta de 24 horas"
      ],
      color: "#6B0F0F"
    },
    {
      id: 3,
      name: "PREMIUM Plan",
      description: "Para tutores profesionales",
      price: 29.99,
      duration: 30,
      features: [
        "Todo lo incluido en el plan estándar",
        "Creación ilimitada de tutorías",
        "Perfil destacado con mayor exposición en la plataforma",
        "Estadísticas avanzadas sobre el rendimiento de tutorías",
        "Promoción en la sección de tutores recomendados",
        "Descuentos en anuncios promocionales",
        "Prioridad en los resultados de búsqueda",
        "Sello 'Tutor Premium' en el perfil",
        "Soporte prioritario con tiempo de respuesta de 12 horas",
        "Acceso a eventos exclusivos y oportunidades de desarrollo profesional"
      ],
      color: "#6B0F0F",
      popular: true
    }
  ];

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Verificar si viene de un registro nuevo como tutor
        if (isNewTutor) {
          const registeredUserRole = localStorage.getItem('registered_user_role');
          if (registeredUserRole === 'tutor') {
            setIsJustRegistered(true);
          }
        }
        
        // Comprobar si hay un usuario logueado usando AuthService
        const userId = AuthService.getCurrentUserId();
        const currentUser = userId ? await AuthService.getCurrentUserProfile() : null;
        
        if (!currentUser) {
          // Si es un tutor recién registrado, mostramos la página pero con un mensaje
          if (isJustRegistered) {
            setLoading(false);
            return; // No redirigimos para mostrar los planes con un mensaje de iniciar sesión
          }
          
          // Si no es un tutor recién registrado, redirigimos al login con redirección a planes
          navigate('/login?redirectTo=plans');
          return;
        }
        
        setUser(currentUser);
        
        // Si el usuario es un estudiante, redirigir al dashboard
        if (currentUser.role === 'student') {
          navigate('/dashboard');
          return;
        }
        
        // Si el usuario ya tiene un plan activo y no es un nuevo registro,
        // mostrar un mensaje y redirigir al dashboard
        if (PlanService.hasPlan(currentUser) && !isNewTutor) {
          alert('Ya tienes un plan activo. Serás redirigido al panel de control.');
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error("Error al verificar usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [navigate, isNewTutor]);
  
  const handleSelectPlan = (planId: number) => {
    if (!user) {
      // Si es un tutor recién registrado pero no ha iniciado sesión
      navigate('/login?redirectTo=plans');
      return;
    }
    
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (user && selectedPlan) {
      // Asociar el plan al usuario
      const updatedUser = await PlanService.subscribeToPlan(user.id, selectedPlan);
      
      if (updatedUser) {
        // Actualizar el usuario en la sesión actual
        setUser(updatedUser);
        alert('¡Plan activado exitosamente! Ahora puedes comenzar a crear tutorías.');
        navigate('/dashboard');
      }
    }
    
    setShowPaymentModal(false);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#951924] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#951924] text-white">
      {/* Header */}
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">
          {isNewTutor 
            ? "¡Bienvenido! Selecciona tu plan de tutor" 
            : "Mejora tu experiencia como tutor"}
        </h1>
        <p className="max-w-2xl mx-auto text-lg">
          {isNewTutor
            ? "Para comenzar a ofrecer tutorías, necesitas seleccionar un plan que se adapte a tus necesidades."
            : "Potencia tu perfil con uno de nuestros planes premium y alcanza a más estudiantes."}
        </p>
        
        {/* Mensaje para tutores recién registrados sin sesión iniciada */}
        {isJustRegistered && !user && (
          <div className="mt-6 bg-white bg-opacity-20 max-w-xl mx-auto p-5 rounded-lg">
            <p className="font-semibold mb-3">
              ¡Un paso más! Para poder seleccionar un plan, primero necesitas iniciar sesión con tu cuenta recién creada.
            </p>
            <Button
              label="Iniciar Sesión"
              onClick={() => navigate('/login?redirectTo=plans')}
              className="bg-white text-[#951924] font-bold hover:bg-gray-200"
            />
          </div>
        )}
        
        {/* Mensaje adicional para nuevos tutores */}
        {isNewTutor && user && (
          <div className="mt-4 bg-white bg-opacity-10 max-w-xl mx-auto p-4 rounded-lg">
            <p className="font-semibold">
              Importante: Para comenzar a crear tutorías, es necesario tener un plan activo.
            </p>
          </div>
        )}
      </div>
      
      {/* Planes */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={plan.id === selectedPlan}
              onSelect={handleSelectPlan}
              buttonText={user ? "Seleccionar Plan" : "Iniciar sesión para seleccionar"}
              disabled={!user}
            />
          ))}
        </div>
      </div>
      
      {/* Modal de pago */}
      {user && (
        <PlanPaymentModal
          visible={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          planId={selectedPlan}
          userId={user.id}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PlansPage;