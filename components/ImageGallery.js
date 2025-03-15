// components/ImageGallery.js
import { useState, useEffect } from 'react';
import styles from '../styles/Gallery.module.css';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState([]);

  // Precargar imágenes para verificar cuáles funcionan
  useEffect(() => {
    const preloadImages = async () => {
      const loadedStatuses = await Promise.all(
        images.map((image) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = image.url;
          });
        })
      );
      setImagesLoaded(loadedStatuses);
    };

    preloadImages();
  }, [images]);

  const goToPrevious = () => {
    const validIndices = images.map((_, i) => i).filter(i => imagesLoaded[i] !== false);
    if (validIndices.length === 0) return;

    const currentPosition = validIndices.indexOf(currentIndex);
    const prevPosition = currentPosition <= 0 ? validIndices.length - 1 : currentPosition - 1;
    setCurrentIndex(validIndices[prevPosition]);
  };

  const goToNext = () => {
    const validIndices = images.map((_, i) => i).filter(i => imagesLoaded[i] !== false);
    if (validIndices.length === 0) return;

    const currentPosition = validIndices.indexOf(currentIndex);
    const nextPosition = currentPosition >= validIndices.length - 1 ? 0 : currentPosition + 1;
    setCurrentIndex(validIndices[nextPosition]);
  };

  const goToSlide = (index) => {
    if (imagesLoaded[index] !== false) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className={styles.galleryContainer}>
      <h3 className={styles.galleryTitle}>Galería del Premio</h3>
      
      <div className={styles.gallerySlider}>
        <div className={styles.galleryLeft} onClick={goToPrevious}>❮</div>
        
        {images.map((image, index) => (
          <div 
            key={index}
            className={`${styles.galleryImage} ${currentIndex === index ? styles.galleryImageActive : ''}`}
            style={{ 
              backgroundImage: `url(${image.url})`,
              display: currentIndex === index ? 'block' : 'none'
            }}
          />
        ))}
        
        <div className={styles.galleryRight} onClick={goToNext}>❯</div>
      </div>
      
      <div className={styles.galleryDescription}>
        {images[currentIndex]?.description || 'Hermoso MacBook Air 13" con todas sus características'}
      </div>
      
      <div className={styles.galleryDots}>
        {images.map((_, index) => (
          <div 
            key={index}
            className={`${styles.galleryDot} ${currentIndex === index ? styles.galleryDotActive : ''} ${imagesLoaded[index] === false ? styles.galleryDotDisabled : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
