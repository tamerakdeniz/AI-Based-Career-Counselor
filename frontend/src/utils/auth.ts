import axiosInstance from '../api/axiosInstance.ts';

// Authentication utility functions

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;
  
  return {
    id: localStorage.getItem('userId') || '',
    email: localStorage.getItem('userEmail') || '',
    name: localStorage.getItem('userName') || 'User'
  };
};

export const logout = (): void => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
};

// Real API authentication function
export const authenticateUser = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password
    });
    
    const { access_token, user_id, user_email, user_name } = response.data;
    
    // Store authentication data
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('userEmail', user_email);
    localStorage.setItem('userName', user_name);
    localStorage.setItem('userId', user_id.toString());
    
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};

// Real API registration function
export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<boolean> => {
  try {
    await axiosInstance.post('/users/', userData);
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

// Get current user from API
export const getCurrentUserFromAPI = async () => {
  try {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};