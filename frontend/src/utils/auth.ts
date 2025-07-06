// Authentication utility functions
// Replace these with your FastAPI integration

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;
  
  return {
    email: localStorage.getItem('userEmail') || '',
    name: localStorage.getItem('userName') || 'User'
  };
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
};

// Mock function to simulate API authentication
export const authenticateUser = async (email: string, password: string): Promise<boolean> => {
  // Replace this with your actual FastAPI authentication call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock validation
      resolve(email === 'tamer@example.com' && password === 'password');
    }, 1000);
  });
};

// Mock function to simulate user registration
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<boolean> => {
  // Replace this with your actual FastAPI registration call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock successful registration
      resolve(true);
    }, 1500);
  });
};