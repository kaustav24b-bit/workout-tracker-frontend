import { useState, useEffect } from 'react'
import { Layout, Button, Input, List, Typography, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getAllExerciseNames, createExerciseName, updateExerciseName, deleteExerciseName } from '../api/exerciseNameApi'

const { Content } = Layout
const { Title } = Typography

function ManageWorkout({ isDarkMode, setIsDarkMode, setExerciseList }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const username = user?.username

  // Each item is now { id, name } instead of just a string
  const [exercises, setExercises] = useState([])
  const [newExercise, setNewExercise] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchExerciseNames = async () => {
    try {
      const response = await getAllExerciseNames()
      setExercises(response.data)
      // Sync with App.jsx shared state
      setExerciseList(response.data.map(e => ({ id: e.id, name: e.name })))
    } catch (error) {
      message.error('Failed to load exercise names')
    }
  }

  useEffect(() => {
    fetchExerciseNames()
  }, [])

  const addExercise = async () => {
    const trimmed = newExercise.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      await createExerciseName(trimmed)
      setNewExercise('')
      await fetchExerciseNames()
      message.success('Exercise added')
    } catch (error) {
      message.error('Exercise already exists or failed to add')
    } finally {
      setLoading(false)
    }
  }

  const editExercise = async (id) => {
    const trimmed = editValue.trim()
    if (!trimmed) return
    try {
      await updateExerciseName(id, trimmed)
      setEditingId(null)
      await fetchExerciseNames()
      message.success('Exercise updated')
    } catch (error) {
      message.error('Failed to update exercise')
    }
  }

  const deleteExercise = async (id) => {
    try {
      await deleteExerciseName(id)
      await fetchExerciseNames()
      message.success('Exercise deleted')
    } catch (error) {
      message.error('Failed to delete exercise')
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <AppHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        username={username}
      />
      <Content style={{ padding: '24px', maxWidth: '600px' }}>
        <Title level={4}>Manage Workout</Title>

        {/* Add new exercise */}
        <Space style={{ marginBottom: '24px' }}>
          <Input
            placeholder="New exercise name"
            value={newExercise}
            onChange={(e) => setNewExercise(e.target.value)}
            onPressEnter={addExercise}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addExercise}
            loading={loading}
          >
            Add
          </Button>
        </Space>

        {/* Exercise list */}
        <List
          bordered
          dataSource={exercises}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
              {editingId === item.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onPressEnter={() => editExercise(item.id)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    size="small"
                    type="default"
                    onClick={() => editExercise(item.id)}
                  >
                    <SaveOutlined/>
                  </Button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingId(item.id)
                      setEditValue(item.name)
                    }}
                  >
                    <EditOutlined/>
                  </Button>
                </>
              )}
              <Popconfirm
                title="Delete this exercise?"
                description="This will remove it from the dropdown."
                onConfirm={() => deleteExercise(item.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger size="small" icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          </List.Item>
          )}
        />

        <Button
          style={{ marginTop: '24px' }}
          onClick={() => navigate('/workout')}
        >
          Back to Workout
        </Button>
      </Content>
    </Layout>
  )
}

export default ManageWorkout