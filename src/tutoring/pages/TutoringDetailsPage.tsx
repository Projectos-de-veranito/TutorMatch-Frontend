import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TutoringDetails from '../components/TutoringDetails';
import { TutoringSession, TutoringReview } from '../types/Tutoring';
import Navbar from '../../dashboard/components/Navbar';
import Footer from '../../public/components/Footer';
import { TutoringService } from '../services/TutoringService';
import { User } from '../../user/types/User';
import { UserService } from '../../user/services/UserService';

const TutoringDetailsPage: React.FC = () => {
  const { tutoringId } = useParams<{ tutoringId: string }>();

  const [tutoring, setTutoring] = useState<TutoringSession | null>(null);
  const [reviews, setReviews] = useState<TutoringReview[]>([]);
  const [tutor, setTutor] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tutoringId) {
          // Obtener la información de la tutoría
          const tutoringData = await TutoringService.getTutoringSession(tutoringId);
          setTutoring(tutoringData);

          // Obtener las reseñas
          const reviewsData = await TutoringService.getReviews(tutoringId);
          setReviews(reviewsData);
          
          // Obtener el tutor usando el tutorId de la tutoría
          if (tutoringData.tutorId) {
            try {
              const tutorData = await UserService.getUserById(tutoringData.tutorId);
              setTutor(tutorData);
            } catch (error) {
              console.error('Error al obtener datos del tutor:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutoringId]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!tutoring) {
    return <p>No se encontró la tutoría.</p>;
  }

  return (
    <>
      <Navbar />
      <TutoringDetails tutoring={tutoring} reviews={reviews} tutor={tutor} />
      <Footer />
    </>
  );
};

export default TutoringDetailsPage;