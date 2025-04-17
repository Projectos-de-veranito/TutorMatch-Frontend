import React from 'react';
import { Course } from '../types/Course';

interface CourseCardProps {
  course: Course;
  onClick?: (courseId: number) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const { id, name, semester } = course;
  
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };
  return (
    <div 
      className="bg-dark-card rounded-lg overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="text-xs text-light-gray mb-1">Semestre {semester}</div>
        <h3 className="text-white font-medium text-lg mb-2 line-clamp-2">{name}</h3>
      </div>
    </div>
  );
};

export default CourseCard;