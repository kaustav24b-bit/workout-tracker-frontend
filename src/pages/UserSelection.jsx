import { useState, useEffect } from 'react'
import { Layout, Button, Typography, Space, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import api from '../api/axios'

const { Content } = Layout
const { Title } = Typography

function UserSelection({ isDarkMode, setIsDarkMode, setCurrentUser }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users')
      setUsers(response.data)
    } catch (error) {
      message.error('Failed to load users')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUserSelect = (user) => {
    // Store full user object so we have both id and username available
    localStorage.setItem('user', JSON.stringify(user))
    setCurrentUser(user)
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
        <Title level={3}>Who is working out today?</Title>
        <Space>
          {users.map(user => (
            <Button
              key={user.id}
              type="primary"
              size="large"
              onClick={() => handleUserSelect(user)}
              style={user.username === 'Kajal' ? {
                backgroundImage: 'url(/kajal_button.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: 'none',
                color: '#122060',
                height: '60px',
                width: '160px',
              } : {
                height: '60px',
                width: '160px',
                background: '#2c2c2c',
                color: '#ffffffff',
              }}
            >
              {user.username}
            </Button>
          ))}
        </Space>
      </Content>
    </Layout>
  )
}

export default UserSelection