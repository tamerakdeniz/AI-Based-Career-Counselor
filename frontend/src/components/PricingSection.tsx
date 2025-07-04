import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Zap, Crown } from 'lucide-react';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Pay as You Go',
      price: '$9',
      period: 'per session',
      description: 'Perfect for trying out our AI mentoring',
      features: [
        'Single AI mentoring session',
        'Basic career assessment',
        'Skill gap analysis',
        'Resource recommendations',
        '24/7 chat support'
      ],
      icon: Zap,
      popular: false,
      cta: 'Start Single Session'
    },
    {
      name: 'Standard Membership',
      price: '$29',
      period: 'per month',
      description: 'Complete career transformation package',
      features: [
        'Unlimited AI mentoring sessions',
        'Personalized career roadmap',
        'Progress tracking & analytics',
        'Weekly goal setting',
        'Community access',
        'Priority support',
        'Mobile app access',
        'Certificate of completion'
      ],
      icon: Star,
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Premium',
      price: '$79',
      period: 'per month',
      description: 'For serious career accelerators',
      features: [
        'Everything in Standard',
        '1-on-1 human mentor sessions',
        'Industry expert connections',
        'Resume & LinkedIn optimization',
        'Interview preparation',
        'Salary negotiation guidance',
        'Job placement assistance',
        'Custom learning paths'
      ],
      icon: Crown,
      popular: false,
      cta: 'Go Premium'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Growth Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start your career transformation today with flexible pricing options that fit your needs
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200'
                  }`}>
                    <plan.icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Link
                  to="/dashboard"
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 block ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Secure payments</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;