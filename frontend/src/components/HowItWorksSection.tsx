import React from 'react';
import { UserPlus, MapPin, TrendingUp, Award } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Tell us about your background, goals, and interests. Our AI analyzes your profile to understand your unique career journey.',
      step: '01'
    },
    {
      icon: MapPin,
      title: 'Get Your Roadmap',
      description: 'Receive a personalized career roadmap with clear milestones, skill requirements, and learning resources tailored to your goals.',
      step: '02'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Follow your roadmap, complete milestones, and track your skill development with our intelligent progress monitoring system.',
      step: '03'
    },
    {
      icon: Award,
      title: 'Achieve Success',
      description: 'Reach your career goals faster with continuous AI mentoring, feedback, and adaptive recommendations along the way.',
      step: '04'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pathyvo
            </span>{' '}
            Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our simple 4-step process helps you create a clear path to your dream career
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform translate-x-4 z-0"></div>
              )}
              
              <div className="relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                {/* Step number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">5 min</div>
            <div className="text-gray-600">Average setup time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">3x</div>
            <div className="text-gray-600">Faster career progression</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
            <div className="text-gray-600">User satisfaction rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;