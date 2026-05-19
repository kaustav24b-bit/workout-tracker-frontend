import { Layout, Switch, Typography, Space } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
const {Header} = Layout
const {Title,Text} = Typography

function AppHeader({isDarkMode, setIsDarkMode, username}) {
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 'auto',
        minHeight: '64px',
        paddingTop: '8px',
        paddingBottom: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
        {/* Left side — App name and welcome message */}
      <Space direction="vertical" size={0}>
        <Title level={4} style={{ margin: 0 }}>
          App Name
        </Title>
        {username && (
          <Text type="secondary">Hello {username}!</Text>
        )}
      </Space>

      {/* Right side — date and theme toggle */}
      <Space>
        <Text>{dayjs().format('dddd, MMMM D YYYY')}</Text>
        <Switch
          checked={isDarkMode}
          onChange={setIsDarkMode}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
        />
      </Space>
    </Header>
  )
}

export default AppHeader