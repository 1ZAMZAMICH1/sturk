const fs = require('fs');
const GIST_ID = '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function generate() {
    console.log("📥 Загрузка всех данных из Gist (включая гидов)...");

    async function getFile(name) {
        const r = await fetch(`https://gist.githubusercontent.com/1ZAMZAMICH1/${GIST_ID}/raw/${name}.json?rnd=${Math.random()}`);
        return r.ok ? await r.json() : [];
    }

    const attractions = await getFile('attractions');
    const hotels = await getFile('hotels');
    const restaurants = await getFile('restaurants');
    const guides = await getFile('guides');

    console.log(`📊 Статистика: Дост-тей: ${attractions.length}, Отелей: ${hotels.length}, Ресторанов: ${restaurants.length}, Гидов: ${guides.length}`);

    const getRandIds = (arr, count = 3) => {
        if (!arr.length) return [];
        return arr.sort(() => 0.5 - Math.random()).slice(0, count).map(x => x.id);
    };

    // Функция поиска гидов для конкретной достопримечательности
    const findGuidesForAttraction = (attr) => {
        const attrName = (attr.name_ru || attr.title_ru || attr.name || "").toLowerCase();

        // Ищем тех, кто реально водит (по упоминанию имени в турах)
        let relevantGuides = guides.filter(g => {
            const toursText = JSON.stringify(g.tours || {}).toLowerCase();
            return toursText.includes(attrName);
        }).map(g => g.id);

        // Если нашли меньше 2-х, добавляем рандомных для наглядности
        if (relevantGuides.length < 2) {
            const extra = getRandIds(guides.filter(g => !relevantGuides.includes(g.id)), 2);
            relevantGuides = [...relevantGuides, ...extra];
        }

        return relevantGuides.slice(0, 3); // Ограничим до 3-х
    };

    console.log("🔄 Пересборка связей...");

    // 1. Достопримечательности + Отели + Рестораны + ГИДЫ
    const updatedAttractions = attractions.map(attr => ({
        ...attr,
        nearbyHotels: getRandIds(hotels, 3),
        nearbyRestaurants: getRandIds(restaurants, 3),
        nearbyGuides: findGuidesForAttraction(attr)
    }));

    // 2. Отели + Дост-ти + Рестораны
    const updatedHotels = hotels.map(hotel => ({
        ...hotel,
        nearbyAttractions: getRandIds(attractions, 3),
        nearbyRestaurants: getRandIds(restaurants, 3)
    }));

    // 3. Рестораны + Дост-ти + Отели
    const updatedRestaurants = restaurants.map(resto => ({
        ...resto,
        nearbyAttractions: getRandIds(attractions, 3),
        nearbyHotels: getRandIds(hotels, 3)
    }));

    console.log("📤 Синхронизация с облаком...");
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            files: {
                "attractions.json": { content: JSON.stringify(updatedAttractions, null, 2) },
                "hotels.json": { content: JSON.stringify(updatedHotels, null, 2) },
                "restaurants.json": { content: JSON.stringify(updatedRestaurants, null, 2) }
            }
        })
    });

    if (response.ok) {
        console.log("✅ ВСЁ ГОТОВО! Гиды привязаны к достопримечательностям, база обновлена.");
    } else {
        console.error("❌ Ошибка записи:", await response.text());
    }
}

if (!GITHUB_TOKEN) {
    console.error("❌ Ошибка: GITHUB_TOKEN не найден.");
} else {
    generate();
}
