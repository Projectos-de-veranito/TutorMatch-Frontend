import React, { useState, useEffect, useRef } from 'react';
import { TutoringSession, TutoringReview } from '../types/Tutoring';
import { Check, Users, Monitor, Edit } from 'lucide-react';
import { Rating } from 'primereact/rating';
import ReviewList from './Review/ReviewList';
import { User } from '../../user/types/User';
import { Course } from '../../course/types/Course';
import { Link } from 'react-router-dom';
import Avatar from '../../user/components/Avatar';

//
import DeleteTutoringModal from '../../dashboard/components/DeleteTutoringModal';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Trash } from 'lucide-react';
import { TutoringService } from '../services/TutoringService';
import EditTutoringModal from '../../dashboard/components/EditTutoringModal';

interface TutoringDetailsProps {
    tutoring: TutoringSession;
    reviews: TutoringReview[];
    tutor?: User;
    course?: Course;
}

const TutoringDetails: React.FC<TutoringDetailsProps> = ({
    tutoring,
    reviews,
    tutor,
    course
}) => {
    const { title, description, price, whatTheyWillLearn, imageUrl, availableTimes, tutorId } = tutoring;
    const [averageRating, setAverageRating] = useState<number>(0);
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

    useEffect(() => {
        const checkOwnership = () => {
            try {
                // Obtener el ID del usuario actual del localStorage
                const currentUserId = localStorage.getItem('currentUserId');

                // Verificar si hay un ID de usuario en localStorage y si el usuario está autenticado
                if (currentUserId) {

                    // Verificar si el ID del usuario coincide con el ID del tutor de la tutoría
                    // Usar tutorId directamente de la tutoría o del objeto tutor si está disponible
                    const tutorIdToCheck = tutorId || (tutor?.id);

                    if (tutorIdToCheck && currentUserId === tutorIdToCheck) {
                        setIsOwner(true);
                    } else {
                        setIsOwner(false);
                    }
                } else {
                    setIsOwner(false);
                }
            } catch (error) {
                console.error('Error al verificar propiedad de la tutoría:', error);
                setIsOwner(false);
            }
        };

        // Ejecutar la verificación inmediatamente
        checkOwnership();

        // Opcional: Configurar un intervalo para verificar periódicamente si el usuario cambió
        // Esto puede ser útil si el componente permanece montado por mucho tiempo
        const intervalId = setInterval(checkOwnership, 30000); // Verificar cada 30 segundos

        // Limpiar el intervalo al desmontar el componente
        return () => clearInterval(intervalId);
    }, [tutorId, tutor]);


    const handleDeleteTutoring = async () => {
        try {
            await TutoringService.deleteTutoring(tutoring.id);

            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'La tutoría ha sido eliminada correctamente',
                life: 3000
            });

            // Redirigir a la página de dashboard después de eliminar
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error al eliminar la tutoría:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar la tutoría',
                life: 3000
            });
        }
    };

    const handleUpdateTutoring = () => {

        window.location.reload();

        toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tutoría actualizada correctamente',
            life: 3000
        });
    };

    // Calculate average rating from reviews
    useEffect(() => {
        if (reviews && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(parseFloat((totalRating / reviews.length).toFixed(1)));
        }
    }, [reviews]);

    // Imagen por defecto para la tutoría
    const defaultImageUrl = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

    // Define time slots based on the format in the database
    const timeSlots = [];
    // Generar slots de 8 a 22h
    for (let hour = 8; hour < 22; hour++) {
        timeSlots.push(`${hour}-${hour + 1}`);
    }

    // Días de la semana en español para mejor legibilidad
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Agrupar disponibilidades por día para la visualización
    const groupedAvailabilities: { [day: string]: string[] } = {};

    // Inicializar todos los días para evitar problemas con días sin horarios
    daysOfWeek.forEach(day => {
        groupedAvailabilities[day] = [];
    });

    if (availableTimes && availableTimes.length > 0) {

        availableTimes.forEach(timeSlot => {
            try {
                // Obtener el índice del día con soporte para ambos formatos
                let dayIndex = -1;

                if (typeof timeSlot.day_of_week === 'number' && !isNaN(timeSlot.day_of_week)) {
                    dayIndex = timeSlot.day_of_week;
                } else if (typeof timeSlot.dayOfWeek === 'number' && !isNaN(timeSlot.dayOfWeek)) {
                    dayIndex = timeSlot.dayOfWeek;
                } else if (typeof timeSlot.day_of_week === 'string') {
                    dayIndex = parseInt(timeSlot.day_of_week, 10);
                } else if (typeof timeSlot.dayOfWeek === 'string') {
                    dayIndex = parseInt(timeSlot.dayOfWeek, 10);
                }

                // Verificar índice válido
                if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
                    console.warn('Índice de día inválido:', dayIndex, timeSlot);
                    return; // Saltar este horario
                }

                const day = daysOfWeek[dayIndex];

                // Extraer horas de inicio y fin con soporte para ambos formatos
                let startTime = timeSlot.start_time || timeSlot.startTime || '';
                let endTime = timeSlot.end_time || timeSlot.endTime || '';

                if (!startTime || !endTime) {
                    console.warn('Horario sin tiempo de inicio o fin:', timeSlot);
                    return; // Saltar este horario
                }

                // Limpiar el formato de los tiempos (remover segundos)
                if (startTime.includes(':')) {
                    // Divide por ":" y toma solo horas y minutos
                    const [startHours, startMinutes] = startTime.split(':');
                    startTime = `${startHours}:${startMinutes}`;
                }

                if (endTime.includes(':')) {
                    const [endHours, endMinutes] = endTime.split(':');
                    endTime = `${endHours}:${endMinutes}`;
                }

                // Extraer solo las horas para el formato de los slots de tiempo
                const startHour = parseInt(startTime.split(':')[0], 10);
                const endHour = parseInt(endTime.split(':')[0], 10);

                // Si hay minutos en el tiempo final, redondear hacia arriba
                const endMinutes = endTime.split(':')[1] ? parseInt(endTime.split(':')[1], 10) : 0;
                const adjustedEndHour = endMinutes > 0 ? endHour + 1 : endHour;

                // Crear slots para cada hora del rango
                for (let hour = startHour; hour < adjustedEndHour; hour++) {
                    const timeSlotStr = `${hour}-${hour + 1}`;
                    if (!groupedAvailabilities[day].includes(timeSlotStr)) {
                        groupedAvailabilities[day].push(timeSlotStr);
                    }
                }
            } catch (error) {
                console.error('Error al procesar horario:', error, timeSlot);
            }
        });
    } else {
        console.warn('No hay horarios disponibles o el formato no es válido:', availableTimes);
    }

    // Obtener el nombre completo del tutor
    const getTutorName = () => {
        if (tutor) {
            return `${tutor.firstName} ${tutor.lastName}`;
        } else {
            return 'Tutor no disponible';
        }
    }

    // Convertir el array de "whatTheyWillLearn" a formato adecuado
    const learningPoints = Array.isArray(whatTheyWillLearn)
        ? whatTheyWillLearn
        : typeof whatTheyWillLearn === 'object' && whatTheyWillLearn !== null
            ? Object.values(whatTheyWillLearn)
            : [];

    const customStyles = `
    .p-rating .p-rating-item .p-rating-icon {
      color: #f05c5c;
    }
    
    .p-rating .p-rating-item:not(.p-rating-item-active) .p-rating-icon {
      color: rgba(240, 92, 92, 0.4);
    }
    
    .p-rating:not(.p-disabled):not(.p-readonly) .p-rating-item:hover .p-rating-icon {
      color: #d14949;
    }
  `;

    return (
        <div className="text-white w-full bg-[#1e1e1e] min-h-screen">
            <Toast ref={toast} />

            <DeleteTutoringModal
                visible={deleteModalVisible}
                onHide={() => setDeleteModalVisible(false)}
                onDelete={handleDeleteTutoring}
                tutoring={tutoring}
            />
            {isOwner && (
                <EditTutoringModal
                    visible={editModalVisible}
                    onHide={() => setEditModalVisible(false)}
                    onSave={handleUpdateTutoring}
                    currentUser={tutor as User}
                    tutoring={tutoring}
                />
            )}
            <style>{customStyles}</style>

            {/* Header con información básica */}
            <div className="w-full bg-[#252525]">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex gap-2 mb-4">
                        {course && (
                            <>
                                <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded-full text-xs font-medium">
                                    {course.semesterNumber}° Semestre
                                </span>
                                <span className="px-2 py-1 bg-green-600/20 text-green-500 rounded-full text-xs font-medium">
                                    {course.name}
                                </span>
                            </>
                        )}
                        {!course && (
                            <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs font-medium">
                                Tutoría
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-white mb-4">{description}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-red-600 font-semibold text-lg">
                            {averageRating.toFixed(1)}
                        </span>
                        <Rating
                            value={Math.round(averageRating)}
                            readOnly
                            cancel={false}
                        />
                        <span className="text-white text-sm">({reviews.length} reseñas)</span>
                    </div>

                    <div className="flex items-center gap-3 mt-4 mb-4">
                        {tutor && (
                            <>
                                <div className="flex items-center">
                                    <Avatar user={tutor} size="sm" className="mr-2" />
                                    <Link to={`/profile/${tutor.id}`} className="text-red-600 hover:underline">
                                        {getTutorName()}
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="w-full bg-[#303031]">
                <div className="container mx-auto py-4 px-4">
                    <div className="flex flex-col-reverse lg:flex-row gap-8 mb-8">
                        {/* Contenido izquierdo (aprendizaje + horarios + reseñas) */}
                        <div className="w-full lg:w-3/4 flex flex-col gap-6">
                            {/* Sección: What you will learn */}
                            <div className="p-6 border border-[#4a4a4a] rounded-lg bg-[#252525]">
                                <h2 className="text-xl font-semibold mb-6">Lo que aprenderás</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {learningPoints.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">
                                                <Check size={18} />
                                            </span>
                                            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Sección: Horarios disponibles */}
                            <div className="p-6 border border-[#4a4a4a] rounded-lg bg-[#252525]">
                                <h2 className="text-xl font-semibold mb-6">Horarios disponibles del tutor</h2>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse min-w-[600px] table-fixed">
                                        <thead>
                                            <tr>
                                                <th className="w-1/8 p-2"></th>
                                                {daysOfWeek.map(day => (
                                                    <th key={day} className="w-1/8 text-center p-2 text-sm text-white uppercase font-bold">
                                                        {day.slice(0, 3)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timeSlots.map(timeSlot => (
                                                <tr key={timeSlot}>
                                                    <td className="w-1/8 text-center p-1 text-sm text-gray-400">{timeSlot}h</td>
                                                    {daysOfWeek.map(day => {
                                                        const isAvailable = groupedAvailabilities[day]?.includes(timeSlot);
                                                        return (
                                                            <td key={`${day}-${timeSlot}`} className="w-1/8 p-1">
                                                                <div
                                                                    className={`h-10 flex items-center justify-center rounded 
                                                                    ${isAvailable
                                                                            ? 'bg-green-600 text-white font-bold'
                                                                            : 'border border-[#4a4a4a] text-gray-500'
                                                                        }`}
                                                                >
                                                                    {isAvailable ? <Check size={16} /> : ''}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Sección: Reseñas */}
                            <div className="p-6 border border-[#4a4a4a] rounded-lg bg-[#252525]">
                                <h2 className="text-xl font-semibold mb-6">Reseñas de estudiantes</h2>
                                {reviews && reviews.length > 0 ? (
                                    <ReviewList reviews={reviews} />
                                ) : (
                                    <p className="text-gray-400">Aún no hay reseñas. ¡Sé el primero en dejar una reseña!</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar de imagen, precio y botón */}
                        <div className="w-full lg:w-1/4">
                            <div className="bg-[#252525] p-6 sticky top-6 rounded-lg border border-[#4a4a4a]">
                                <img
                                    src={imageUrl || defaultImageUrl}
                                    alt={title}
                                    className="w-full aspect-video object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-xl font-bold mb-2">{title}</h3>
                                <p className="text-2xl font-bold text-[#f05c5c] my-3">S/. {price.toFixed(2)} </p>
                                {/* Cambiar entre "Solicitar Tutoría" y "Editar Tutoría" según isOwner */}
                                {isOwner ? (
                                    <button
                                        onClick={() => setEditModalVisible(true)}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all my-4 flex items-center justify-center gap-2"
                                    >
                                        <Edit size={18} />
                                        <span>Editar Tutoría</span>
                                    </button>
                                ) : (
                                    <button className="w-full py-3 bg-[#f05c5c] text-white rounded-lg hover:bg-[#d14949] transition-all my-4">
                                        Solicitar Tutoría
                                    </button>
                                )}
                                {/* Opción alternativa: Mostrar el botón de eliminar debajo del botón de solicitar */}
                                {isOwner && (
                                    <button
                                        onClick={() => setDeleteModalVisible(true)}
                                        className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all mb-4 flex items-center justify-center gap-2"
                                    >
                                        <Trash size={18} />
                                        <span>Eliminar tutoría</span>
                                    </button>
                                )}

                                <div className="w-full text-sm text-gray-300">
                                    <p className="font-semibold text-white mb-2">Esta tutoría incluye:</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <Users size={16} className="text-[#f05c5c]" />
                                            <span>Sesiones personalizadas</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Monitor size={16} className="text-[#f05c5c]" />
                                            <span>Modalidad: 100% virtual</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutoringDetails;