const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Разрешаем только POST запросы
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, history = [] } = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY;

    // Пытаемся прочитать данные о Туркестане
    let turkistanData = "";
    try {
      const dataPath = path.resolve(__dirname, '../../res.json');
      const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      
      // Создаем максимально сжатую выжимку для экономии места
      const sites = rawData.slice(0, 40).map(item => {
        return `${item.name_ru || item.name_en} (${item.type}): ${item.description_ru ? item.description_ru.substring(0, 80) : ''}... Цена: ${item.priceTag || 'н/д'}`;
      }).join('\n');
      
      turkistanData = `Вот список некоторых объектов в Туркестане:\n${sites}`;
    } catch (e) {
      console.error("Data load error:", e);
      turkistanData = "Данные о конкретных объектах временно недоступны, но отвечай на основе общих знаний о Туркестане.";
    }

    const systemPrompt = `Ты — дружелюбный ИИ-гид по Туркестану (Казахстан). 
    Твоя задача — помогать туристам находить интересные места, отели и рестораны.
    Отвечай вежливо, давай конкретные рекомендации.
    Используй данные ниже, если они подходят под запрос.
    
    КОНТЕКСТ ОБЪЕКТОВ:
    ${turkistanData}
    
    Правила:
    1. Если не знаешь точного ответа, предлагай общие популярные места (Мавзолей Ходжи Ахмеда Ясави, Керуен-Сарай и т.д.).
    2. Отвечай на языке пользователя (по умолчанию на русском).
    3. Будь кратким, но гостеприимным.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: data.choices[0].message.content
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch AI response' })
    };
  }
};
