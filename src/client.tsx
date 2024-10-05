import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Title from './pages/title'
import InGame from './pages/ingame'

createRoot(document.getElementById('root')!).render(
    <Router>
        <Routes>
            <Route path="/" element={<Title />} />
            <Route path="/ingame" element={<InGame />} />
        </Routes>
    </Router>
)