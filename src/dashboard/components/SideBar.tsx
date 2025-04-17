import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Code, 
  Layers, 
  Database, 
  Server, 
  Monitor, 
  Smartphone, 
  Globe, 
  CheckSquare,
  Menu,
  X
} from 'lucide-react';

const semesters = [
  { icon: <Code />, semester: 'Primer Semestre', path: '/semester/1' },
  { icon: <Layers />, semester: 'Segundo Semestre', path: '/semester/2' },
  { icon: <Database />, semester: 'Tercer Semestre', path: '/semester/3' },
  { icon: <Server />, semester: 'Cuarto Semestre', path: '/semester/4' },
  { icon: <Monitor />, semester: 'Quinto Semestre', path: '/semester/5' },
  { icon: <Smartphone />, semester: 'Sexto Semestre', path: '/semester/6' },
  { icon: <Globe />, semester: 'Séptimo Semestre', path: '/semester/7' },
  { icon: <CheckSquare />, semester: 'Octavo Semestre', path: '/semester/8' },
];

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  // Detectar si estamos en móvil o escritorio
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Si cambiamos a escritorio, cerrar el sidebar móvil
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar el sidebar cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Cerrar el sidebar al hacer clic en un enlace (solo en móvil)
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón de menú móvil */}
      <button 
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="md:hidden fixed top-4 left-4 z-50 bg-dark-card rounded-full p-2 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cuando el sidebar está abierto en móvil */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${isMobile ? 'fixed left-0 top-0 h-full z-40' : 'relative'} 
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'} 
          w-64 bg-dark-card border-r border-dark-border transition-transform duration-300 ease-in-out
          ${className || ''}
        `}
      >
        <div className="p-4">
          {/* Espacio para el botón de menú en móvil */}
          {isMobile && <div className="h-12"></div>}
          
          <h2 className="text-lg font-semibold text-white mb-4">Ingeniería de Software</h2>
          <nav className="space-y-2">
            {semesters.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center p-3 rounded-md text-light-gray hover:bg-dark-light hover:text-white transition-colors"
                onClick={handleLinkClick}
              >
                <div className="mr-3 text-primary">{item.icon}</div>
                <div>
                  <div className="font-medium">{item.semester}</div>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;