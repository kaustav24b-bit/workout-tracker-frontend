import { useState, useEffect, useRef } from 'react'
import { Layout, Button, Select, Space, Modal, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import AppHeader from '../components/AppHeader'
import DateNavigator from '../components/DateNavigator'
import WorkoutTable from '../components/WorkoutTable'
import { getAllExerciseNames } from '../api/exerciseNameApi'
import { getAllTemplates, getTemplateExercises, createTemplate } from '../api/templateApi'

const { Content, Footer } = Layout

function WorkoutTracker({ isDarkMode, setIsDarkMode, exerciseList, setExerciseList }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const username = user?.username
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [templates, setTemplates] = useState([])
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [loadedExercises, setLoadedExercises] = useState(null)
  const [currentExerciseNames, setCurrentExerciseNames] = useState([])
  const workoutTableRef = useRef(null)

  const fetchExerciseNames = async () => {
    try {
      const response = await getAllExerciseNames()
      setExerciseList(response.data.map(e => ({ id: e.id, name: e.name })))
    } catch (error) {
      message.error('Failed to load exercise names')
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates(user?.id)
      setTemplates(response.data)
    } catch (error) {
      message.error('Failed to load templates')
    }
  }

  const loadTemplate = async (templateId) => {
      try {
        const response = await getTemplateExercises(templateId)
        const loaded = response.data.map((te, index) => {
          const exerciseId = Date.now() + index
          return {
            exerciseId,
            name: te.name,
            sets: [{
              rowId: `${exerciseId}-set-1`,
              exerciseId,
              setNumber: 1,
              reps: null,
              weight: null,
              dbId: null,
            }]
          }
        })
        setLoadedExercises(loaded)
        message.success('Template loaded')
      } catch (error) {
        message.error('Failed to load template')
      }
    }

  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      message.warning('Please enter a template name')
      return
    }
    try {
      await createTemplate(templateName, user?.id, currentExerciseNames)
      setSaveModalOpen(false)
      setTemplateName('')
      await fetchTemplates()
      message.success('Template saved')
    } catch (error) {
      message.error('Failed to save template')
    }
  }

  // Fetch exercise names on mount so dropdown is always populated
  useEffect(() => {
    fetchExerciseNames()
    fetchTemplates()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent', maxWidth: '100vw', overflowX: 'hidden' }}>
      <AppHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        username={username}
      />
      <Content style={{ padding: '24px', overflowX: 'hidden', maxWidth: '100vw' }}>
        {/* Template dropdown */}
        <Space direction="vertical" style={{ marginBottom: '16px', width: '100%' }}>
          <Select
            placeholder="Load a template..."
            style={{ width: 200 }}
            onChange={loadTemplate}
            options={templates.map(t => ({ label: t.name, value: t.id }))}
          />
        </Space>

        <DateNavigator
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <WorkoutTable
          ref={workoutTableRef}
          selectedDate={selectedDate}
          exerciseList={exerciseList}
          loadedExercises={loadedExercises}
          setLoadedExercises={setLoadedExercises}
          onExercisesChange={setCurrentExerciseNames}
        />
      </Content>

      <Footer style={{ background: 'transparent', padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="default"
              style={{ flex: 1 }}
              onClick={() => navigate('/manage-template')}
            >
              Manage Templates
            </Button>
            <Button
              type="primary"
              style={{ flex: 1 }}
              onClick={() => setSaveModalOpen(true)}
            >
              Save as Template
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="default"
              style={{ flex: 1 }}
              onClick={() => navigate('/manage-workout')}
            >
              Manage Workout
            </Button>
            <Button
              type="primary"
              style={{ flex: 1, background: '#33631a' }}
              onClick={() => workoutTableRef.current?.saveAll()}
            >
              Save All
            </Button>
          </div>
        </div>
      </Footer>

      {/* Save as Template modal */}
      <Modal
        title="Save as Template"
        open={saveModalOpen}
        onOk={saveAsTemplate}
        onCancel={() => setSaveModalOpen(false)}
        okText="Save"
      >
        <Input
          placeholder="Template name (e.g. Push Day 1)"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          onPressEnter={saveAsTemplate}
        />
      </Modal>
    </Layout>
  )
}

export default WorkoutTracker