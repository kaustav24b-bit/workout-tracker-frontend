import { Button, DatePicker, Space, Typography } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Text } = Typography

// DateNavigator lets the user go back/forward by day
// or jump to a specific date using the date picker.
// selectedDate is a dayjs object, setSelectedDate updates it in the parent.
function DateNavigator({ selectedDate, setSelectedDate }) {
  const goToPrevDay = () => {
    setSelectedDate(selectedDate.subtract(1, 'day'))
  }

  const goToNextDay = () => {
    setSelectedDate(selectedDate.add(1, 'day'))
  }

  const onDateChange = (date) => {
    if (date) setSelectedDate(date)
  }

  return (
    <Space style={{ marginBottom: '16px' }}>
      {/* Previous day button */}
      <Button icon={<LeftOutlined />} onClick={goToPrevDay} />

      {/* Date picker — shows current date, allows jumping to any date */}
      <DatePicker
        value={selectedDate}
        onChange={onDateChange}
        allowClear={false}
        format="dddd, MMMM D YYYY"
      />

      {/* Next day button */}
      <Button icon={<RightOutlined />} onClick={goToNextDay} />
    </Space>
  )
}

export default DateNavigator