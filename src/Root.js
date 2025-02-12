import { ChakraProvider } from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import App from './App.js'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

const Root = () => (
  <ChakraProvider>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  </ChakraProvider>
)

export default Root