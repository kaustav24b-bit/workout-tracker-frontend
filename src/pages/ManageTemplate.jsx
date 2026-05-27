import { useState, useEffect } from 'react'
import { Layout, Button, Input, List, Typography, Space, Popconfirm, Select, Collapse, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import {
  getAllTemplates,
  getTemplateExercises,
  deleteTemplate,
  updateTemplateName,
  addExerciseToTemplate,
  removeExerciseFromTemplate
} from '../api/templateApi'

const { Content } = Layout
const { Title } = Typography

function ManageTemplate({ isDarkMode, setIsDarkMode, exerciseList }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const username = user?.username

  const [templates, setTemplates] = useState([])
  const [templateExercises, setTemplateExercises] = useState({}) // { templateId: [exercises] }
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await getAllTemplates(user?.id)
      setTemplates(response.data)
      // Fetch exercises for each template
      for (const template of response.data) {
        fetchExercisesForTemplate(template.id)
      }
    } catch (error) {
      message.error('Failed to load templates')
    }
  }

  const fetchExercisesForTemplate = async (templateId) => {
    try {
      const response = await getTemplateExercises(templateId)
      setTemplateExercises(prev => ({ ...prev, [templateId]: response.data }))
    } catch (error) {
      message.error('Failed to load exercises for template')
    }
  }

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteTemplate(id)
      await fetchTemplates()
      message.success('Template deleted')
    } catch (error) {
      message.error('Failed to delete template')
    }
  }

  const handleUpdateTemplateName = async (id) => {
    const trimmed = editValue.trim()
    if (!trimmed) return
    try {
      await updateTemplateName(id, trimmed)
      setEditingId(null)
      await fetchTemplates()
      message.success('Template name updated')
    } catch (error) {
      message.error('Template name already exists or failed to update')
    }
  }

  const handleAddExercise = async (templateId, exerciseName) => {
    if (!exerciseName) return
    try {
      await addExerciseToTemplate(templateId, exerciseName)
      await fetchExercisesForTemplate(templateId)
      message.success('Exercise added')
    } catch (error) {
      message.error('Failed to add exercise')
    }
  }

  const handleRemoveExercise = async (templateId, exerciseId) => {
    try {
      await removeExerciseFromTemplate(exerciseId)
      await fetchExercisesForTemplate(templateId)
      message.success('Exercise removed')
    } catch (error) {
      message.error('Failed to remove exercise')
    }
  }

  const collapseItems = templates.map(template => ({
    key: template.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {editingId === template.id ? (
          <>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onPressEnter={() => handleUpdateTemplateName(template.id)}
              style={{ width: 200 }}
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              size="small"
              type="primary"
              onClick={(e) => {
                e.stopPropagation()
                handleUpdateTemplateName(template.id)
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <span style={{ flex: 1 }}>{template.name}</span>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setEditingId(template.id)
                setEditValue(template.name)
              }}
            >
              Edit
            </Button>
          </>
        )}
        <Popconfirm
          title="Delete this template?"
          description="This will remove all exercises in it."
          onConfirm={(e) => {
            e?.stopPropagation()
            handleDeleteTemplate(template.id)
          }}
          okText="Yes"
          cancelText="No"
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      </div>
    ),
    children: (
      <div>
        {/* Add exercise dropdown */}
        <Space style={{ marginBottom: '12px' }}>
          <Select
            placeholder="Add exercise..."
            style={{ width: 200 }}
            onChange={(val) => handleAddExercise(template.id, val)}
            options={exerciseList
              .filter(e => !templateExercises[template.id]?.find(te => te.name === e.name))
              .map(e => ({ label: e.name, value: e.name }))}
            value={null}
          />
        </Space>

        {/* Exercise list */}
        <List
          bordered
          dataSource={templateExercises[template.id] || []}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ flex: 1 }}>{item.name}</span>
                <Popconfirm
                  title="Remove this exercise?"
                  onConfirm={() => handleRemoveExercise(template.id, item.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            </List.Item>
          )}
        />
      </div>
    )
  }))

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <AppHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        username={username}
      />
      <Content style={{ padding: '24px', maxWidth: '600px' }}>
        <Title level={4}>Manage Templates</Title>

        <Collapse
          items={collapseItems}
          style={{ marginBottom: '24px' }}
        />

        <Button onClick={() => navigate('/workout')}>
          Back to Workout
        </Button>
      </Content>
    </Layout>
  )
}

export default ManageTemplate