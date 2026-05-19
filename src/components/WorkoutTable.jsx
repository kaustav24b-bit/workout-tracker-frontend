import { useState, useEffect } from 'react'
import { Table, Button, Select, InputNumber, Space, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  getOrCreateWorkoutDay,
  getExercisesByWorkoutDayId,
  createExercise,
  updateExercise,
  deleteExercise
} from '../api/workoutApi'

const createSetRow = (exerciseId, setNumber) => ({
  rowId: `${exerciseId}-set-${setNumber}`,
  exerciseId,
  setNumber,
  reps: null,
  weight: null,
  dbId: null, // will be set after saving to backend
})

const createExerciseGroup = () => {
  const exerciseId = Date.now()
  return {
    exerciseId,
    name: null,
    sets: [createSetRow(exerciseId, 1)],
  }
}

function WorkoutTable({ selectedDate, exerciseList }) {
  const [exercises, setExercises] = useState([])
  const [workoutDayId, setWorkoutDayId] = useState(null)

  const fetchWorkoutData = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD')
      const dayOfWeek = selectedDate.format('dddd').toUpperCase()
      const user = JSON.parse(localStorage.getItem('user'))

      // Get or create workout day for this date
      const dayResponse = await getOrCreateWorkoutDay(dateStr, dayOfWeek, user?.id)
      const dayId = dayResponse.data.id
      setWorkoutDayId(dayId)

      // Fetch exercises for this workout day
      const exercisesResponse = await getExercisesByWorkoutDayId(dayId)
      const data = exercisesResponse.data

      // Group flat exercise rows into exercise groups by name
      const grouped = {}
      data.forEach(row => {
        if (!grouped[row.name]) {
          grouped[row.name] = {
            exerciseId: row.id,
            name: row.name,
            sets: []
          }
        }
        grouped[row.name].sets.push({
          rowId: `${row.id}-set-${row.sets}`,
          exerciseId: row.id,
          setNumber: row.sets,
          reps: row.reps,
          weight: row.weight,
          dbId: row.id,
        })
      })

      setExercises(Object.values(grouped))
    } catch (error) {
      message.error('Failed to load workout data')
    }
  }

  // Fetch workout data whenever the selected date changes
  useEffect(() => {
    fetchWorkoutData()
  }, [selectedDate])

  const addExercise = () => {
    setExercises([...exercises, createExerciseGroup()])
  }

  const addSet = (exerciseId) => {
    setExercises(exercises.map(ex => {
      if (ex.exerciseId === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, createSetRow(exerciseId, ex.sets.length + 1)]
        }
      }
      return ex
    }))
  }

  const updateExerciseName = (exerciseId, name) => {
    setExercises(exercises.map(ex =>
      ex.exerciseId === exerciseId ? { ...ex, name } : ex
    ))
  }

  const updateSetRow = (rowId, field, value) => {
    setExercises(exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(set =>
        set.rowId === rowId ? { ...set, [field]: value } : set
      )
    })))
  }

  // Save a single set row to the backend
  const saveSetRow = async (record) => {
    if (!record.reps || !record.weight) {
      message.warning('Please fill in reps and weight before saving')
      return
    }

    // Find the exercise name for this row
    const exercise = exercises.find(ex => ex.exerciseId === record.exerciseId)
    if (!exercise?.name) {
      message.warning('Please select an exercise name first')
      return
    }

    try {
      const payload = {
        name: exercise.name,
        sets: record.setNumber,
        reps: record.reps,
        weight: record.weight,
        workoutDay: { id: workoutDayId }
      }

      if (record.dbId) {
        // Update existing row
        await updateExercise(record.dbId, payload)
      } else {
        // Create new row
        const response = await createExercise(payload)
        // Update local state with the new dbId
        setExercises(prev => prev.map(ex => ({
          ...ex,
          sets: ex.sets.map(set =>
            set.rowId === record.rowId ? { ...set, dbId: response.data.id } : set
          )
        })))
      }
      message.success('Saved')
    } catch (error) {
      message.error('Failed to save')
    }
  }

  const deleteSetRow = async (record) => {
    try {
      if (record.dbId) {
        await deleteExercise(record.dbId)
      }
      setExercises(prev => prev.map(ex => ({
        ...ex,
        sets: ex.sets.filter(set => set.rowId !== record.rowId)
      })).filter(ex => ex.sets.length > 0))
      message.success('Deleted')
    } catch (error) {
      message.error('Failed to delete')
    }
  }

  const tableRows = exercises.flatMap(ex =>
    ex.sets.map((set, index) => ({
      ...set,
      name: ex.name,
      isFirstRow: index === 0,
      rowSpan: index === 0 ? ex.sets.length : 0,
      exerciseId: ex.exerciseId,
    }))
  )

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, record) => {
        if (!record.isFirstRow) return { children: null, props: { rowSpan: 0 } }
        return {
          children: (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                placeholder="Select exercise"
                style={{ width: 180 }}
                value={record.name}
                onChange={(val) => updateExerciseName(record.exerciseId, val)}
                options={exerciseList.map(e => ({ label: e.name, value: e.name }))}
              />
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addSet(record.exerciseId)}
              >
                Add Set
              </Button>
            </Space>
          ),
          props: { rowSpan: record.rowSpan }
        }
      }
    },
    {
      title: 'Set',
      dataIndex: 'setNumber',
      render: (val) => val,
    },
    {
      title: 'Rep',
      dataIndex: 'reps',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.reps}
          onChange={(val) => updateSetRow(record.rowId, 'reps', val)}
        />
      )
    },
    {
      title: 'Weight (kg)',
      dataIndex: 'weight',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.weight}
          onChange={(val) => updateSetRow(record.rowId, 'weight', val)}
        />
      )
    },
    {
      title: 'Stats',
      render: (_, record) => {
        if (!record.isFirstRow) return { children: null, props: { rowSpan: 0 } }
        return {
          children: <Button size="small">Check Stats</Button>,
          props: { rowSpan: record.rowSpan }
        }
      }
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button size="small" type="primary" onClick={() => saveSetRow(record)}>
            Save
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteSetRow(record)} />
        </Space>
      )
    }
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Table
        dataSource={tableRows}
        columns={columns}
        rowKey="rowId"
        pagination={false}
        bordered
      />
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addExercise}
        style={{ width: '100%' }}
      >
        Add Exercise
      </Button>
    </Space>
  )
}

export default WorkoutTable