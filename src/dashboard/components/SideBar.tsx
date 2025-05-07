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
import { SemesterService } from '../services/SemesterService';

// Iconos disponibles para asignar a los semestres
const iconOptions = [
  <Code />, 
  <Layers />, 
  <Database />, 
  <Server />, 
  <Monitor />, 
  <Smartphone />, 
  <Globe />, 
  <CheckSquare />
];

// Interfaz para semestres ya formateados
interface FormattedSemester {
  icon: React.ReactNode;
  semester: string;
  path: string;
}

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [semesters, setSemesters] = useState<FormattedSemester[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Cargar semestres desde la API
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        setLoading(true);
        const data = await SemesterService.getSemesters();
        
        if (Array.isArray(data)) {
          // Mapear los datos de la API al formato que espera el componente
          const formattedSemesters = data.map((sem, index) => {
            // Extraer el número del semestre del nombre, si existe
            const match = sem.name.match(/(\d+)/);
            const semNumber = match ? parseInt(match[1]) - 1 : index;
            
            // Seleccionar el icono adecuado, haciendo un ciclo si hay más semestres que iconos
            const iconIndex = semNumber % iconOptions.length;
            
            return {
              icon: iconOptions[iconIndex],
              semester: sem.name,
              path: `/semester/${sem.id}`
            };
          });
          
          // Ordenar por número de semestre si se puede extraer
          const sortedSemesters = formattedSemesters.sort((a, b) => {
            const numA = parseInt(a.semester.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.semester.match(/\d+/)?.[0] || '0');
            return numA - numB;
          });
          
          setSemesters(sortedSemesters);
        }
      } catch (error) {
        console.error('Error al cargar semestres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSemesters();
  }, []);

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
            {loading ? (
              // Indicador de carga simple
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : semesters.length > 0 ? (
              // Mostrar semestres si hay datos
              semesters.map((item, index) => (
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
              ))
            ) : (
              // Mensaje si no hay datos
              <div className="text-center py-2 text-gray-400">
                No hay semestres disponibles
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;