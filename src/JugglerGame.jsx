import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from './SoundManager';

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS & SPECS                           */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS & SPECS                           */
/* -------------------------------------------------------------------------- */

const SYMBOLS = ['7', 'BAR', '🍇', '🦏', '🍒', '🔔', '🤡'];

// Probabilities from User Provided Image
const ODDS = {
    1: { bb: '1/273.1', rb: '1/439.8', total: '1/168.5', payout: '97.0%' },
    2: { bb: '1/269.7', rb: '1/399.6', total: '1/161.0', payout: '98.0%' },
    3: { bb: '1/269.7', rb: '1/331.0', total: '1/148.6', payout: '99.5%' },
    4: { bb: '1/259.0', rb: '1/315.1', total: '1/142.2', payout: '101.1%' },
    5: { bb: '1/259.0', rb: '1/255.0', total: '1/128.5', payout: '103.3%' },
    6: { bb: '1/255.0', rb: '1/255.0', total: '1/127.5', payout: '105.5%' },
};

// Exact 21-symbol sequences from provided image
const REELS = [
    // LEFT REEL
    ['🔔', '7', '🦏', '🍇', '🦏', '🍇', 'BAR', '🍒', '🍇', '🦏', '🍇', '7', '🤡', '🍇', '🦏', '🍇', '🍒', 'BAR', '🍇', '🦏', '🍇'],
    // CENTER REEL
    ['🦏', '7', '🍇', '🍒', '🦏', '🔔', '🍇', '🍒', '🦏', 'BAR', '🍇', '🍒', '🤡', '🦏', '7', '🍇', '🍒', '🦏', '🔔', '🍇', '🍒'],
    // RIGHT REEL
    ['🍇', '7', 'BAR', '🔔', '🦏', '🍇', '🤡', '🔔', '🦏', '🍇', '🤡', '🔔', '🦏', '🍇', '🤡', '🔔', '🦏', '🍇', '🤡', '🔔', '🦏']
];

