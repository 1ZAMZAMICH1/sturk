// src/utils/mathRandomFix.js
// Этот файл нужно импортировать САМЫМ ПЕРВЫМ в main.jsx

class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

// Сохраняем оригинальный Math.random
const originalRandom = Math.random;

// Создаем детерминированный генератор
const seededRng = new SeededRandom(42);

// Подменяем Math.random
Math.random = () => seededRng.next();

// Возвращаем оригинальный Math.random через 1 секунду
// (этого достаточно для инициализации облаков)
setTimeout(() => {
  Math.random = originalRandom;
  console.log('Math.random restored');
}, 1000);

export default {};