import React, { useRef, useState, useEffect } from 'react';
import { TutoringSession } from '../types/Tutoring';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TutoringCard from './TutoringCard';

interface TutoringRecommendationsProps {
  tutorings: TutoringSession[];
  onTutoringClick?: (tutoringId: string | number) => void;
}

const TutoringRecommendations: React.FC<TutoringRecommendationsProps> = ({ 
  tutorings, 
  onTutoringClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ , setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Comprobar inicialmente
    checkScreenSize();
    
    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Actualizar visibilidad de flechas según la posición de scroll
  useEffect(() => {
    if (!containerRef.current) return;
    
    const checkScrollPosition = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Solo actualizamos estas variables si no es un contenedor con pocas tarjetas
      if (tutorings.length > 3) {
        setShowLeftArrow(container.scrollLeft > 20);
        setShowRightArrow(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 20
        );
      } else {
        // Si hay pocas tarjetas, aseguramos que las flechas estén visibles
        setShowLeftArrow(true);
        setShowRightArrow(true);
      }
    };
    
    // Comprobar inicialmente
    checkScrollPosition();
    
    // Añadir evento de scroll
    const container = containerRef.current;
    container.addEventListener('scroll', checkScrollPosition);
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [tutorings]);
  
  const scrollLeft = () => {
    if (containerRef.current) {
      const scrollAmount = isMobile ? -150 : -210;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (containerRef.current) {
      const scrollAmount = isMobile ? 150 : 210;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  if (!tutorings || tutorings.length === 0) {
    return null;
  }
  
  // Determinamos si hay pocas tarjetas para centrarlas
  const fewCards = tutorings.length <= 3;
  
  return (
    <div className="w-full mb-8 relative">
      {/* Contenedor principal con posición relativa para posicionar las flechas absolutamente */}
      <div 
        className="relative"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Flechas de navegación - siempre visibles en desktop/tablet, pero adaptables al scroll */}
        {!isMobile && (
          <>
            <button 
              onClick={scrollLeft}
              className={`hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary shadow-lg hover:bg-primary-hover text-white items-center justify-center ${!showLeftArrow && !fewCards ? 'opacity-50' : ''}`}
              aria-label="Desplazar a la izquierda"
              disabled={!showLeftArrow && !fewCards}
            >
              <ChevronLeft size={24} />
            </button>
          
            <button 
              onClick={scrollRight}
              className={`hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-primary shadow-lg hover:bg-primary-hover text-white items-center justify-center ${!showRightArrow && !fewCards ? 'opacity-50' : ''}`}
              aria-label="Desplazar a la derecha"
              disabled={!showRightArrow && !fewCards}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Contenedor de las tarjetas */}
        <div 
          ref={containerRef}
          className={`
            flex overflow-x-auto scroll-smooth hide-scrollbar
            ${fewCards ? 'justify-center' : ''}
            gap-2 sm:gap-4 pb-4 px-2 sm:px-8 py-2
          `}
        >
          {tutorings.map((tutoring) => (
            <div 
              key={tutoring.id} 
              className="flex-shrink-0 w-64 sm:w-72 md:w-80 max-w-full"
            >
              <TutoringCard 
                tutoring={tutoring} 
                onClick={onTutoringClick} 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Indicadores de paginación para móviles */}
      {isMobile && !fewCards && (
        <div className="flex justify-center mt-4 space-x-1">
          <span className="text-xs text-light-gray">
            Desliza para ver más
          </span>
        </div>
      )}
      
      {/* Estilos para ocultar la barra de desplazamiento pero mantener la funcionalidad */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default TutoringRecommendations;