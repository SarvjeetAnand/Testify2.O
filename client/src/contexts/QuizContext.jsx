import React, { createContext, useContext, useReducer } from 'react';
import { quizService } from '../services/quizService';
import toast from 'react-hot-toast';

const QuizContext = createContext();

const initialState = {
  quizzes: [],
  currentQuiz: null,
  categories: [],
  userResults: [],
  isLoading: false,
  error: null,
  currentAttempt: null
};

const quizReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_QUIZZES':
      return { ...state, quizzes: action.payload, isLoading: false };
    case 'SET_CURRENT_QUIZ':
      return { ...state, currentQuiz: action.payload, isLoading: false };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_USER_RESULTS':
      return { ...state, userResults: action.payload };
    case 'START_QUIZ_ATTEMPT':
      return { ...state, currentAttempt: action.payload };
    case 'END_QUIZ_ATTEMPT':
      return { ...state, currentAttempt: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const QuizProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const fetchQuizzes = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await quizService.getAllQuizzes();

      if (response.success) {
        dispatch({ type: 'SET_QUIZZES', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch quizzes' });
    }
  };

  const fetchQuizById = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await quizService.getQuizById(id);

      if (response.success) {
        dispatch({ type: 'SET_CURRENT_QUIZ', payload: response.data });
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch quiz' });
      return null;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await quizService.getCategories();
      if (response.success) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchUserResults = async () => {
    try {
      const response = await quizService.getUserResults();
      if (response.success) {
        dispatch({ type: 'SET_USER_RESULTS', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch user results:', error);
    }
  };

  const submitQuizResult = async (resultData) => {
    try {
      const response = await quizService.submitResult(resultData);

      if (response.success) {
        toast.success('Quiz submitted successfully!');
        return response;
      } else {
        toast.error(response.message || 'Failed to submit quiz');
        return response;
      }
    } catch (error) {
      console.error('Submit quiz error:', error);
      toast.error('Failed to submit quiz');
      return {
        success: false,
        message: 'Failed to submit quiz'
      };
    }
  };

  const startQuizAttempt = (quiz) => {
    const attempt = {
      quizId: quiz._id,
      startTime: new Date(),
      answers: [],
      currentQuestionIndex: 0
    };
    dispatch({ type: 'START_QUIZ_ATTEMPT', payload: attempt });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchQuizzes,
    fetchQuizById,
    fetchCategories,
    fetchUserResults,
    submitQuizResult,
    startQuizAttempt,
    clearError
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};