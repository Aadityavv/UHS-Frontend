import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const useAutoLogout = (timeout = 5 * 60 * 1000) => { // 5 min
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // if you store role too
    // Add any other cleanup
    navigate("/");
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click"];

    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer(); // Start timer on load

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
};

export default useAutoLogout;
