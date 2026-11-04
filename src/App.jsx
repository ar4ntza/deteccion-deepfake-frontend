import { useState } from 'react';
import Hero from './components/Hero';
import Analyzer from './components/Analyzer';
import About from './components/About';
import './styles.css';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'analyze' | 'about'
  return (
    <div className="stage">
      <div className="orb orb--a" /><div className="orb orb--b" /><div className="orb orb--c" />
      <div className="shell glass">
        <header className="topbar">
          {view !== 'home' ? <button className="btn" onClick={() => setView('home')}>Inicio</button> : <span />}
          <button className="btn" aria-current={view === 'about' ? 'page' : undefined}
            onClick={() => setView('about')}>Acerca de</button>
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