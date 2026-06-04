import { useState, useEffect, useRef } from 'react';

// Reusable countdown timer hook.
// Calls onExpire when it hits zero and cleans up its own interval.
const useCountdown = (seconds, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const cbRef = useRef(onExpire);
  useEffect(() => { cbRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (timeLeft <= 0) { cbRef.current?.(); return; }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return {
    timeLeft,
    formatted: `${mm}:${ss}`,
    isExpired: timeLeft <= 0,
    pct: (timeLeft / seconds) * 100,
  };
};

export default useCountdown;
