import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: 'Pathyvo transformed my career completely. The AI mentor guided me through every step of transitioning from marketing to software development. I landed my dream job at Google in just 8 months!',
      rating: 5,
      field: 'Career Transition'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'UX Designer at Airbnb',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: 'The personalized roadmap was exactly what I needed. Instead of feeling overwhelmed by all the design resources online, Pathyvo gave me a clear, step-by-step path to becoming a UX designer.',
      rating: 5,
      field: 'Design'
    },
    {
      name: 'Emily Johnson',
      role: 'Data Scientist at Netflix',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: 'The AI mentoring feature is incredible. It felt like having a personal career coach available 24/7. The recommendations were always spot-on and helped me stay motivated throughout my journey.',
      rating: 5,
      field: 'Data Science'
    },
    {
      name: 'David Kim',
      role: 'Product Manager at Spotify',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      content: 'Pathyvo helped me transition from engineering to product management seamlessly. The roadmap included not just technical skills but also soft skills and networking strategies.',
      rating: 5,
      field: 'Product Management'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Success Stories from{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real People
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who have transformed their careers with Pathyvo
          </p>
        </div>

        {/* Testimonial carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Quote icon */}
            <div className="absolute top-6 right-6 opacity-10">
              <Quote className="h-16 w-16 text-blue-600" />
            </div>

            {/* Testimonial content */}
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </p>
                  <div className="flex items-center mt-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {testimonials[currentTestimonial].field}
                    </span>
                  </div>
                </div>
              </div>

              <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow text-gray-600 hover:text-blue-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow text-gray-600 hover:text-blue-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
            <div className="text-gray-600">Career transformations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-gray-600">Average rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">85%</div>
            <div className="text-gray-600">Get promoted within 1 year</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">3x</div>
            <div className="text-gray-600">Faster skill development</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;