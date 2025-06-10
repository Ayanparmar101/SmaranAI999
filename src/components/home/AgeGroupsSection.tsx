
import React from 'react';

const AgeGroupsSection = () => {
  const ageGroups = [
    {
      grade: '1-2',
      title: 'Early Learners',
      color: 'bg-kid-green'
    }, 
    {
      grade: '3-4',
      title: 'Building Skills',
      color: 'bg-kid-blue'
    }, 
    {
      grade: '5-6',
      title: 'Growing Confident',
      color: 'bg-kid-purple'
    }, 
    {
      grade: '7-8',
      title: 'Advanced English',
      color: 'bg-kid-red'
    }
  ];

  return (
    <section className="px-0 py-8 sm:py-10 md:py-[40px]">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">For All Age Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 justify-items-center">
          {ageGroups.map((group, index) => (
            <div key={index} className="card-doodle transition-all duration-300 hover:scale-105 text-center">
              <div className={`${group.color} text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full w-fit mb-3 sm:mb-4 mx-auto`}>
                Grades {group.grade}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{group.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Lessons and activities specifically designed for this age group's learning needs.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgeGroupsSection;
