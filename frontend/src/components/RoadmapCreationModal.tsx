import { ArrowRight, Brain, Loader2, Sparkles, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

interface RoadmapCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roadmapId: string) => void;
}

interface Question {
  key: string;
  text: string;
}

interface FormErrors {
  field?: string;
  [key: string]: string | undefined;
}

const RoadmapCreationModal: React.FC<RoadmapCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [field, setField] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userResponses, setUserResponses] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const popularFields = [
    'Software Development',
    'Data Science',
    'Digital Marketing',
    'Product Management',
    'UX/UI Design',
    'Business Analysis',
    'Project Management',
    'Sales',
    'Content Creation',
    'Entrepreneurship',
    'Finance',
    'Healthcare',
    'Education',
    'Other'
  ];

  useEffect(() => {
    if (step === 2 && field) {
      fetchInitialQuestions(field);
    }
  }, [step, field]);

  const fetchInitialQuestions = async (selectedField: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/ai/initial-questions/${selectedField}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching initial questions:', error);
      setErrors({ field: 'Could not load questions for this field. Please try another.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep1 = (): boolean => {
    if (!field.trim()) {
      setErrors({ field: 'Please select or enter a field' });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    questions.forEach(q => {
      if (!userResponses[q.key]?.trim()) {
        newErrors[q.key] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResponseChange = (key: string, value: string) => {
    setUserResponses(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/ai/generate-roadmap', {
        field,
        user_responses: userResponses
      });

      if (response.data.success) {
        onSuccess(response.data.roadmap_id);
        resetForm();
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to create roadmap');
      }
    } catch (error: any) {
      console.error('Error creating roadmap:', error);
      setErrors({
        field:
          error.response?.data?.detail ||
          'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setField('');
    setQuestions([]);
    setUserResponses({});
    setErrors({});
    setStep(1);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Roadmap</h2>
              <p className="text-sm text-gray-500">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={isLoading} title="Close modal" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Field Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What field interests you?</h3>
                <p className="text-gray-600">Choose a field to build your career in, or enter your own.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {popularFields.map(f => (
                  <button key={f} type="button" onClick={() => setField(f)} className={`p-3 text-left rounded-lg border-2 transition-all ${field === f ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Or enter your own field..." value={field} onChange={e => setField(e.target.value)} className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.field ? 'border-red-500' : 'border-gray-200'}`} />
              {errors.field && <p className="mt-1 text-sm text-red-600">{errors.field}</p>}
            </div>
          )}

          {/* Step 2: Dynamic Questions */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tell us about yourself</h3>
                <p className="text-gray-600">Your answers will help us tailor a roadmap for the field of {field}.</p>
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
              ) : (
                questions.map(q => (
                  <div key={q.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{q.text}</label>
                    <textarea value={userResponses[q.key] || ''} onChange={e => handleResponseChange(q.key, e.target.value)} rows={3} className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${errors[q.key] ? 'border-red-500' : 'border-gray-200'}`} />
                    {errors[q.key] && <p className="mt-1 text-sm text-red-600">{errors[q.key]}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to create your roadmap?</h3>
                <p className="text-gray-600">We will now generate a personalized roadmap based on your answers.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h4 className="font-medium text-gray-900 mb-2">Field</h4>
                <p className="text-gray-600">{field}</p>
                <h4 className="font-medium text-gray-900 mt-4 mb-2">Your Answers</h4>
                {questions.map(q => (
                  <div key={q.key}>
                    <p className="font-semibold text-sm text-gray-800">{q.text}</p>
                    <p className="text-gray-600 pl-2 border-l-2 border-gray-200">{userResponses[q.key]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button type="button" onClick={step > 1 ? handleBack : handleClose} disabled={isLoading} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              {step > 1 ? 'Back' : 'Cancel'}
            </button>
            <div className="flex space-x-3">
              {step < 3 ? (
                <button type="button" onClick={handleNext} disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /><span>Creating...</span></>
                  ) : (
                    <><Sparkles className="h-4 w-4" /><span>Create Roadmap</span></>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoadmapCreationModal;