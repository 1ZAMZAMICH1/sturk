// src/hooks/useInView.js
// Универсальный хук для отложенного рендеринга WebGL Canvas.
// Компонент монтируется только когда его контейнер входит в зону видимости
// пользователя. Это предотвращает одновременный запуск 5 WebGL контекстов
// при первой загрузке страницы — главную причину "пустых" сцен.

import { useState, useEffect, useRef } from 'react';

/**
 * @param {object} options
 * @param {string} options.rootMargin  - Отступ от границ экрана для раннего старта. 
 *                                       "200px" означает "начать за 200px до входа в экран"
 * @param {boolean} options.once       - Если true — Canvas больше НЕ размонтируется при уходе с экрана
 */
export const useInView = ({ rootMargin = '200px', once = true } = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          // Если once=true, после первого показа наблюдение прекращается
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return { ref, inView };
};