/* -------------------------------------------------------------------------- */
/*                                SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

const SymbolView = React.memo(({ sym }) => {
    let src = '';
    let alt = sym;

    // Map symbols to uploaded icon files
    switch (sym) {
        case '7': src = '/icon_seven.png'; break;
        case 'BAR': src = '/icon_bar.png'; break;
        case '🍇': src = '/icon_grape.png'; break;
        case '🍒': src = '/icon_cherry.png'; break;
        case '🤡': src = '/icon_juggler.png'; break;
        case '🔔': src = '/icon_bell.png'; break;
        case '🦏': src = '/icon_rino.png'; break;
        default: return <span className="text-3xl font-bold text-white">{sym}</span>;
    }

    return (
        <img
            src={src}
            alt={alt}
            className="w-[90%] h-[90%] object-contain drop-shadow-md"
        />
    );
});

const Reel = React.memo(function Reel({ id, spinning, stopIndex, windowHeight, xOffset = 0, highlights = [] }) {
    const [angle, setAngle] = useState(0);
    const requestRef = useRef();
    const speed = useRef(0);
    const reelStrip = REELS[id];

    // 3D Cylinder Config
    const effectiveH = windowHeight || 140;
    // Divide by 3.8 to allow stronger top/bottom overlap (approx 36px -> ~15px peeks)
    const ITEM_HEIGHT = effectiveH / 3.8;
    const ITEM_COUNT = 21;
    const ANGLE_PER_ITEM = 360 / ITEM_COUNT;
    // Radius: h / (2 * sin(theta/2)) -> 46 / (2 * sin(8.5deg)) ~ 155px
    // We adjust slightly to ensure no gaps or specific curvature
    const RADIUS = Math.round((ITEM_HEIGHT / 2) / Math.tan(Math.PI / ITEM_COUNT));

    const SPIN_SPEED = 15; // Degrees per frame

    const animate = () => {
        speed.current = SPIN_SPEED;
        setAngle(prev => (prev + speed.current) % 360);
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (spinning) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(requestRef.current);
            if (stopIndex !== null) {
                // Target Angle: stopIndex should be at CENTER
                let targetAngle = -(stopIndex * ANGLE_PER_ITEM);
                setAngle(targetAngle);
            }
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [spinning, stopIndex, ITEM_HEIGHT, ANGLE_PER_ITEM]);

    return (
        <div
            className="relative w-full h-full overflow-hidden last:border-none"
            style={{
                perspective: '800px',
                backgroundColor: '#000000' // Black background behind the drum
            }}
        >
            {/* STATIC SHADING OVERLAY (Stationary Reflection) */}
            <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.1) 100%)',
                    boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5), inset 0 -10px 20px rgba(0,0,0,0.5)'
                }}
            ></div>

            <div
                className="absolute left-0 w-full h-0"
                style={{
                    top: '50%', // Shifted down to reveal top peek
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(${angle}deg)`
                }}
            >
                {reelStrip.map((sym, i) => (
                    <div
                        key={i}
                        className="absolute flex items-center justify-center"
                        style={{
                            left: '-2%', // Centered overfill (reduced)
                            width: '100%', // Minimal overfill to cover edge gaps
                            height: `${ITEM_HEIGHT + 0.5}px`,
                            marginTop: `-${(ITEM_HEIGHT + 0.5) / 2}px`,
                            transform: `rotateX(${i * ANGLE_PER_ITEM}deg) translateZ(${RADIUS}px)`,
                            backfaceVisibility: 'hidden',
                            backgroundColor: '#d0d0d0ff', // Solid white strip
                        }}
                    >
                        <div className="flex justify-center items-center" style={{ width: '96%', transform: `translateX(${xOffset}px) scale(0.95)` }}>
                            {highlights.some(off => (stopIndex + off + 21) % 21 === i) && <div className="win-flash"></div>}
                            <SymbolView sym={sym} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

/* -------------------------------------------------------------------------- */
/*                                MAIN GAME                                   */
/* -------------------------------------------------------------------------- */

export default function JugglerGame() {

    // --- LAYOUT CONFIG (Fixed Pixels from User) ---
    // Start x:120, y: 328
    // Size: 392 * 138
    const REEL_SPECS = { x: 121, y: 328, w: 392, h: 138 };
    // Individual Reel Horizontal Adjustment (in pixels) - Edit here to center reels
    const REEL_X_OFFSETS = [4, 4, 4]; // [Left Reel, Center Reel, Right Reel]

    // State to track actual image dimensions
    const [imgSize, setImgSize] = useState({ w: 800, h: 1200 }); // Default placeholder
    const [scale, setScale] = useState(1);

    // Game State
    const [credits, setCredits] = useState(50);
    const [bet, setBet] = useState(0);
    const [payout, setPayout] = useState(0);
    const [isReplay, setIsReplay] = useState(false); // New Replay State

    const [spinning, setSpinning] = useState([false, false, false]);
    const [canStop, setCanStop] = useState([false, false, false]);
    const [stops, setStops] = useState([0, 0, 0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gogoState, setGogoState] = useState('OFF');
    const [setting, setSetting] = useState(6);
    const [totalSpins, setTotalSpins] = useState(0);

    // Stats State
    const [bbCount, setBbCount] = useState(0);
    const [rbCount, setRbCount] = useState(0);
    const [currentSpins, setCurrentSpins] = useState(0);

    const [bonusFlag, setBonusFlag] = useState(null);
    const [spinCommand, setSpinCommand] = useState(null);
    const [winHighlights, setWinHighlights] = useState([]);

    const stateRef = useRef({ spinning, canStop, isPlaying, bet, bonusFlag, spinCommand, credits, payout, isReplay });
    useEffect(() => { stateRef.current = { spinning, canStop, isPlaying, bet, bonusFlag, spinCommand, credits, payout, isReplay }; }, [spinning, canStop, isPlaying, bet, bonusFlag, spinCommand, credits, payout, isReplay]);

    // Helper: Parse "1/273.1" -> 1/273.1
    const parseRatio = (str) => {
        if (!str) return 0;
        const parts = str.split('/');
        if (parts.length !== 2) return 0;
        return 1 / parseFloat(parts[1]);
    };

    // Resizing
    useEffect(() => {
        const handleResize = () => {
            // Fit to screen (Max height 90vh, Max width 95vw)
            const hRatio = (window.innerHeight * 0.9) / imgSize.h;
            // Width of machine (imgSize.w) + sidebar (300) + gap (32)
            const totalW = imgSize.w + 350;
            const wRatio = (window.innerWidth * 0.95) / totalW;
            setScale(Math.min(wRatio, hRatio));
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial
        return () => window.removeEventListener('resize', handleResize);
    }, [imgSize]);

    // Game Logic
    // Game Logic
    // --- BETTING LOGIC ---
    const handleBetChange = (targetBet) => {
        if (stateRef.current.isPlaying) return;
        if (stateRef.current.isReplay) return; // Prevent bet change during Replay

        soundManager.playClick();

        const currentCredits = stateRef.current.credits;
        const currentBet = stateRef.current.bet;
        const currentPayout = stateRef.current.payout;
        const cost = targetBet - currentBet;

        // Check affordability
        if (currentCredits + currentPayout < cost) return;

        // 1. Apply Bet Logic (Immediate)
        setBet(targetBet);
        setPayout(0);
        setCredits(c => c - cost);

        // 2. Animate Payout Collection (if any)
        if (currentPayout > 0) {
            let count = 0;
            const interval = setInterval(() => {
                setCredits(c => c + 1);
                soundManager.playCount();
                count++;
                if (count >= currentPayout) clearInterval(interval);
            }, 50);
        }
    };

    const pullLever = () => {
        if (stateRef.current.isPlaying) return;
        const currentBet = stateRef.current.bet;

        if (currentBet === 0) return; // Must have bet
        if (currentBet === 0) return;

        soundManager.playClick();
        soundManager.startSpinSound();

        // Auto-collect payout if exists (Standard game only)
        if (!stateRef.current.isReplay && stateRef.current.payout > 0) {
            const p = stateRef.current.payout;
            setPayout(0);

            // Animate Payout
            let count = 0;
            const interval = setInterval(() => {
                setCredits(c => c + 1);
                soundManager.playCount();
                count++;
                if (count >= p) clearInterval(interval);
            }, 50);
        }

        // Clean Replay state if it was active
        if (stateRef.current.isReplay) {
            setIsReplay(false);
        }

        setTotalSpins(c => c + 1);
        setCurrentSpins(c => c + 1); // Increment Current Spins
        setIsPlaying(true);
        setSpinning([true, true, true]);
        setWinHighlights([]); // Clear previous highlights
        // Gogo lamp OFF unless Bonus Flag is active
        if (!stateRef.current.bonusFlag) setGogoState('OFF');

        setTimeout(() => setCanStop([true, true, true]), 200);

        // --- RNG LOGIC ---
        let command = 'MISS';
        const rng = Math.random();

        // 1. Check Bonus Flag (Priority)
        if (stateRef.current.bonusFlag) {
            command = stateRef.current.bonusFlag;
        } else {
            // 2. Roll for New Bonus
            const odds = ODDS[setting];
            const probBB = parseRatio(odds.bb);
            const probRB = parseRatio(odds.rb);

            if (rng < probBB) {
                setBonusFlag('BB');
                // Saki-Gogo check (25% chance)
                if (Math.random() < 0.25) setGogoState('ON');
                else setGogoState('OFF'); // Atogogo (Silent start)
                command = 'BB';
            } else if (rng < probBB + probRB) {
                setBonusFlag('RB');
                // Saki-Gogo check (25% chance)
                if (Math.random() < 0.25) setGogoState('ON');
                else setGogoState('OFF'); // Atogogo (Silent start)
                command = 'RB';
            } else {
                // 3. Small Win (Grape/Cherry)
                const probGrape = 1 / 7.3;
                const probCherry = 1 / 33;
                const subRng = Math.random();
                if (subRng < probGrape) command = 'GRAPE';
                else if (subRng < probGrape + probCherry) command = 'CHERRY';
            }
        }
        setSpinCommand(command);
    };

    const stopReel = (idx) => {
        if (!stateRef.current.spinning[idx] || !stateRef.current.canStop[idx]) return;

        soundManager.playStop();

        let naturalIdx = Math.floor(Math.random() * 21);
        let finalIdx = naturalIdx;
        const cmd = stateRef.current.spinCommand;

        // Helper to find symbol distance in next 4 frames
        const findSymbolInSlip = (reelId, targetSyms, startIdx) => {
            const strip = REELS[reelId];
            for (let i = 0; i <= 4; i++) {
                const checkIdx = (startIdx + i) % 21;
                if (targetSyms.includes(strip[checkIdx])) return checkIdx;
            }
            return null;
        };

        if (cmd === 'BB' || cmd === 'RB' || stateRef.current.bonusFlag) {
            // Aim for 7 or BAR
            const target = (cmd === 'RB' && idx === 2) ? ['BAR'] : ['7'];
            const found = findSymbolInSlip(idx, target, naturalIdx);
            if (found !== null) finalIdx = found;
        } else if (cmd === 'GRAPE') {
            const found = findSymbolInSlip(idx, ['🍇'], naturalIdx);
            if (found !== null) finalIdx = found;
        } else if (cmd === 'CHERRY' && idx === 0) {
            const found = findSymbolInSlip(idx, ['🍒'], naturalIdx);
            if (found !== null) finalIdx = found;
        } else {
            // MISS: Prevent 7/BAR alignment
            const strip = REELS[idx];
            if (strip[finalIdx] === '7' || strip[finalIdx] === 'BAR') {
                finalIdx = (finalIdx + 1) % 21;
            }
        }

        setSpinning(p => { const n = [...p]; n[idx] = false; return n; });
        setStops(p => { const n = [...p]; n[idx] = finalIdx; return n; });
    };

    useEffect(() => {
        if (!spinning.some(s => s) && isPlaying) {
            setIsPlaying(false);
            soundManager.stopSpinSound();

            // --- WIN EVALUATION (5 LINES) ---
            // Indices: [Top, Center, Bottom]
            const getReelSymbols = (reelId, stopIdx) => {
                const strip = REELS[reelId];
                const center = stopIdx;
                const top = (center - 1 + 21) % 21;
                const bottom = (center + 1) % 21;
                return { top: strip[top], center: strip[center], bottom: strip[bottom] };
            };

            const r0 = getReelSymbols(0, stops[0]);
            const r1 = getReelSymbols(1, stops[1]);
            const r2 = getReelSymbols(2, stops[2]);

            const lines = [
                [r0.center, r1.center, r2.center],
                [r0.top, r1.top, r2.top],
                [r0.bottom, r1.bottom, r2.bottom],
                [r0.top, r1.center, r2.bottom],
                [r0.bottom, r1.center, r2.top]
            ];

            let totalWin = 0;
            let bonusWon = false;
            let replayTrigger = false;
            const newHighlights = [];

            // Line Definitions with Visual Offsets (0=Center, -1=Top, 1=Bottom)
            // Lines inputs: [s1, s2, s3] were values. I need INDICES.
            // Redefine iteration.

            const lineDefs = [
                { offsets: [0, 0, 0], symbols: [r0.center, r1.center, r2.center] }, // Center
                { offsets: [-1, -1, -1], symbols: [r0.top, r1.top, r2.top] },       // Top
                { offsets: [1, 1, 1], symbols: [r0.bottom, r1.bottom, r2.bottom] }, // Bottom
                { offsets: [-1, 0, 1], symbols: [r0.top, r1.center, r2.bottom] },  // Cross Down
                { offsets: [1, 0, -1], symbols: [r0.bottom, r1.center, r2.top] },  // Cross Up
            ];

            for (const { offsets, symbols } of lineDefs) {
                const [s1, s2, s3] = symbols;
                let lineWin = false;
                if (s1 === '7' && s2 === '7' && s3 === '7') { totalWin += 300; bonusWon = true; lineWin = true; }
                else if (s1 === '7' && s2 === '7' && s3 === 'BAR') { totalWin += 100; bonusWon = true; lineWin = true; }
                else if (s1 === '🍇' && s2 === '🍇' && s3 === '🍇') { totalWin += 8; lineWin = true; }
                else if (s1 === '🦏' && s2 === '🦏' && s3 === '🦏') { replayTrigger = true; lineWin = true; }
                else if (s1 === '🤡' && s2 === '🤡' && s3 === '🤡') { totalWin += 14; lineWin = true; } // Juggler Win
                else if (s1 === 'BAR' && s2 === 'BAR' && s3 === 'BAR') { totalWin += 14; lineWin = true; } // BAR Win

                if (lineWin) {
                    newHighlights.push({ r: 0, i: offsets[0] });
                    newHighlights.push({ r: 1, i: offsets[1] });
                    newHighlights.push({ r: 2, i: offsets[2] });
                }
            }

            // CHERRY CHECK (Scatter Logic: Total 2+ Cherries = 2 Credits)
            // Check all 9 visible symbols
            let cherryCount = 0;
            const reelsObj = [r0, r1, r2];
            reelsObj.forEach((rObj, rIdx) => {
                [-1, 0, 1].forEach(offset => {
                    const key = offset === -1 ? 'top' : (offset === 0 ? 'center' : 'bottom');
                    if (rObj[key] === '🍒') {
                        cherryCount++;
                        // We will highlight ALL cherries if we win via cherry
                        // But we only decide highlighting later?
                        // Actually, if we win cherry, we highlight them.
                    }
                });
            });

            if (cherryCount >= 2) {
                totalWin += 2;
                // Highlight all cherries
                reelsObj.forEach((rObj, rIdx) => {
                    [-1, 0, 1].forEach(offset => {
                        const key = offset === -1 ? 'top' : (offset === 0 ? 'center' : 'bottom');
                        if (rObj[key] === '🍒') {
                            newHighlights.push({ r: rIdx, i: offset });
                        }
                    });
                });
            }

            if (replayTrigger) {
                soundManager.playWin();
                setBonusFlag(null);
                setGogoState('OFF');
                setPayout(0); // Replay pays 0
                setIsReplay(true);
                // Bet remains as is
            } else if (bonusWon) {
                const isBB = totalWin >= 300;

                // Update Stats
                if (isBB) setBbCount(c => c + 1);
                else setRbCount(c => c + 1);
                setCurrentSpins(0); // Reset Current Spins on Bonus

                soundManager.playFanfare(isBB ? 'BB' : 'RB');

                // Atogogo Check: If lamp was silent, light it up now!
                if (gogoState === 'OFF') setGogoState('ON');

                setBonusFlag(null);
                // Do NOT setGogoState('OFF') here. It stays ON until next spin.

                setPayout(totalWin > 300 ? 300 : totalWin);
                setBet(0);
            } else if (totalWin > 0) {
                soundManager.playWin();
                setPayout(totalWin);
                setBet(0); // Bet consumed
            } else {
                setBet(0); // Bet consumed even on loss
            }

            if (newHighlights.length > 0) {
                setWinHighlights(newHighlights);
                setTimeout(() => setWinHighlights([]), 2000);
            }
        }
    }, [spinning, isPlaying, stops]);


    // Keyboard
    useEffect(() => {
        const handleKey = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                pullLever();
            }
            if (e.key === 'q' || e.key === 'Q') {
                // Cycle 1 -> 2 -> 3 -> 1
                // Current logic: handleBetChange calculates diff.
                // Using current ref value for 'bet'
                const current = stateRef.current.bet;
                const next = (current % 3) + 1;
                handleBetChange(next);
            }
            if (e.code === 'Backquote' || e.key === '`') {
                // MAX BET (3)
                handleBetChange(3);
            }
            if (e.key === '1') stopReel(0);
            if (e.key === '2') stopReel(1);
            if (e.key === '3') stopReel(2);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [credits, payout, bet]); // Add dependecies for closure? 
    // Actually handleBetChange uses state variables from closure if defined inside component.
    // Better to use stateRef inside handleBetChange or ensure useEffect updates.
    // Since handleBetChange is inside, we need to bind useEffect to [credits, payout, bet] OR use stateRef consistently.
    // I switched handleBetChange to use 'credits' state directly. 
    // Wait, 'handleKey' is verified once [] with listener. This captures stale state!
    // FIX: Use ref for everything inside handleKey or handleBetChange.

    // Changing strategy: Since I am replacing the block, I will make handleKey rely on stateRef entirely or re-bind.
    // I already have stateRef updating in line 178.
    // I will rewrite handleBetChange to use stateRef values OR use functional updates carefully.
    // Safest: Use stateRef.current for reading, setters for writing.

    // IMPORTANT: 'credits' and 'payout' inside handleBetChange must be fresh.
    // But 'stateRef' only tracks { spinning, canStop, isPlaying, bet... }. It does NOT track credits/payout!
    // I MUST ADD credits/payout to stateRef to use them in the Ref-based handler.

    return (
        <div className="w-screen h-screen bg-neutral-900 flex items-center justify-center overflow-hidden">

            <div
                className="flex flex-row items-start justify-center gap-8"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center'
                }}
            >
                {/* MACHINE */}
                <div style={{
                    width: `${imgSize.w}px`,
                    height: `${imgSize.h}px`,
                    position: 'relative',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                }}>

                    {/* 1. BACKGROUND IMAGE */}
                    <div className="absolute inset-0 z-0 bg-transparent rounded-xl overflow-hidden">
                        <img
                            src="/machine.png"
                            alt="Slot Machine Background"
                            className="w-full h-full object-cover"
                            onLoad={(e) => {
                                // Update container size to match image
                                if (e.target.naturalWidth > 0) {
                                    setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
                                }
                            }}
                        />
                    </div>

                    {/* 2. REEL WINDOW LAYER */}
                    <div
                        className="absolute z-10 flex justify-between items-center bg-black shadow-[inset_0_0_20px_black] border-0"
                        style={{
                            top: `${(REEL_SPECS.y / imgSize.h) * 100}%`,
                            left: `${(REEL_SPECS.x / imgSize.w) * 100}%`,
                            width: `${(REEL_SPECS.w / imgSize.w) * 100}%`,
                            height: `${(REEL_SPECS.h / imgSize.h) * 100}%`,
                        }}
                    >
                        {/* GOGO LAMP */}
                        <div className="absolute bottom-4 left-4 z-50">
                            <div className={`w-16 h-12 bg-black rounded transition-all duration-300 flex items-center justify-center 
                                  ${gogoState === 'ON' ? 'shadow-[0_0_30px_orange] opacity-100' : 'opacity-20 is-grayscale'}
                              `}>
                                <span className="text-yellow-500 font-extrabold italic text-xl drop-shadow-[0_0_5px_yellow]">GOGO!</span>
                            </div>
                        </div>

                        {/* Reels with Calculated % Width for Spacing */}
                        <div className="h-full relative" style={{ width: '30%' }}><Reel id={0} spinning={spinning[0]} stopIndex={stops[0]} windowHeight={REEL_SPECS.h} xOffset={REEL_X_OFFSETS[0]} highlights={winHighlights.filter(h => h.r === 0).map(h => h.i)} /></div>
                        <div className="h-full relative" style={{ width: '30%' }}><Reel id={1} spinning={spinning[1]} stopIndex={stops[1]} windowHeight={REEL_SPECS.h} xOffset={REEL_X_OFFSETS[1]} highlights={winHighlights.filter(h => h.r === 1).map(h => h.i)} /></div>
                        <div className="h-full relative" style={{ width: '30%' }}><Reel id={2} spinning={spinning[2]} stopIndex={stops[2]} windowHeight={REEL_SPECS.h} xOffset={REEL_X_OFFSETS[2]} highlights={winHighlights.filter(h => h.r === 2).map(h => h.i)} /></div>
                    </div>

                    {/* 3. DIGITAL DISPLAYS (CREDIT, COUNT, PAYOUT) */}
                    <div className="absolute z-20 pointer-events-none" style={{ top: 0, left: 0, width: '100%', height: '100%' }}>
                        {/* CREDIT: 222, 490 (2 digits) */}
                        <div
                            className="absolute flex gap-[4px]"
                            style={{
                                left: `${(224 / imgSize.w) * 100}%`,
                                top: `${(484 / imgSize.h) * 100}%`
                            }}
                        >
                            <span className="absolute opacity-10 text-[#ff0000] font-['Digital-7'] font-bold leading-none tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.9)]" style={{ fontSize: '32px', width: '32px', textAlign: 'center' }}>
                                88
                            </span>
                            <span className="relative text-[#ff0000] font-['Digital-7'] font-bold leading-none tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.9)]" style={{ fontSize: '32px', width: '32px', textAlign: 'center', filter: 'contrast(1.5) brightness(1.2)' }}>
                                {Math.min(credits, 99).toString().padStart(2, '0')}
                            </span>
                        </div>

                        {/* COUNT: 296, 490 (3 digits) */}
                        <div
                            className="absolute flex gap-[4px]"
                            style={{
                                left: `${(294 / imgSize.w) * 100}%`,
                                top: `${(484 / imgSize.h) * 100}%`
                            }}
                        >
                            <span className="absolute opacity-10 text-[#ff0000] font-['Digital-7'] font-bold leading-none tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.9)]" style={{ fontSize: '32px', width: '42px', textAlign: 'center' }}>
                                888
                            </span>
                            <span className="text-[#ff0000] font-['Digital-7'] font-bold leading-none tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.9)]" style={{ fontSize: '32px', width: '42px', textAlign: 'center', filter: 'contrast(1.5) brightness(1.2)' }}>
                                {Math.min(totalSpins, 999).toString().padStart(3, '0')}
                            </span>
                        </div>

                        {/* PAYOUT: 380, 490 (2 digits) */}
                        <div
                            className="absolute flex gap-[4px]"
                            style={{
                                left: `${(378 / imgSize.w) * 100}%`,
                                top: `${(484 / imgSize.h) * 100}%`
                            }}
                        >
                            <span className="absolute opacity-10 text-[#ff0000] font-['Digital-7'] font-bold leading-none tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.9)]" style={{ fontSize: '32px', width: '32px', textAlign: 'center' }}>
                                88
                            </span>
                            <span className="text-[#ff0000] font-['Digital-7'] font-bold leading-none tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.9)]" style={{ fontSize: '32px', width: '32px', textAlign: 'center', filter: 'contrast(1.5) brightness(1.2)' }}>
                                {Math.min(payout, 99).toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* 4. TOUCH CONTROLS */}
                    <div className="absolute bottom-[20%] left-0 w-full h-[15%] z-30 flex">
                        <div className="flex-1 active:bg-white/20 cursor-pointer" onClick={() => setCredits(c => c - 3)}></div>
                        <div className="flex-1 active:bg-white/20 cursor-pointer" onClick={pullLever}></div>
                        <div className="flex-[2] flex">
                            <div className="flex-1 active:bg-white/20 cursor-pointer" onMouseDown={() => stopReel(0)}></div>
                            <div className="flex-1 active:bg-white/20 cursor-pointer" onMouseDown={() => stopReel(1)}></div>
                            <div className="flex-1 active:bg-white/20 cursor-pointer" onMouseDown={() => stopReel(2)}></div>
                        </div>
                    </div>

                </div>

                {/* SETUP SIDEBAR COLUMN */}
                <div className="flex flex-col gap-4">

                    {/* DATA COUNTER PANEL */}
                    <div className="w-[300px] bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl border-2 border-slate-600 p-1 text-white shadow-2xl">
                        {/* Header Display */}
                        <div className="bg-black rounded-lg p-3 mb-2 flex justify-between items-center relative overflow-hidden border border-slate-700">
                            <div className="relative z-10 flex flex-col items-center w-full">
                                <span className="text-xs text-red-500 font-bold tracking-widest mb-1">DATA COUNTER</span>
                                <div className="flex justify-between w-full px-2 mt-1">
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-slate-400">BIG</span>
                                        <span className="text-3xl font-['Digital-7'] text-red-500 drop-shadow-[0_0_5px_red]">{bbCount}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-slate-400">REG</span>
                                        <span className="text-3xl font-['Digital-7'] text-green-500 drop-shadow-[0_0_5px_green]">{rbCount}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-slate-400">TOTAL</span>
                                        <span className="text-2xl font-['Digital-7'] text-white">{totalSpins}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Counter */}
                        <div className="bg-black/50 rounded p-4 flex flex-col items-center justify-center border border-slate-700">
                            <span className="text-xs text-yellow-500 font-bold mb-1">CURRENT SPINS</span>
                            <span className="text-5xl font-['Digital-7'] text-yellow-400 drop-shadow-[0_0_10px_orange]">
                                {currentSpins}
                            </span>
                        </div>

                        {/* Probability */}
                        <div className="mt-2 text-center">
                            <span className="text-[10px] text-slate-500">
                                Total Prob: 1 / {totalSpins > 0 ? (totalSpins / (bbCount + rbCount || 1)).toFixed(1) : '-'}
                            </span>
                        </div>
                    </div>

                    {/* KEY GUIDE PANEL */}
                    <div className="w-[300px] bg-slate-900/90 rounded-xl border border-slate-700 p-5 text-white shadow-xl">
                        <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-2 mb-4 flex justify-between items-center">
                            <span>⌨️ Key Guide</span>
                            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-cyan-300">Bet: {bet}</span>
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="bg-slate-700 w-8 h-8 flex items-center justify-center rounded font-mono font-bold shadow-sm">Q</span>
                                <span className="text-slate-400">Cycle Bet (1~3)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="bg-slate-700 w-8 h-8 flex items-center justify-center rounded font-mono font-bold shadow-sm">~</span>
                                <span className="text-slate-400">MAX BET (3)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="bg-slate-700 px-3 h-8 flex items-center justify-center rounded font-mono font-bold shadow-sm">Space</span>
                                <span className="text-slate-400">Spin Reel</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    <span className="bg-slate-700 w-8 h-8 flex items-center justify-center rounded font-mono font-bold shadow-sm">1</span>
                                    <span className="bg-slate-700 w-8 h-8 flex items-center justify-center rounded font-mono font-bold shadow-sm">2</span>
                                    <span className="bg-slate-700 w-8 h-8 flex items-center justify-center rounded font-mono font-bold shadow-sm">3</span>
                                </div>
                                <span className="text-slate-400">Stop Reels</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="w-[300px] bg-slate-900/90 rounded-xl border border-slate-700 p-5 text-white shadow-xl">
                            <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-2 mb-4 flex justify-between items-center">
                                <span></span>
                                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-cyan-300"></span>
                            </h3>
                        </div>
                    </div>

                    {/* CONFIG PANEL */}
                    <div className="w-[300px] bg-slate-800 rounded-xl border border-slate-600 p-6 text-white shadow-2xl flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-center text-yellow-400 border-b border-slate-600 pb-4">
                            🎰 Config
                        </h2>

                        {/* Setting Selection */}
                        <div>
                            <label className="block text-slate-400 mb-3 font-semibold text-sm">Game Setting (Start Value)</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => { soundManager.playClick(); setSetting(num); }}
                                        className={`
                                        py-3 rounded-lg font-black text-xl transition-all
                                        ${setting === num
                                                ? 'bg-gradient-to-br from-pink-500 to-red-600 shadow-[0_0_15px_red] scale-105'
                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-400'}
                                    `}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats Table */}
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                            <h3 className="text-xs text-slate-400 mb-3 uppercase tracking-wider text-center font-bold">Probability Stats (Set {setting})</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-blue-400 font-bold">BB Prob</span>
                                    <span className="font-mono text-white">{ODDS[setting].bb}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-green-400 font-bold">RB Prob</span>
                                    <span className="font-mono text-white">{ODDS[setting].rb}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-purple-400 font-bold">Bonus Sum</span>
                                    <span className="font-mono text-white">{ODDS[setting].total}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-yellow-400 font-bold">Payout</span>
                                    <span className="font-mono text-yellow-200">{ODDS[setting].payout}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-[10px] text-slate-500 text-center mt-auto">
                            * Based on standard Juggler mechanics
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
