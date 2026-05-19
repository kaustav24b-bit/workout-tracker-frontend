import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import UserSelection from './pages/UserSelection'
import WorkoutTracker from './pages/WorkoutTracker'
import ManageWorkout from './pages/ManageWorkout'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [exerciseList, setExerciseList] = useState([])

  const bgColor = isDarkMode ? '#141414' : '#ffffff'
  const textColor = isDarkMode ? '#ffffff' : '#000000'

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div style={{ minHeight: '100vh', background: bgColor, color: textColor }}>
        <Routes>
          <Route path="/" element={<Navigate to="/select-user" />} />
          <Route path="/select-user" element={<UserSelection isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
          <Route path="/workout" element={<WorkoutTracker isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} exerciseList={exerciseList} setExerciseList={setExerciseList} />} />
          <Route path="/manage-workout" element={<ManageWorkout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} setExerciseList={setExerciseList} />} />
        </Routes>
      </div>
    </ConfigProvider>
  )
}

export default App