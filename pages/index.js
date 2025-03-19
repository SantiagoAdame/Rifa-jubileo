// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update, get, set } from 'firebase/database';
import styles from '../styles/Rifa.module.css';
import CountdownTimer from '../components/CountdownTimer';

// Configuración de Firebase - usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Definición de las series de números disponibles para la rifa
const seriesNumeros = [
  { inicio: 3401, fin: 3600 },
  { inicio: 3801, fin: 4000 },
  { inicio: 6001, fin: 6400 }
];

// Fecha del sorteo para el contador regresivo
const fechaSorteo = "July 13, 2025 13:00:00";

// Inicializar Firebase solo del lado del cliente
let app;
let database;

export default function Home() {
  const [numerosSeleccionados, setNumerosSeleccionados] = useState([]);
  const [numerosApartados, setNumerosApartados] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '', direccion: '' });
  const [searchNumero, setSearchNumero] = useState('');

  useEffect(() => {
    // Inicializar Firebase solo del lado del cliente
    if (typeof window !== 'undefined') {
      app = initializeApp(firebaseConfig);
      database = getDatabase(app);
      
      // Cargar datos iniciales
      cargarNumerosApartados();
      
      // Escuchar cambios en tiempo real
      const numerosRef = ref(database, 'numerosApartados');
      const unsubscribe = onValue(numerosRef, (snapshot) => {
        if (snapshot.exists()) {
          const allData = snapshot.val();
          
          // Filtrar datos para solo incluir estado de apartado
          // Con compatibilidad para formatos antiguos y nuevos
          const filteredData = {};
          Object.keys(allData).forEach(numero => {
            filteredData[numero] = true; // Simplificado: si existe en la BD, está apartado
          });
          
          setNumerosApartados(filteredData);
        } else {
          setNumerosApartados({});
        }
      });
      
      // Limpiar suscripción al desmontar
      return () => unsubscribe();
    }
  }, []);

  const cargarNumerosApartados = async () => {
    if (database) {
      try {
        setIsLoading(true);
        console.log("Intentando obtener datos de Firebase...");
        const numerosRef = ref(database, 'numerosApartados');
        console.log("Referencia creada:", numerosRef);
        
        const snapshot = await get(numerosRef).catch(error => {
          console.error("Error específico al obtener datos:", error);
          return { val: () => ({}) };
        });
        
        if (snapshot.exists()) {
          const allData = snapshot.val();
          
          // Simplificado: si un número existe en la BD, está apartado
          const filteredData = {};
          Object.keys(allData).forEach(numero => {
            filteredData[numero] = true;
          });
          
          console.log("Datos obtenidos:", Object.keys(filteredData).length, "registros");
          setNumerosApartados(filteredData);
        } else {
          setNumerosApartados({});
        }
      } catch (error) {
        console.error("Error general al cargar datos:", error);
        setNumerosApartados({});
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Mantenemos la funcionalidad original de seleccionar/deseleccionar
  const handleNumeroClick = (numero) => {
    // No permitir seleccionar números ya apartados
    if (numerosApartados[numero]) {
      return;
    }
    
    setNumerosSeleccionados(prev => {
      if (prev.includes(numero)) {
        return prev.filter(num => num !== numero);
      } else {
        return [...prev, numero];
      }
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchNumero(e.target.value);
  };

  const handleReiniciarClick = () => {
    setNumerosSeleccionados([]);
  };

  const handleApartarClick = () => {
    if (numerosSeleccionados.length > 0) {
      setShowModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmar = async () => {
    if (!formData.nombre || !formData.telefono || !formData.email) {
      alert('Por favor, completa los campos requeridos.');
      return;
    }

    try {
      setIsLoading(true);
      setShowModal(false);
      
      // Verificar disponibilidad otra vez
      const numerosNoDisponibles = [];
      
      // Verificar cada número individualmente para evitar problemas de permisos
      for (const numero of numerosSeleccionados) {
        const numeroRef = ref(database, `numerosApartados/${numero}`);
        const snapshot = await get(numeroRef);
        if (snapshot.exists()) {
          numerosNoDisponibles.push(numero);
        }
      }
      
      if (numerosNoDisponibles.length > 0) {
        alert(`Los números ${numerosNoDisponibles.join(', ')} ya han sido apartados. Por favor, elige otros números.`);
        setNumerosSeleccionados(prev => prev.filter(num => !numerosNoDisponibles.includes(num)));
        return;
      }
      
      // Guardar cada número individualmente con la estructura correcta
      for (const numero of numerosSeleccionados) {
        const numeroRef = ref(database, `numerosApartados/${numero}`);
        await set(numeroRef, {
          apartado: true,
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion || null,
          fecha: new Date().toISOString()
        });
      }
      
      alert('¡Números apartados con éxito! Por favor realiza tu pago para confirmar tu participación.');
      setNumerosSeleccionados([]);
      setFormData({ nombre: '', telefono: '', email: '', direccion: '' });
    } catch (error) {
      console.error("Error al apartar números:", error);
      alert('Ocurrió un error. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para generar todos los números según las series configuradas
  const generarTodosLosNumeros = () => {
    const todosLosNumeros = [];
    
    seriesNumeros.forEach(serie => {
      for (let num = serie.inicio; num <= serie.fin; num++) {
        todosLosNumeros.push(num);
      }
    });
    
    return todosLosNumeros;
  };

  // Renderizar números
  const renderNumeros = () => {
    const todosLosNumeros = generarTodosLosNumeros();
    return todosLosNumeros
      .filter(numero => !searchNumero || numero.toString().includes(searchNumero))
      .map(numero => {
        let className = `${styles.numero}`;
        let handler = null;
        let title = '';
        
        // Determinar el estado y apariencia del número
        if (numerosApartados[numero]) {
          className += ` ${styles.apartado}`;
          title = `Apartado`;
          // No asignar handler para números apartados
        } else if (numerosSeleccionados.includes(numero)) {
          className += ` ${styles.seleccionado}`;
          handler = () => handleNumeroClick(numero);
          title = 'Seleccionado - Clic para deseleccionar';
        } else {
          className += ` ${styles.disponible}`;
          handler = () => handleNumeroClick(numero);
          title = 'Disponible - Clic para seleccionar';
        }
        
        return (
          <div 
            key={numero} 
            className={className}
            onClick={handler}
            title={title}
          >
            {numero}
          </div>
        );
      });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Peregrinos de Esperanza - Rifa</title>
        <meta name="description" content="Rifa para Peregrinos de Esperanza" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Peregrinos de Esperanza</h1>
        <h2 className={styles.subtitle}>Rifa entre amigos</h2>
        
        <CountdownTimer targetDate={fechaSorteo} />
        
        <div className={styles.premioInfo}>
          <h2 className={styles.premioTitle}>¡Gran Premio!</h2>
          <p className={styles.premioName}>MacBook Air 13"</p>
          <div className={styles.premioDetalles}>
            <p>📅 Fecha del sorteo: 13 de julio del 2025</p>
            <p>⛪ Lugar: Parroquia de la Sagrada Familia</p>
            <p>🕐 Hora: Después de la misa de 1:00 PM</p>
            <p>📱 Transmisión en vivo a través de <a href="https://www.facebook.com/share/153xWPzvta/?mibextid=wwXIfr" target="_blank" className={styles.link}>la página de Facebook de la parroquia</a></p>
            <p>💰 Donativo por número: $100.00 MXN</p>
          </div>
        </div>
        
        <div className={styles.leyenda}>
          <div className={styles.leyendaItem}>
            <div className={styles.leyendaColor} style={{ backgroundColor: '#f2f5ff' }}></div>
            <span>Disponible</span>
          </div>
          <div className={styles.leyendaItem}>
            <div className={styles.leyendaColor} style={{ backgroundColor: '#6a5af9' }}></div>
            <span>Seleccionado</span>
          </div>
          <div className={styles.leyendaItem}>
            <div className={styles.leyendaColor} style={{ backgroundColor: '#ff4f81' }}></div>
            <span>Apartado</span>
          </div>
        </div>
        
        <div className={styles.info}>
          <p><strong>Instrucciones:</strong> Selecciona los números que deseas apartar para la rifa. Cuando estés listo, haz clic en "Apartar Números" y proporciona tus datos.</p>
        </div>
        
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Buscar número específico..." 
            className={styles.searchInput}
            value={searchNumero}
            onChange={handleSearchChange}
          />
        </div>
        
        {isLoading ? (
          <div className={styles.loader}>Cargando números...</div>
        ) : (
          <div className={styles.numerosContainer}>
            {renderNumeros()}
          </div>
        )}
        
        <div className={styles.acciones}>
          <button 
            className={styles.button} 
            onClick={handleReiniciarClick}
            disabled={numerosSeleccionados.length === 0}
          >
            Reiniciar Selección
          </button>
          <button 
            className={styles.button} 
            onClick={handleApartarClick}
            disabled={numerosSeleccionados.length === 0}
          >
            Apartar Números ({numerosSeleccionados.length})
          </button>
        </div>
      </main>

      {/* Modal para datos */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Introduce tus datos</h2>
            <div className={styles.inputGroup}>
              <label htmlFor="nombre">Nombre:</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="telefono">Teléfono:</label>
              <input 
                type="tel" 
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="direccion">Dirección (opcional):</label>
              <input 
                type="text" 
                id="direccion" 
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </div>
            
            <div className={styles.infoPayment}>
              <h3>Información de Pago</h3>
              <p>Donativo por número: $100.00 MXN</p>
              <p>Total a donar: ${numerosSeleccionados.length * 100}.00 MXN</p>
              
              <div className={styles.paymentOptions}>
                <h4>Opciones de pago:</h4>
                <div className={styles.paymentOption}>
                  <p><strong>Transferencia bancaria (Banorte)</strong></p>
                  <p>Beneficiario: Santiago Adame Alemán</p>
                  <p>Cuenta: 0014797925</p>
                  <p>CLABE: 072180000147979256</p>
                  <p>Tarjeta: 4189 1430 9218 3857</p>
                </div>
                
                <div className={styles.paymentOption}>
                  <p><strong>Transferencia bancaria (BBVA)</strong></p>
                  <p>Beneficiario: María José Adame Alemán</p>
                  <p>CLABE: 012 540 01533141418 3</p>
                  <p>Tarjeta de débito: 4152 3143 8853 9465</p>
                </div>
              </div>
              
              <div className={styles.nextSteps}>
                <p><strong>Pasos siguientes:</strong></p>
                <ol>
                  <li>Realiza tu transferencia por ${numerosSeleccionados.length * 100}.00 MXN</li>
                  <li>Envía tu comprobante por WhatsApp al: +52 56 4417 8896</li>
                  <li>Incluye tu nombre completo en el mensaje</li>
                  <li>Recibirás la confirmación de tus números</li>
                </ol>
              </div>
            </div>
            
            <div className={styles.modalButtons}>
              <button 
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className={`${styles.button} ${styles.confirmarButton}`}
                onClick={handleConfirmar}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loader global */}
      {isLoading && (
        <div className={styles.globalLoader}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      )}
    </div>
  );
}