import React from 'react';
import { ClipLoader, PulseLoader, BeatLoader, CircleLoader, RingLoader } from 'react-spinners';

const LoadingSpinner = ({
  size = 'large',
  message = 'Loading...',
  fullScreen = false,
  color = '#4F46E5' // Indigo-600
}) => {
  const spinnerSizes = {
    small: 30,
    medium: 50,
    large: 70,
    xlarge: 100
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-95 z-50 backdrop-blur-sm'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Beautiful Ring Spinner */}
        <div className="mb-4">
          <RingLoader
            color={color}
            size={spinnerSizes[size]}
            speedMultiplier={1}
          />
        </div>

        {/* Loading Text */}
        {message && (
          <div className="mt-4">
            <p className="text-gray-700 font-medium text-lg mb-2">{message}</p>
            <PulseLoader color={color} size={8} speedMultiplier={0.8} />
          </div>
        )}
      </div>
    </div>
  );
};

// Inline Spinner (for buttons, smaller spaces)
export const InlineSpinner = ({ color = '#4F46E5', size = 20 }) => {
  return <ClipLoader color={color} size={size} speedMultiplier={1.2} />;
};

// Dots Spinner (for text loading)
export const DotsSpinner = ({ color = '#4F46E5', size = 10 }) => {
  return <BeatLoader color={color} size={size} speedMultiplier={1} />;
};

// Circle Spinner (alternative)
export const CircleSpinner = ({ color = '#4F46E5', size = 50 }) => {
  return <CircleLoader color={color} size={size} speedMultiplier={1} />;
};

// Loading Card (skeleton)
export const LoadingCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

// Full Page Loading Screen
export const FullPageLoader = ({ message = 'Loading your content...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <RingLoader color="#4F46E5" size={100} speedMultiplier={1} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Study Buddy</h2>
        <p className="text-gray-600 text-lg mb-4">{message}</p>
        <DotsSpinner color="#4F46E5" size={12} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
