import { Layout, Button, Typography, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'

const { Content } = Layout
const { Title } = Typography

function UserSelection({ isDarkMode, setIsDarkMode }) {
  const navigate = useNavigate()


  // When a user is selected, we store their name and go to the workout page
  const handleUserSelect = (username) => {
    localStorage.setItem('username', username)
    navigate('/workout')
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <AppHeader isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <Title level={3}>Select User</Title>

        <Space>
          <Button
            type="primary"
            size="large"
            onClick={() => handleUserSelect('X')}
          >
            Proceed as X
          </Button>

          <Button
            type="primary"
            size="large"
            onClick={() => handleUserSelect('Y')}
          >
            Proceed as Y
          </Button>
        </Space>
      </Content>
    </Layout>
  )
}

export default UserSelection