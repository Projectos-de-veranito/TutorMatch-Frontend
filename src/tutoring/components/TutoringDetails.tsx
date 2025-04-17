import React, { useState, useEffect } from 'react';
import { TutoringSession, TutoringReview } from '../types/Tutoring';
import { Check } from 'lucide-react';
import { Rating } from 'primereact/rating';
import ReviewList from '../components/Review/ReviewList';
import { User } from '../../user/types/User';
import { Course } from '../../course/types/Course';

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

    // Imagen por defecto
    const defaultImageUrl = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

    // Define time slots based on the format in TimeSlotSelectorBySection component
    const morningTimeSlots = ['8-9', '9-10', '10-11', '11-12'];
    const afternoonTimeSlots = ['13-14', '14-15', '15-16', '16-17'];
    const eveningTimeSlots = ['18-19', '19-20', '20-21', '21-22'];
    const allTimeSlots = [...morningTimeSlots, ...afternoonTimeSlots, ...eveningTimeSlots];

    // Days of week mapping for display
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Convertir availableTimes a un formato agrupado por día y hora
    const groupedAvailabilities: { [day: string]: string[] } = {};
    
    // Si availableTimes existe, convertirlo al formato necesario para el componente
    if (availableTimes && availableTimes.length > 0) {
        availableTimes.forEach(timeSlot => {
            const day = daysOfWeek[timeSlot.dayOfWeek];
            
            if (!groupedAvailabilities[day]) {
                groupedAvailabilities[day] = [];
            }
            
            timeSlot.availableHours.forEach(hour => {
                // Extraer solo la hora (no los minutos) para crear el formato "8-9"
                const startHour = hour.start.split(':')[0];
                const endHour = hour.end.split(':')[0];
                const timeSlotStr = `${startHour}-${endHour}`;
                
                if (!groupedAvailabilities[day].includes(timeSlotStr)) {
                    groupedAvailabilities[day].push(timeSlotStr);
                }
            });
        });
    }

    const getTutorName = () => {
        if (tutor) {
            return `${tutor.firstName} ${tutor.lastName}`;
        } else {
            return 'Unknown Tutor';
        }
    }

    const customStyles = `
    .p-rating .p-rating-item .p-rating-icon {
      color: red;
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
            <div className="w-full bg-[#252525]">
                <div className="container mx-auto px-4 py-6">
                    <div className="text-sm text-red-400 mb-4">
                        <span>{course ? `${course.semester} > ${course.name}` : 'Tutoring Session'}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-white mb-4">{description}</p>
                    <style>{customStyles}</style>
                    <span className="text-red-600 font-semibold text-lg flex items-center gap-2">
                      {averageRating || '0.0'} 
                      <Rating 
                        value={Math.round(averageRating)} 
                        readOnly
                        cancel={false}
                      />
                      <span className="text-white text-sm">({reviews.length} reviews)</span>
                    </span>               
                    <p className="text-sm text-white mt-4 mb-4">
                        Dictado por <span className="text-red-600 underline cursor-pointer">
                            {getTutorName()}
                        </span>
                    </p>
                </div>
            </div>
            <div className="w-full bg-[#303031]">
                <div className="container mx-auto py-4">
                    <div className="flex flex-col-reverse lg:flex-row gap-8 mb-8">
                        {/* Contenido principal (aprendizaje + horarios) */}
                        <div className="w-full lg:w-3/4 flex flex-col gap-6">
                            {/* Sección: What you will learn */}
                            <div className="p-6 border border-white">
                                <h2 className="text-xl font-semibold mb-6">What you will learn</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {whatTheyWillLearn?.map((item, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Sección: Horarios disponibles */}
                            <div className="p-6 border border-white">
                                <h2 className="text-xl font-semibold mb-6">Tutor available times</h2>
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
                                            {allTimeSlots.map(timeSlot => (
                                                <tr key={timeSlot}>
                                                    <td className="w-1/8 text-center p-1 text-sm text-gray-400">{timeSlot}</td>
                                                    {daysOfWeek.map(day => {
                                                        const isAvailable = groupedAvailabilities[day]?.includes(timeSlot);
                                                        return (
                                                            <td key={`${day}-${timeSlot}`} className="w-1/8 p-1">
                                                                <div
                                                                    className={`h-10 flex items-center justify-center rounded 
                                                                        ${isAvailable
                                                                            ? 'bg-green-600 text-white font-bold'
                                                                            : 'border border-white text-gray-500'
                                                                        }`}
                                                                >
                                                                    {isAvailable ? <Check /> : ''}
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
                            <div className="p-6 border border-white">
                                <h2 className="text-xl font-semibold mb-6">Student Reviews</h2>
                                {reviews && reviews.length > 0 ? (
                                    <ReviewList reviews={reviews} />
                                ) : (
                                    <p className="text-gray-400">No reviews yet. Be the first to review this tutoring session!</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar de imagen, precio y botón */}
                        <div className="w-full lg:w-1/4">
                            <div className="bg-[#252525] p-6 sticky top-6">
                                <img
                                    src={imageUrl || defaultImageUrl}
                                    alt={title}
                                    className="w-full aspect-video object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-xl font-bold mb-2">{title}</h3>
                                <p className="text-2xl font-bold text-[#f05c5c] my-3">S/. {price.toFixed(2)} </p>
                                <button className="w-full py-3 bg-[#f05c5c] text-white rounded-lg hover:bg-[#d14949] transition-all my-4">
                                    Request Tutoring
                                </button>
                                <div className="w-full text-sm text-gray-300">
                                    <p className="font-semibold text-white mb-2">This tutorial includes:</p>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>3 tutoring sessions.</li>
                                        <li>Personalized sessions.</li>
                                        <li>Tutoring modality: virtual.</li>
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