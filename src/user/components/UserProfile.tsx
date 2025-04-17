import React from 'react';
import { User } from '../types/User';

interface UserProfileProps {
  user: Pick<User, 'fullName' | 'semesterNumber' | 'academicYear' | 'avatar'>;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  // Using destructuring with the properties from our User type
  const { fullName, semesterNumber, academicYear, avatar } = user;
  
  // Get first letter of name for avatar placeholder
  const avatarInitial = fullName?.charAt(0) || 'U';
  
  return (
    <section className="mb-8">
      <div className="bg-dark-card rounded-lg p-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center mr-4">
            {avatar ? (
              <img 
                src={avatar} 
                alt={fullName} 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl">{avatarInitial}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">Hello, {fullName}!</h2>
            <div className="flex items-center text-light-gray">
              <span>{semesterNumber}° Semestre · {academicYear}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;