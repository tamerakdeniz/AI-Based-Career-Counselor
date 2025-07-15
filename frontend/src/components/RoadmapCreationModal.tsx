import { ArrowRight, Brain, Loader2, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

interface RoadmapCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roadmapId: string) => void;
}

interface FormData {
  field: string;
  description: string;
  goals: string;
}

interface FormErrors {
  field?: string;
  description?: string;
  goals?: string;
}

const RoadmapCreationModal: React.FC<RoadmapCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    field: '',
    description: '',
    goals: ''
  });
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.field.trim()) {
      newErrors.field = 'Please select or enter a field';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your career goals';
    } else if (formData.description.trim().length < 20) {
      newErrors.description =
        'Please provide more details (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldSelect = (field: string) => {
    handleInputChange('field', field);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.field.trim()) {
        setErrors({ field: 'Please select or enter a field' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (validateForm()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        '/ai/create-roadmap-conversation',
        {
          field: formData.field,
          description: formData.description,
          initial_message: formData.goals
        }
      );

      if (response.data.success) {
        onSuccess(response.data.roadmap_id);
        onClose();
        resetForm();
      } else {
        throw new Error('Failed to create roadmap');
      }
    } catch (error: any) {
      console.error('Error creating roadmap:', error);
      setErrors({
        field:
          error.response?.data?.detail ||
          'Failed to create roadmap. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ field: '', description: '', goals: '' });
    setErrors({});
    setStep(1);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
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
              <h2 className="text-xl font-bold text-gray-900">
                Create New Roadmap
              </h2>
              <p className="text-sm text-gray-500">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            title="Close modal"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map(stepNum => (
              <React.Fragment key={stepNum}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`flex-1 h-1 rounded-full ${
                      stepNum < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Field Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What field interests you?
                </h3>
                <p className="text-gray-600">
                  Choose a field you'd like to build your career in, or enter
                  your own
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {popularFields.map(field => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => handleFieldSelect(field)}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        formData.field === field
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {field}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Or enter your own field..."
                    value={formData.field}
                    onChange={e => handleInputChange('field', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                      errors.field ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.field && (
                    <p className="mt-1 text-sm text-red-600">{errors.field}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tell us about your goals
                </h3>
                <p className="text-gray-600">
                  Describe what you want to achieve in {formData.field}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career Description *
                  </label>
                  <textarea
                    placeholder="Describe your career goals, current experience, and what you'd like to achieve..."
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    rows={5}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Goals (Optional)
                  </label>
                  <textarea
                    placeholder="Any specific goals, timelines, or achievements you have in mind..."
                    value={formData.goals}
                    onChange={e => handleInputChange('goals', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to create your roadmap?
                </h3>
                <p className="text-gray-600">
                  Our AI will start a conversation to understand your background
                  and create a personalized roadmap
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Field</h4>
                  <p className="text-gray-600">{formData.field}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600">{formData.description}</p>
                </div>
                {formData.goals && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Goals</h4>
                    <p className="text-gray-600">{formData.goals}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Our AI mentor will ask you 5 key questions</li>
                  <li>
                    • Based on your answers, we'll create a personalized roadmap
                  </li>
                  <li>• You'll get step-by-step milestones with resources</li>
                  <li>• Track your progress and get ongoing AI mentorship</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={step > 1 ? handleBack : handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {step > 1 ? 'Back' : 'Cancel'}
            </button>

            <div className="flex space-x-3">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Create Roadmap</span>
                    </>
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
