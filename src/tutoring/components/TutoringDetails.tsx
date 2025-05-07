import React, { useState, useEffect } from 'react';
import { TutoringSession, TutoringReview } from '../types/Tutoring';
import { Check, Users, Monitor } from 'lucide-react';
import { Rating } from 'primereact/rating';
import ReviewList from './Review/ReviewList';
import { User } from '../../user/types/User';
import { Course } from '../../course/types/Course';
import { Link } from 'react-router-dom';
import Avatar from '../../user/components/Avatar';

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
    const { title, description, price, whatTheyWillLearn, imageUrl, availableTimes } = tutoring;
    const [averageRating, setAverageRating] = useState<number>(0);

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
        console.log('Procesando horarios disponibles:', availableTimes);

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

                console.log(`Procesando horario: día ${day}, hora ${startHour}-${adjustedEndHour}`);

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

        console.log('Horarios agrupados por día:', groupedAvailabilities);
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
            <style>{customStyles}</style>

            {/* Header con información básica */}
            <div className="w-full bg-[#252525]">
                <div className="container mx-auto px-4 py-6">
                    <div className="text-sm text-red-400 mb-4">
                        <span>
                            {course
                                ? `${course.semesterNumber}° Semestre > ${course.name}`
                                : 'Tutoría'}
                        </span>
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
                                <button className="w-full py-3 bg-[#f05c5c] text-white rounded-lg hover:bg-[#d14949] transition-all my-4">
                                    Solicitar Tutoría
                                </button>
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