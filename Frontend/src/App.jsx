import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Prediction from './pages/Prediction'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/prediction" element={<Prediction />} />
    </Routes>
  )
}

export default App
