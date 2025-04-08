import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import MemoryGame from './components/MemoryGame/MemoryGame';
import TodoList from './components/TodoList/TodoList';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>React Egyoldalas Alkalmazás</h1>
          <nav className="main-nav">
            <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>Főoldal</NavLink>
            <NavLink to="/memory" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Memória Játék</NavLink>
            <NavLink to="/todo" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Todo Lista</NavLink>
          </nav>
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={
              <div className="welcome-screen">
                <h2>Válassz egy alkalmazást</h2>
                <div className="app-cards">
                  <NavLink to="/memory" className="app-card">
                    <h3>Memória Játék</h3>
                    <p>Találd meg a párokat minél kevesebb lépésből</p>
                  </NavLink>
                  <NavLink to="/todo" className="app-card">
                    <h3>Todo Lista</h3>
                    <p>Feladatok kezelése és nyomon követése</p>
                  </NavLink>
                </div>
              </div>
            } />
            <Route path="/memory" element={<MemoryGame />} />
            <Route path="/todo" element={<TodoList />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>Készítette: Zolnai Dániel és Kátai Balázs (Neptun kód: AWGMLS, YXZRGL)</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
