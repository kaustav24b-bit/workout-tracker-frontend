import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Table, Button, Select, InputNumber, Space, message } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
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
  dbId: null,
})

const createExerciseGroup = () => {
  const exerciseId = Date.now()
  return {
    exerciseId,
    name: null,
    sets: [createSetRow(exerciseId, 1)],
  }
}

const WorkoutTable = forwardRef(function WorkoutTable({ selectedDate, exerciseList, loadedExercises, onExercisesChange }, ref) {
  const [exercises, setExercises] = useState([])
  const [workoutDayId, setWorkoutDayId] = useState(null)
  const navigate = useNavigate()

  const fetchWorkoutData = useCallback(async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD')
      const dayOfWeek = selectedDate.format('dddd').toUpperCase()
      const user = JSON.parse(localStorage.getItem('user'))

      const dayResponse = await getOrCreateWorkoutDay(dateStr, dayOfWeek, user?.id)
      const dayId = dayResponse.data.id
      setWorkoutDayId(dayId)

      const exercisesResponse = await getExercisesByWorkoutDayId(dayId)
      const data = exercisesResponse.data

      const grouped = {}
      data.forEach(row => {
        if (!grouped[row.name]) {
          grouped[row.name] = {
            exerciseId: row.name,
            name: row.name,
            sets: []
          }
        }
        grouped[row.name].sets.push({
          rowId: `db-${row.id}`,
          exerciseId: row.name,
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
  }, [selectedDate])

  // Refetch when date changes
  useEffect(() => {
    fetchWorkoutData()
  }, [fetchWorkoutData])

  // Load template exercises into table
  useEffect(() => {
    if (loadedExercises && loadedExercises.length > 0) {
      setExercises(loadedExercises)
    }
  }, [loadedExercises])

  // Notify parent of current exercise names for Save as Template
  useEffect(() => {
    const names = [...new Set(exercises.map(ex => ex.name).filter(Boolean))]
    onExercisesChange(names)
  }, [exercises.length, onExercisesChange])

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

  const saveSetRow = async (record) => {
    if (!record.reps || !record.weight) {
      message.warning('Please fill in reps and weight before saving')
      return
    }

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
        await updateExercise(record.dbId, payload)
        message.success('Saved')
      } else {
        const response = await createExercise(payload)
        setExercises(prev => prev.map(ex => ({
          ...ex,
          sets: ex.sets.map(set =>
            set.rowId === record.rowId
              ? { ...set, dbId: response.data.id, rowId: `db-${response.data.id}` }
              : set
          )
        })))
        message.success('Saved')
      }
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

  // Save all filled rows at once
  const saveAll = async () => {
    let savedCount = 0
    let skippedCount = 0

    for (const ex of exercises) {
      if (!ex.name) { skippedCount++; continue }
      for (const set of ex.sets) {
        if (!set.reps || !set.weight) { skippedCount++; continue }
        try {
          const payload = {
            name: ex.name,
            sets: set.setNumber,
            reps: set.reps,
            weight: set.weight,
            workoutDay: { id: workoutDayId }
          }
          if (set.dbId) {
            await updateExercise(set.dbId, payload)
          } else {
            const response = await createExercise(payload)
            setExercises(prev => prev.map(e => ({
              ...e,
              sets: e.sets.map(s =>
                s.rowId === set.rowId
                  ? { ...s, dbId: response.data.id, rowId: `db-${response.data.id}` }
                  : s
              )
            })))
          }
          savedCount++
        } catch (error) {
          message.error(`Failed to save ${ex.name}`)
        }
      }
    }

    if (savedCount > 0) message.success(`Saved ${savedCount} set(s)`)
    if (skippedCount > 0) message.warning(`Skipped ${skippedCount} incomplete set(s)`)
  }

  // Expose saveAll to parent via ref
  useImperativeHandle(ref, () => ({
    saveAll
  }))

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
      width: 160,
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
      width: 45,
      render: (val) => val,
    },
    {
      title: 'Rep',
      dataIndex: 'reps',
      width: 70,
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
      width: 70,
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
      width: 90,
      render: (_, record) => {
        if (!record.isFirstRow) return { children: null, props: { rowSpan: 0 } }
        return {
          children: (
            <Button
              size="small"
              onClick={() => navigate(`/stats?exercise=${encodeURIComponent(record.name)}`)}
            >
              Check Stats
            </Button>
          ),
          props: { rowSpan: record.rowSpan }
        }
      }
    },
    {
      title: 'Action',
      width: 90,
      render: (_, record) => (
        <Space>
          <Button size="small" type="default" onClick={() => saveSetRow(record)}>
            <SaveOutlined />
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteSetRow(record)} />
        </Space>
      )
    }
  ]

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
    <Space direction="vertical" style={{ width: '100%', minWidth: 0 }}>
      <Table
        dataSource={tableRows}
        columns={columns}
        rowKey="rowId"
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
        size="small"
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
  </div>
  )
})

export default WorkoutTable