// components/CountdownTimer.js
import { useState, useEffect } from 'react';
import styles from '../styles/Countdown.module.css';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Función para calcular el tiempo restante
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      
      // Si la fecha ya pasó
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    // Calcular inicialmente
    setTimeLeft(calculateTimeLeft());
    
    // Actualizar cada segundo
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={styles.countdownContainer}>
      <h3 className={styles.countdownTitle}>Tiempo para el sorteo</h3>
      <div className={styles.countdownBoxes}>
        <div className={styles.countdownBox}>
          <div className={styles.countdownValue}>{timeLeft.days}</div>
          <div className={styles.countdownLabel}>Días</div>
        </div>
        <div className={styles.countdownBox}>
          <div className={styles.countdownValue}>{timeLeft.hours}</div>
          <div className={styles.countdownLabel}>Horas</div>
        </div>
        <div className={styles.countdownBox}>
          <div className={styles.countdownValue}>{timeLeft.minutes}</div>
          <div className={styles.countdownLabel}>Minutos</div>
        </div>
        <div className={styles.countdownBox}>
          <div className={styles.countdownValue}>{timeLeft.seconds}</div>
          <div className={styles.countdownLabel}>Segundos</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
