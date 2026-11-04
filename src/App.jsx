import { useState } from 'react';
import Hero from './components/Hero';
import Analyzer from './components/Analyzer';
import About from './components/About';
import logo from './assets/logo.png';
import './styles.css';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'analyze' | 'about'
  return (
    <div className="stage">
      <div className="orb orb--a" /><div className="orb orb--b" /><div className="orb orb--c" />
      <div className="shell glass">
        <header className="topbar">
          <div className="inst">
            <img className="inst-logo" src={logo} alt="Ibero Puebla" />
            <div className="inst-text">
              <strong>Universidad Iberoamericana Puebla</strong>
              <span>Área de Síntesis y Evaluación: desarrollo de proyectos</span>
            </div>
          </div>
          <nav className="nav">
            {view !== 'home' && <button className="btn" onClick={() => setView('home')}>Inicio</button>}
            <button className="btn" aria-current={view === 'about' ? 'page' : undefined}
              onClick={() => setView('about')}>Acerca de</button>
          </nav>
        </header>
        <main className="view">
          {view === 'home' && <Hero onStart={() => setView('analyze')} />}
          {view === 'analyze' && <Analyzer />}
          {view === 'about' && <About />}
        </main>
      </div>
    </div>
  );
}
