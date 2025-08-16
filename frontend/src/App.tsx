import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from './pages/FormPage';
import ProgressPage from './pages/ProgressPage';
import ReportPage from './pages/ReportPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
