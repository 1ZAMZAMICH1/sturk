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

    // Пытаемся прочитать данные о Туркестане и новости/статьи
    let turkistanData = "";
    let newsData = "";
    const GIST_ID = '422713639bb29643abef3fef6c220400';

    try {
      // 1. Загружаем основные объекты (отели, рестораны)
      const dataPath = path.resolve(__dirname, '../../res.json');
      const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const sites = rawData.slice(0, 30).map(item => 
        `- ${item.name_ru || item.name_en} (${item.type}): ${item.priceTag || 'н/д'}`
      ).join('\n');
      turkistanData = sites;

      // 2. Загружаем свежие новости и мероприятия из Gist
      try {
        const newsResponse = await fetch(`https://gist.githubusercontent.com/1ZAMZAMICH1/${GIST_ID}/raw/articles.json?rnd=${Math.random()}`);
        if (newsResponse.ok) {
          const articles = await newsResponse.json();
          newsData = articles.map(a => 
            `* [${a.date}] ${a.title}: ${a.excerpt || ''}`
          ).join('\n');
        }
      } catch (e) {
        console.error("News load error:", e);
      }
      
    } catch (e) {
      console.error("Data load error:", e);
    }

    const systemPrompt = `Ты — элитный ИИ-гид по Туркестану. 
    Твоя задача — предоставлять информацию ВЕЛИКОЛЕПНО СТРУКТУРИРОВАННО.

    ДАННЫЕ ОБ ОБЪЕКТАХ:
    ${turkistanData}

    АКТУАЛЬНЫЕ НОВОСТИ И МЕРОПРИЯТИЯ:
    ${newsData}

    ПРАВИЛА ФОРМАТИРОВАНИЯ (ОБЯЗАТЕЛЬНО):
    1. Используй **жирный шрифт** для названий мест и важных дат.
    2. Используй маркированные списки для перечислений.
    3. Разделяй мысли абзацами (двойной перенос строки).
    4. Если спрашивают про мероприятия, ОБЯЗАТЕЛЬНО проверяй раздел "АКТУАЛЬНЫЕ НОВОСТИ".
    5. Текст должен выглядеть премиально, как в дорогом путеводителе.
    6. НИКАКИХ эмодзи (по запросу пользователя).
    
    Отвечай на языке пользователя. Будь экспертным, но лаконичным.`;

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
        temperature: 0.5, // Немного снизим для более стабильного форматирования
        max_tokens: 1000
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
