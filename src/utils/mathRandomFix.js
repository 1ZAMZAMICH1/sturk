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

// Счетчик вызовов для отладки
let callCount = 0;
const maxCalls = 10000; // Примерно столько нужно для инициализации облаков

// Подменяем Math.random с ограничением по количеству вызовов
Math.random = () => {
  callCount++;
  
  // После большого количества вызовов возвращаем оригинальный random
  if (callCount > maxCalls) {
    return originalRandom();
  }
  
  return seededRng.next();
};

console.log('Math.random patched for cloud stability');

// Функция для принудительного возврата (можно вызвать извне)
window.__restoreMathRandom = () => {
  Math.random = originalRandom;
  console.log('Math.random restored manually');
};

export default {};