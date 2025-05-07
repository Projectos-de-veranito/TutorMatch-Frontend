import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TutoringDetails from '../components/TutoringDetails';
import { TutoringSession, TutoringReview } from '../types/Tutoring';
import Navbar from '../../dashboard/components/Navbar';
import Footer from '../../public/components/Footer';
import { TutoringService } from '../services/TutoringService';
import { User } from '../../user/types/User';
import { UserService } from '../../user/services/UserService';
import { CourseService } from '../../course/services/CourseService';
import { Course } from '../../course/types/Course';
import { ProgressSpinner } from 'primereact/progressspinner';

const TutoringDetailsPage: React.FC = () => {
  const { tutoringId } = useParams<{ tutoringId: string }>();

  const [tutoring, setTutoring] = useState<TutoringSession | null>(null);
  const [reviews, setReviews] = useState<TutoringReview[]>([]);
  const [tutor, setTutor] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!tutoringId) {
          setError('ID de tutoría no proporcionado');
          return;
        }

        // Obtener la información de la tutoría
        const tutoringData = await TutoringService.getTutoringSession(tutoringId);
        setTutoring(tutoringData);

        // Obtener las reseñas
        const reviewsData = await TutoringService.getReviews(tutoringId);
        setReviews(reviewsData);
        
        // Cargas en paralelo para mejor rendimiento
        const promises = [];
        
        // Obtener el tutor
        if (tutoringData.tutorId) {
          promises.push(
            UserService.getUserById(tutoringData.tutorId.toString())
              .then(tutorData => setTutor(tutorData))
              .catch(error => {
                console.error('Error al obtener datos del tutor:', error);
                return null;
              })
          );
        }
        
        // Obtener el curso
        if (tutoringData.courseId) {
          promises.push(
            CourseService.getCourseById(tutoringData.courseId.toString())
              .then(courseData => setCourse(courseData))
              .catch(error => {
                console.error('Error al obtener datos del curso:', error);
                return null;
              })
          );
        }
        
        // Esperar a que todas las promesas se resuelvan
        await Promise.all(promises);
        
      } catch (error: any) {
        console.error('Error al cargar los datos:', error);
        setError(error.message || 'Error al cargar los detalles de la tutoría');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutoringId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e]">
        <div className="text-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} 
                           strokeWidth="4" 
                           fill="#1e1e1e" 
                           animationDuration=".5s" />
          <p className="text-white mt-4">Cargando detalles de la tutoría...</p>
        </div>
      </div>
    );
  }

  if (error || !tutoring) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e]">
        <div className="text-center p-6 bg-[#252525] rounded-lg border border-red-500">
          <h2 className="text-xl text-red-500 mb-4">Error</h2>
          <p className="text-white">{error || 'No se encontró la tutoría solicitada'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <TutoringDetails 
        tutoring={tutoring} 
        reviews={reviews} 
        tutor={tutor || undefined} 
        course={course || undefined} 
      />
      <Footer />
    </>
  );
};

export default TutoringDetailsPage;