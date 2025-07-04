import React from 'react';
import { MapPin, TrendingUp, Bot, Target, Users, Zap } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Personalized Career Roadmaps',
      description: 'Get custom-tailored learning paths based on your goals, experience, and industry trends.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking & Analytics',
      description: 'Monitor your skill development with detailed analytics and milestone achievements.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Bot,
      title: 'AI-Powered Mentoring',
      description: 'Receive intelligent feedback, recommendations, and coaching from our advanced AI mentor.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Target,
      title: 'Goal-Oriented Learning',
      description: 'Set clear objectives and follow structured paths to achieve your career aspirations.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with like-minded professionals and share experiences in your field.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Zap,
      title: 'Real-Time Recommendations',
      description: 'Get instant suggestions for courses, skills, and opportunities based on market demands.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pathyvo combines cutting-edge AI technology with proven career development strategies 
            to accelerate your professional growth.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>Start building your career roadmap in under 5 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;