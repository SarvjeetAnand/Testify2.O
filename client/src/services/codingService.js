import api from './api';

class CodingService {
  async getAllProblems(params = {}) {
    try {
      const response = await api.get('/coding/problems', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coding problems'
      };
    }
  }

  async getProblemById(id) {
    try {
      const response = await api.get(`/coding/problems/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coding problem'
      };
    }
  }

  async runCode(code, language, problemId) {
    try {
      const response = await api.post('/coding/run', {
        code,
        language,
        problemId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to run code'
      };
    }
  }

  async submitSolution(code, language, problemId) {
    try {
      const response = await api.post('/coding/submit', {
        code,
        language,
        problemId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit solution'
      };
    }
  }

  async getUserSubmissions(problemId) {
    try {
      const response = await api.get(`/coding/submissions/problem/${problemId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch submissions'
      };
    }
  }

  async getAllSubmissions() {
    try {
      const response = await api.get('/coding/submissions');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch submissions'
      };
    }
  }
}

export const codingService = new CodingService();




