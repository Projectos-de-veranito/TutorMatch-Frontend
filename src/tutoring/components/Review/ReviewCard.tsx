import { Card } from 'primereact/card';
import { Rating } from 'primereact/rating';
import { TutoringReview } from '../../types/Tutoring';
import { useState } from 'react';
import { Heart } from 'lucide-react';

interface ReviewCardProps {
  review: TutoringReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [likes, setLikes] = useState<number>(review.likes || 0);
  const [liked, setLiked] = useState<boolean>(false);

  const handleLike = () => {
    if (!liked) {
      setLikes(likes + 1);
      setLiked(true);
    } else {
      setLikes(likes - 1);
      setLiked(false);
    }
  };

  const formatDate = (date: string | Date) => {
    // Convertir la cadena a un objeto Date si es necesario
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return parsedDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const StudentAvatar = () => (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
      {review.studentId.toString().charAt(0).toUpperCase()}
    </div>
  );

  const header = (
    <div className="flex items-center gap-4 p-4 border-b dark:border-gray-700">
      <StudentAvatar />
      <div>
        <h3 className="text-lg font-semibold dark:text-white">
          Estudiante #{review.studentId}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(review.createdAt)}</p>
      </div>
    </div>
  );

  const RatingDisplay = () => (
    <div className="flex items-center gap-2">
      <Rating value={review.rating} readOnly stars={5} cancel={false} />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{review.rating}/5</span>
    </div>
  );

  return (
    <Card className="shadow-lg overflow-hidden transition-all hover:shadow-xl bg-[#252525] rounded-lg" header={header}>
      <div className="flex flex-col gap-4">
        <RatingDisplay />

        {/* Comentario */}
        <div className="p-4 rounded-lg bg-[#1f1f1f]">
          <p className="dark:text-gray-300 text-base leading-relaxed">{review.comment || 'Sin comentarios adicionales.'}</p>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-all ${
              liked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={liked ? 'No me gusta' : 'Me gusta'} // Texto de hover dinámico
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            {liked ? 'Te gusta' : 'Me gusta'}
          </button>
          <span className="text-sm text-gray-400">{likes} {likes === 1 ? 'like' : 'likes'}</span>
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;