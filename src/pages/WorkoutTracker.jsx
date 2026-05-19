import { useState, useEffect } from 'react'
import { Layout, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import AppHeader from '../components/AppHeader'
import DateNavigator from '../components/DateNavigator'
import WorkoutTable from '../components/WorkoutTable'
import { getAllExerciseNames } from '../api/exerciseNameApi'

const { Content, Footer } = Layout

function WorkoutTracker({ isDarkMode, setIsDarkMode, exerciseList, setExerciseList }) {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const [selectedDate, setSelectedDate] = useState(dayjs())

  const fetchExerciseNames = async () => {
    try {
      const response = await getAllExerciseNames()
      setExerciseList(response.data.map(e => ({ id: e.id, name: e.name })))
    } catch (error) {
      message.error('Failed to load exercise names')
    }
  }

  // Fetch exercise names on mount so dropdown is always populated
  useEffect(() => {
    fetchExerciseNames()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <AppHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        username={username}
      />
      <Content style={{ padding: '24px' }}>
        <DateNavigator
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <WorkoutTable
          selectedDate={selectedDate}
          exerciseList={exerciseList}
        />
      </Content>
      <Footer style={{ background: 'transparent', padding: '16px 24px' }}>
        <Button type="default" onClick={() => navigate('/manage-workout')}>
          Manage Workout
        </Button>
      </Footer>
    </Layout>
  )
}

export default WorkoutTracker