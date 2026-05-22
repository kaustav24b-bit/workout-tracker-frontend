import api from './axios'

export const getAllTemplates = (userId) => api.get('/api/templates', { params: { userId } })

export const createTemplate = (name, userId, exerciseNames) => api.post('/api/templates', { name, userId, exerciseNames })

export const getTemplateExercises = (templateId) => api.get(`/api/templates/${templateId}/exercises`)

export const deleteTemplate = (id) => api.delete(`/api/templates/${id}`)