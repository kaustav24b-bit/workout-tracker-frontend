import api from './axios'

// Fetch all exercise names from the database
export const getAllExerciseNames = () => api.get('/api/exercise-names')

// Create a new exercise name
export const createExerciseName = (name) => api.post('/api/exercise-names', { name })

// Update an existing exercise name
export const updateExerciseName = (id, name) => api.put(`/api/exercise-names/${id}`, { name })

// Delete an exercise name
export const deleteExerciseName = (id) => api.delete(`/api/exercise-names/${id}`)