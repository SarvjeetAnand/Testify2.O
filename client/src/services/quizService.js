import api from './api';

class QuizService {
  async getAllQuizzes() {
    try {
      const response = await api.get('/quiz');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quizzes'
      };
    }
  }

  async getQuizById(id) {
    try {
      const response = await api.get(`/quiz/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quiz'
      };
    }
  }

  async createQuiz(quizData) {
    try {
      const response = await api.post('/quiz', quizData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create quiz'
      };
    }
  }

  async updateQuiz(id, quizData) {
    try {
      const response = await api.put(`/quiz/${id}`, quizData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update quiz'
      };
    }
  }

  async deleteQuiz(id) {
    try {
      const response = await api.delete(`/quiz/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete quiz'
      };
    }
  }

  async getCategories() {
    try {
      const response = await api.get('/category');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories'
      };
    }
  }

  async getUserResults() {
    try {
      const response = await api.get('/result/user');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch results'
      };
    }
  }

  async submitResult(resultData) {
    const token = localStorage.getItem('token');
    
    try {
      const response = await api.post('/result', {
        quizId: resultData.quizId,
        answers: resultData.answers,
        timeTaken: resultData.timeTaken
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': `${token}`,
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Submit result error:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit result'
      };
    }
  }

  async getResultById(id) {
  try {
    const response = await api.get(`/result/${id}`);
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch result'
      };
    }
  } catch (error) {
    console.error('Get result error:', error.response || error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch result'
    };
  }
}
}

export const quizService = new QuizService();