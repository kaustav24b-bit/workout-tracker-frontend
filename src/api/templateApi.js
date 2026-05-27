import api from './axios'

export const getAllTemplates = (userId) => api.get('/api/templates', { params: { userId } })

export const createTemplate = (name, userId, exerciseNames) => api.post('/api/templates', { name, userId, exerciseNames })

export const getTemplateExercises = (templateId) => api.get(`/api/templates/${templateId}/exercises`)

export const deleteTemplate = (id) => api.delete(`/api/templates/${id}`)

// Update template name
export const updateTemplateName = (id, name) => api.put(`/api/templates/${id}`, { name })

// Add exercise to an existing template
export const addExerciseToTemplate = (templateId, name) => api.post(`/api/templates/${templateId}/exercises`, { name })

// Remove exercise from a template
export const removeExerciseFromTemplate = (exerciseId) => api.delete(`/api/templates/exercises/${exerciseId}`)