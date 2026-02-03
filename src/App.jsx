import React, { useState } from 'react';
import LandingPage from './LandingPage';
import JugglerGame from './JugglerGame';

function App() {
    const [view, setView] = useState('game'); // 'game' or 'landing'

    return (
        <div className="relative">
            {view === 'landing' ? <LandingPage /> : <JugglerGame />}

            {/* Toggle Button */}
            <button
                onClick={() => setView(view === 'landing' ? 'game' : 'landing')}
                className="fixed bottom-4 right-4 z-[100] bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-white/20 transition-all shadow-lg"
            >
                Switch to {view === 'landing' ? 'Game' : 'Website'}
            </button>
        </div>
    );
}

export default App;
