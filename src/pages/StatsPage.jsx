import { useState, useEffect } from 'react'
import { Layout, Typography, Select, Button, message } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AppHeader from '../components/AppHeader'
import api from '../api/axios'

const { Content } = Layout
const { Title, Text } = Typography

function StatsPage({ isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = JSON.parse(localStorage.getItem('user'))

  // Get exercise name from URL query param
  const initialExercise = searchParams.get('exercise')

  const [selectedExercise, setSelectedExercise] = useState(initialExercise)
  const [exerciseList, setExerciseList] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)


  const fetchExerciseNames = async () => {
    try {
      const response = await api.get('/api/exercise-names')
      setExerciseList(response.data)
    } catch (error) {
      message.error('Failed to load exercise names')
    }
  }

  useEffect(() => {
    fetchExerciseNames()
  }, [])

  const fetchStats = async (name) => {
    setLoading(true)
    try {
      const response = await api.get('/api/exercises/stats', {
        params: { name, userId: user?.id }
      })
      // Format date for display on chart
      setChartData(response.data.map(point => ({
        date: point.date,
        totalWeight: point.totalWeight
      })))
    } catch (error) {
      message.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedExercise) {
      fetchStats(selectedExercise)
    }
  }, [selectedExercise])

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <AppHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        username={user?.username}
      />
      <Content style={{ padding: '24px' }}>
        <Button
          style={{ marginBottom: '16px' }}
          onClick={() => navigate('/workout')}
        >
          ← Back
        </Button>

        <Title level={4}>Progress Stats</Title>

        {/* Exercise selector dropdown */}
        <Select
          style={{ width: '100%', marginBottom: '24px' }}
          value={selectedExercise}
          onChange={setSelectedExercise}
          placeholder="Select exercise"
          options={exerciseList.map(e => ({ label: e.name, value: e.name }))}
        />

        {/* Line chart */}
        {chartData.length > 0 ? (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              Total weight moved per session (reps × weight across all sets)
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{
                    value: 'kg',
                    angle: -90,
                    position: 'insideLeft'
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, 'Total Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="totalWeight"
                  stroke="#1677ff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          !loading && selectedExercise && (
            <Text type="secondary">No data found for {selectedExercise} in the last 2 months.</Text>
          )
        )}
      </Content>
    </Layout>
  )
}

export default StatsPage