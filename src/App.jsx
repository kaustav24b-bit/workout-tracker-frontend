import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import UserSelection from './pages/UserSelection'
import WorkoutTracker from './pages/WorkoutTracker'
import ManageWorkout from './pages/ManageWorkout'
import StatsPage from './pages/StatsPage'
import ManageTemplate from './pages/ManageTemplate'

function AppContent({ isDarkMode, setIsDarkMode, exerciseList, setExerciseList, currentUser, setCurrentUser }) {
  const location = useLocation()
  const isKajal = currentUser?.username === 'Kajal'
  const isSelectUserPage = location.pathname === '/select-user'

  const bgColor = isDarkMode ? '#141414' : '#ffffff'

  return (
    <div style={{
      minHeight: '100vh',
      background: isKajal && !isSelectUserPage
        ? 'url(/kajal_bg.jpg) center/cover no-repeat fixed'
        : bgColor,
      color: isDarkMode ? '#ffffff' : '#000000'
    }}>
      <Routes>
        <Route path="/" element={<Navigate to="/select-user" />} />
        <Route path="/select-user" element={<UserSelection isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} setCurrentUser={setCurrentUser} />} />
        <Route path="/workout" element={<WorkoutTracker isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} exerciseList={exerciseList} setExerciseList={setExerciseList} />} />
        <Route path="/manage-workout" element={<ManageWorkout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} setExerciseList={setExerciseList} />} />
        <Route path="/stats" element={<StatsPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
        <Route path="/manage-template" element={<ManageTemplate isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} exerciseList={exerciseList} />} />
      </Routes>
    </div>
  )
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [exerciseList, setExerciseList] = useState([])
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AppContent
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        exerciseList={exerciseList}
        setExerciseList={setExerciseList}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </ConfigProvider>
  )
}

export default App