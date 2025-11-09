import api from './api';

class AdminService {
  async getDashboardData() {
    try {
      const response = await api.get('/admin/dashboard');
      return {
        success: true,
        data: response.data.data // Make sure we're accessing the correct data path
      };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dashboard data'
      };
    }
  }

  async createQuiz(quizData) {
    try {
      const response = await api.post('/quiz', quizData);
      return { success: true, data: response.data };
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
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update quiz' };
    }
  }

  async deleteQuiz(id) {
    try {
      const response = await api.delete(`/quiz/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete quiz' };
    }
  }

  async getQuizAnalytics(id) {
    try {
      const response = await api.get(`/admin/quiz/${id}/analytics`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch analytics' };
    }
  }

  async getAnalytics(timeRange = 'month') {
    try {
      const response = await api.get('/admin/analytics', {
        params: { timeRange }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch analytics'
      };
    }
  }

  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch users' };
    }
  }

  async getUserById(id) {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch user' };
    }
  }

  async updateUserStatus(id, isActive) {
    try {
      const response = await api.put(`/admin/users/${id}/status`, { isActive });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update user status' };
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
    }
  }

  async previewQuestionsFromPDF(file) {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await api.post('/questions/preview-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to preview PDF' };
    }
  }

  async uploadQuestionsFromPDF(file, quizId) {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('quizId', quizId);

      const response = await api.post('/questions/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to upload questions' };
    }
  }

  async createQuestion(questionData) {
    try {
      const response = await api.post('/questions', questionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create question' };
    }
  }

  async updateQuestion(id, questionData) {
    try {
      const response = await api.put(`/questions/${id}`, questionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update question' };
    }
  }

  async deleteQuestion(id) {
    try {
      const response = await api.delete(`/questions/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete question' };
    }
  }

  async getQuestionsByQuiz(quizId) {
    try {
      const response = await api.get(`/questions/quiz/${quizId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch questions' };
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.post('/category', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create category' };
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/category/${id}`, categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update category' };
    }
  }

  async deleteCategory(id) {
    try {
      const response = await api.delete(`/category/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete category' };
    }
  }

  async getAllCategories() {
    try {
      const response = await api.get('/category');
      return response.data; // Return the data directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  // Coding Problems
  async getAllCodingProblems(params = {}) {
    try {
      const response = await api.get('/admin/coding-problems', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch coding problems' };
    }
  }

  async getCodingProblemById(id) {
    try {
      const response = await api.get(`/admin/coding-problems/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch coding problem' };
    }
  }

  async createCodingProblem(problemData) {
    try {
      const response = await api.post('/admin/coding-problems', problemData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to create coding problem' };
    }
  }

  async updateCodingProblem(id, problemData) {
    try {
      const response = await api.put(`/admin/coding-problems/${id}`, problemData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update coding problem' };
    }
  }

  async deleteCodingProblem(id) {
    try {
      const response = await api.delete(`/admin/coding-problems/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete coding problem' };
    }
  }
}

export const adminService = new AdminService();