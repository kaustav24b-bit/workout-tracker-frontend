import api from './axios'

// Fetch or create a workout day for a specific date and user
export const getOrCreateWorkoutDay = (date, dayOfWeek, userId) =>
  api.post('/api/workout-days', {
    date,
    dayOfWeek,
    user: { id: userId }
  })

// Fetch all exercises for a specific workout day
export const getExercisesByWorkoutDayId = (workoutDayId) =>
  api.get(`/api/exercises/by-workout-day/${workoutDayId}`)

// Create a new exercise row
export const createExercise = (exercise) =>
  api.post('/api/exercises', exercise)

// Update an existing exercise row
export const updateExercise = (id, exercise) =>
  api.put(`/api/exercises/${id}`, exercise)

// Delete an exercise row
export const deleteExercise = (id) =>
  api.delete(`/api/exercises/${id}`)