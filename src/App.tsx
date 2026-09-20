import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Outlet />
    </div>
  )
}

export default App
