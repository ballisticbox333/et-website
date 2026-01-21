import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Contact from './pages/Contact'

function App() {
  return (
    <>
      <Header />

      <main className="py-12 px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />

          {/* Fallback: if anything doesn't match, show Home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  )
}

export default App
