import api from './api';

class QuestionService {
  // Get all questions
  // async getAllQuestions() {
  //   try {
  //     const response = await api.get('/questions');
  //     return {
  //       success: true,
  //       data: response.data
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.response?.data?.message || 'Failed to fetch questions'
  //     };
  //   }
  // }

  // Get questions by quiz ID
  async getQuestionsByQuiz(quizId) {
    try {
      const response = await api.get(`/questions/quiz/${quizId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quiz questions'
      };
    }
  }

  // Get question by ID
  async getQuestionById(id) {
    try {
      const response = await api.get(`/questions/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch question'
      };
    }
  }

  // Create new question
  async createQuestion(questionData) {
    try {
      const response = await api.post('/questions', questionData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create question'
      };
    }
  }

  // Update question
  async updateQuestion(id, questionData) {
    try {
      const response = await api.put(`/questions/${id}`, questionData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update question'
      };
    }
  }

  // Delete question
  async deleteQuestion(id) {
    try {
      const response = await api.delete(`/questions/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete question'
      };
    }
  }

  // Preview questions from PDF
  async previewQuestionsFromPDF(file) {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await api.post('/questions/preview-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to preview PDF'
      };
    }
  }

  // Upload questions from PDF
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

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload questions'
      };
    }
  }
}

export const questionService = new QuestionService();