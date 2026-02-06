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
        setAngle(prev => (prev - speed.current) % 360); // Reverse direction (Up -> Down)
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

    // Coin Box State
    const [coins, setCoins] = useState(0);
    const [isCharging, setIsCharging] = useState(false); // Locking state

    // Config State
    const [showConfig, setShowConfig] = useState(false);

    // Secret Tap Ref
    const tapRef = useRef({ count: 0, lastTime: 0 });

    // Bonus Stage State: { type: 'BB' | 'RB', count: 0 } or null
    const [bonusStage, setBonusStage] = useState(null);

    const [bonusFlag, setBonusFlag] = useState(null);
    const [spinCommand, setSpinCommand] = useState(null);
    const [winHighlights, setWinHighlights] = useState([]);

    const stateRef = useRef({ spinning, canStop, isPlaying, bet, bonusFlag, spinCommand, credits, payout, isReplay, bonusStage, coins });
    useEffect(() => { stateRef.current = { spinning, canStop, isPlaying, bet, bonusFlag, spinCommand, credits, payout, isReplay, bonusStage, coins }; }, [spinning, canStop, isPlaying, bet, bonusFlag, spinCommand, credits, payout, isReplay, bonusStage, coins]);

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
            // Vertical Layout: Machine Height + Counter (~120px) + CoinBox (~80px) + Gaps
            const totalH = imgSize.h + 260;
            const hRatio = (window.innerHeight) / totalH;

            // Width: Just machine width (plus margins)
            const totalW = imgSize.w + 20;
            const wRatio = (window.innerWidth) / totalW;

            setScale(Math.min(wRatio, hRatio));
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial
        return () => window.removeEventListener('resize', handleResize);
    }, [imgSize]);

    // Game Logic
    // Game Logic
    // --- BETTING LOGIC ---
    const handleSecretTap = () => {
        const now = Date.now();
        if (now - tapRef.current.lastTime < 500) {
            tapRef.current.count++;
        } else {
            tapRef.current.count = 1;
        }
        tapRef.current.lastTime = now;

        if (tapRef.current.count >= 3) {
            setShowConfig(true);
            tapRef.current.count = 0;
            soundManager.playClick();
        }
    };

    // --- BETTING LOGIC ---
    const handleBetPlus = () => {
        // Cycle 1 -> 2 -> 3 -> 1
        const current = stateRef.current.bet;
        const next = (current % 3) + 1;
        handleBetChange(next);
    }

    const handleChargeCoins = () => {
        if (isCharging) return; // Prevent double click
        setIsCharging(true);

        // Animate +50 Coins (1 by 1)
        let count = 0;
        const interval = setInterval(() => {
            setCoins(c => c + 1);
            // "Coin piling up sound" - Heavy metallic clinking
            // We use the new playMetallicClink() which has partials
            soundManager.playMetallicClink();

            count++;
            if (count >= 50) {
                clearInterval(interval);
                setIsCharging(false);
            }
        }, 70); // Fast interval
    };

    const handleInsertCoin = () => {
        const currentCoins = stateRef.current.coins;
        const currentCredits = stateRef.current.credits;

        if (currentCoins <= 0) return; // No coins
        if (currentCredits >= 50) return; // Max credit limit

        // Execute Insert
        setCoins(c => c - 1);
        setCredits(c => c + 1);
        soundManager.playInsertCoin();
    };

    const handleBetChange = (targetBet) => {
        if (stateRef.current.isPlaying) return;
        if (stateRef.current.isReplay) return; // Prevent bet change during Replay

        soundManager.playClick();

        let currentCredits = stateRef.current.credits;
        const currentBet = stateRef.current.bet;
        const currentPayout = stateRef.current.payout;

        // 1. Auto-collect Payout first (if any)
        if (currentPayout > 0) {
            const space = 50 - currentCredits;
            let addToCredit = 0;
            let overflow = 0;

            if (currentPayout <= space) {
                addToCredit = currentPayout;
            } else {
                addToCredit = Math.max(0, space);
                overflow = currentPayout - addToCredit;
            }

            if (addToCredit > 0) {
                setCredits(c => c + addToCredit);
                currentCredits += addToCredit; // Update for affordability check
            }

            if (overflow > 0) {
                let outCount = 0;
                const intervalOut = setInterval(() => {
                    setCoins(c => c + 1);
                    soundManager.playMetallicClink();
                    outCount++;
                    if (outCount >= overflow) clearInterval(intervalOut);
                }, 70);
            }
            setPayout(0);
        }

        // Bonus Stage Bet Limit: Max 2
        if (stateRef.current.bonusStage && targetBet > 2) {
            targetBet = 2;
        }

        const cost = targetBet - currentBet;

        // Check affordability (using updated credits)
        if (currentCredits < cost) return;

        // 2. Apply Bet Logic
        setBet(targetBet);
        setCredits(c => c - cost);
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
            const currentPayout = stateRef.current.payout;
            const currentCredits = stateRef.current.credits;

            const space = 50 - currentCredits;
            let addToCredit = 0;
            let overflow = 0;

            if (currentPayout <= space) {
                addToCredit = currentPayout;
            } else {
                addToCredit = Math.max(0, space);
                overflow = currentPayout - addToCredit;
            }

            if (addToCredit > 0) {
                setCredits(c => c + addToCredit);
            }

            if (overflow > 0) {
                let outCount = 0;
                const intervalOut = setInterval(() => {
                    setCoins(c => c + 1);
                    soundManager.playMetallicClink();
                    outCount++;
                    if (outCount >= overflow) clearInterval(intervalOut);
                }, 70);
            }
            setPayout(0);
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

        // 1. Check Bonus Flag (Priority) - BUT Ignore if in Bonus Stage
        if (stateRef.current.bonusStage) {
            // --- BONUS STAGE RNG ---
            // High probability of win (Grape/Cherry)
            // Payout is 14.
            const subRng = Math.random();
            // 90% chance to win Grape/Cherry to sustain play
            if (subRng < 0.8) command = 'GRAPE';
            else if (subRng < 0.9) command = 'CHERRY';
            else command = 'MISS'; // Occasional miss
        } else if (stateRef.current.bonusFlag) {
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

                // --- BONUS TRIGGER ---
                if (s1 === '7' && s2 === '7' && s3 === '7') {
                    // Start BB (No Payout yet)
                    if (!bonusStage) { bonusWon = true; lineWin = true; } // Only trigger if not already in bonus
                }
                else if (s1 === '7' && s2 === '7' && s3 === 'BAR') {
                    // Start RB
                    if (!bonusStage) { bonusWon = true; lineWin = true; }
                }
                // --- NORMAL / BONUS WINS ---
                else if (s1 === '🍇' && s2 === '🍇' && s3 === '🍇') {
                    totalWin += (bonusStage ? 14 : 8); // Bonus Mode Pays 14
                    lineWin = true;
                }
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
                totalWin += (bonusStage ? 14 : 2); // Bonus Mode Pays 14 for Cherry too (Simplified high payout)
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
                // --- ENTER BONUS STAGE ---
                // Determine Type based on Spin Command or alignment (Simplified: use spinCommand if available, else BB default)
                // Actually we should inspect the line. But we know what we stopped. 
                // Let's use internal check:
                let type = 'BB';
                // Check if we hit RB (7-7-BAR)
                const r0 = getReelSymbols(0, stops[0]);
                const r1 = getReelSymbols(1, stops[1]);
                const r2 = getReelSymbols(2, stops[2]);
                // Simple check: if right reel has BAR in center/top/bottom matched with 7s...
                // Ideally passing 'isBB' from evaluating loop would be cleaner, but let's re-eval or rely on command.
                // Reliable way: Check the spinCommand that triggered this.
                if (spinCommand === 'RB') type = 'RB';

                // Init Bonus Stage
                setBonusStage({ type, count: 0 });
                soundManager.playFanfare(type);

                // Update Stats (BB/RB Count)
                if (type === 'BB') setBbCount(c => c + 1);
                else setRbCount(c => c + 1);
                setCurrentSpins(0); // Reset "Current Spins" counter

                setGogoState('ON'); // Ensure Lamp ON
                setBonusFlag(null);
                setPayout(0); // No instant payout
                setBet(0);

            } else if (totalWin > 0) {
                soundManager.playWin();

                // --- BONUS STAGE PROGRESS ---
                if (bonusStage) {
                    const add = totalWin;
                    const nextCount = bonusStage.count + add;
                    const limit = bonusStage.type === 'BB' ? 280 : 80;

                    if (nextCount > limit) {
                        // --- BONUS END ---
                        setBonusStage(null);
                        setGogoState('OFF');
                        soundManager.stopFanfare(); // Or play end sound
                    } else {
                        // Continue Bonus
                        setBonusStage(prev => ({ ...prev, count: nextCount }));
                    }
                }

                // --- PAYOUT DISPLAY ---
                // We do NOT add to credits immediately. User must Bet or Pull Lever to collect.
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
                handleBetPlus()
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
        <div className="w-screen h-screen bg-neutral-900 flex items-start justify-center overflow-hidden pt-[20px]">

            <div
                className="flex flex-col items-center justify-start gap-4"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                }}
            >
                {/* DATA COUNTER (Mobile Layout) - MAX UPSCALE WIDTH MATCHED */}
                <div
                    className="bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl border-2 border-slate-600 p-2 text-white shadow-2xl mb-2 shrink-0"
                    style={{ width: `${imgSize.w}px`, fontSize: '24px', fontWeight: 'bold' }}
                >
                    <div className="bg-black rounded-lg p-4 mb-2 flex justify-between items-center relative overflow-hidden border border-slate-700">
                        <div className="relative z-10 flex flex-col items-center w-full">
                            <span className="text-lg text-red-500 font-bold tracking-widest mb-1">DATA COUNTER</span>
                            <div className="flex justify-between w-full px-12 mt-1">
                                <div className="flex flex-col items-center"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-bold text-slate-400">BIG</span>
                                    <span className="text-6xl font-['Digital-7'] text-red-500 drop-shadow-[0_0_5px_red]">{bbCount}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-bold text-slate-400">REG</span>
                                    <span className="text-6xl font-['Digital-7'] text-green-500 drop-shadow-[0_0_5px_green]">{rbCount}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xl font-bold text-slate-400">TOTAL</span>
                                    <span className="text-5xl font-['Digital-7'] text-white">{totalSpins}</span>
                                </div>
                                <div className="flex flex-col items-center"></div>
                            </div>
                        </div>
                    </div>

                    {/* Main Counter */}
                    <div className="bg-black/50 rounded p-6 flex flex-col items-center justify-center border border-slate-700">
                        <span className="text-xl text-yellow-500 font-bold mb-1">CURRENT SPINS : {currentSpins}</span>
                        <span className="text-sm text-slate-500">Total Prob: 1 / {totalSpins > 0 ? (totalSpins / (bbCount + rbCount || 1)).toFixed(1) : '-'}</span>
                    </div>
                </div>

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
                                {bonusStage ? bonusStage.count.toString().padStart(3, '0') : '000'}
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

                    {/* Bet Indicator Overlay (64, 316, 38x116) */}
                    <img
                        src={`./bet_${bet}.png`}
                        alt={`Bet ${bet}`}
                        className="absolute z-20 pointer-events-none"
                        style={{
                            left: `${(64 / imgSize.w) * 100}%`,
                            top: `${(316 / imgSize.h) * 100}%`,
                            width: `${(38 / imgSize.w) * 100}%`,
                            height: `${(116 / imgSize.h) * 100}%`
                        }}
                    />

                    {/* 4. TOUCH CONTROLS (Absolute Positioning) */}
                    {/* Insert (Credits): 438, 506 (90x48) */}
                    <div
                        className="absolute z-30 cursor-pointer active:bg-white/20 rounded-md hover:ring-2 hover:ring-yellow-500/50"
                        style={{ left: `${(438 / imgSize.w) * 100}%`, top: `${(506 / imgSize.h) * 100}%`, width: `${(90 / imgSize.w) * 100}%`, height: `${(48 / imgSize.h) * 100}%` }}
                        onClick={handleInsertCoin}
                        title="Insert Coin"
                    ></div>

                    {/* Bet 1 (Plus): 40, 590 (38x38) */}
                    <div
                        className="absolute z-30 cursor-pointer active:bg-white/20 rounded-full hover:ring-2 hover:ring-yellow-500/50"
                        style={{ left: `${(40 / imgSize.w) * 100}%`, top: `${(590 / imgSize.h) * 100}%`, width: `${(38 / imgSize.w) * 100}%`, height: `${(38 / imgSize.h) * 100}%` }}
                        onClick={handleBetPlus}
                        title="Bet +1"
                    ></div>

                    {/* Max Bet: 176, 526 (48x28) */}
                    <div
                        className="absolute z-30 cursor-pointer active:bg-white/20 rounded-md hover:ring-2 hover:ring-yellow-500/50"
                        style={{ left: `${(176 / imgSize.w) * 100}%`, top: `${(526 / imgSize.h) * 100}%`, width: `${(48 / imgSize.w) * 100}%`, height: `${(28 / imgSize.h) * 100}%` }}
                        onClick={() => handleBetChange(3)}
                        title="Max Bet"
                    ></div>

                    {/* Lever: 128, 580 (54x54) */}
                    {/* Lever: INCREASED TOUCH AREA (128, 580 origin) -> 100x100 box centered approx */}
                    <div
                        className="absolute z-30 cursor-pointer active:bg-white/20 rounded-full hover:ring-2 hover:ring-yellow-500/50"
                        style={{
                            left: `${(108 / imgSize.w) * 100}%`,
                            top: `${(560 / imgSize.h) * 100}%`,
                            width: `${(100 / imgSize.w) * 100}%`,
                            height: `${(100 / imgSize.h) * 100}%`
                        }}
                        onClick={pullLever}
                        title="Start Spin"
                    ></div>

                    {/* HIDDEN TOUCH TRIGGER (Triple Tap Config) */}
                    <div
                        className="absolute z-50 cursor-pointer"
                        style={{
                            left: '20%',
                            bottom: '0%',
                            width: '60%',
                            height: '150px',
                            opacity: 0
                        }}
                        onClick={handleSecretTap}
                    ></div>

                    {/* Stop Buttons: 222, 578 (186x54) - Flex Container */}
                    {/* Stop Buttons: INCREASED TOUCH AREA. top 560, height 90 */}
                    <div
                        className="absolute z-30 flex justify-between"
                        style={{ left: `${(218 / imgSize.w) * 100}%`, top: `${(560 / imgSize.h) * 100}%`, width: `${(194 / imgSize.w) * 100}%`, height: `${(90 / imgSize.h) * 100}%` }}
                    >
                        <div className="flex-1 cursor-pointer active:bg-white/20 hover:ring-2 hover:ring-blue-500/50 rounded" onMouseDown={() => stopReel(0)}></div>
                        <div className="flex-1 cursor-pointer active:bg-white/20 hover:ring-2 hover:ring-blue-500/50 rounded mx-1" onMouseDown={() => stopReel(1)}></div>
                        <div className="flex-1 cursor-pointer active:bg-white/20 hover:ring-2 hover:ring-blue-500/50 rounded" onMouseDown={() => stopReel(2)}></div>
                    </div>

                </div>

                {/* COIN BOX (Under Machine) - ROW LAYOUT */}
                <div
                    className="bg-black border-4 border-neutral-800 rounded-b-xl flex flex-row items-center justify-between px-4 py-3 shadow-2xl"
                    style={{
                        width: `${imgSize.w}px`, // Match machine width
                        height: '60px',
                        marginTop: '0', // Adjust overlap
                        fontSize: '24px',
                        fontWeight: 'bold',
                        zIndex: 5
                    }}
                >
                    {/* CENTER: COIN DISPLAY (Single Line) */}
                    <div className="flex-1 flex items-center justify-center pl-2 gap-3">
                        <span className="text-gray-500 text-sm font-bold tracking-widest whitespace-nowrap">MY COINS :&nbsp;</span>
                        <span className="text-3xl text-yellow-500 font-mono font-bold drop-shadow-[0_0_10px_rgba(234,179,8,0.6)] leading-none">
                            {coins.toLocaleString()}
                        </span>
                        <span className="text-yellow-700 text-lg font-bold leading-none">&nbsp;EA</span>
                    </div>

                    {/* RIGHT: BUTTON */}
                    <button
                        onClick={handleChargeCoins}
                        disabled={isCharging}
                        className={`shrink-0 bg-green-600 hover:bg-green-500 text-white text-lg font-bold py-3 px-6 rounded-lg shadow-[0_3px_0_rgb(21,80,30)] active:shadow-none active:translate-y-[3px] transition-all border border-green-700 mr-[10px] ${isCharging ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-slow'}`}
                        style={{ height: '40px', fontSize: '20px', backgroundColor: 'green' }}
                    >
                        {isCharging ? '...' : 'CHARGE'}
                    </button>
                </div>

                {/* CONFIG MODAL */}
                {showConfig && (
                    <div className="fixed inset-0 z-[100] bg-black h-[100dvh] w-[80%] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowConfig(false) }}>
                        <div
                            className="w-full max-w-[800px] bg-neutral-900 rounded-xl border-4 border-slate-500 p-6 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col gap-6 relative"
                            style={{ zIndex: 100, backgroundColor: 'black', fontSize: '26px', padding: '20px' }}
                        >
                            <button
                                onClick={() => setShowConfig(false)}
                                className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white"
                            >✕</button>

                            <h2 className="text-2xl font-bold text-center text-yellow-400 border-b border-slate-600 pb-4">
                                🎰 Config
                            </h2>

                            <div>
                                <label className="block text-slate-400 mb-3 font-semibold text-sm">Game Setting (Start Value)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => { soundManager.playClick(); setSetting(num); }}
                                            style={{ fontSize: '30px', height: '60px' }}
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
                                <h3 className="text-xs text-slate-400 mb-3 uppercase tracking-wider text-center font-bold"> Set {setting} Stats</h3>
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
                        </div>
                    </div>
                )}

            </div>
        </div >
    );
}
