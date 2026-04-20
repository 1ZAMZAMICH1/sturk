const GIST_ID = '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_TOKEN_HERE';

async function fixMap() {
    console.log("\x1b[36m%s\x1b[0m", "🛠 ЗАПУСК ИСПРАВЛЕНИЯ КАРТЫ...");

    async function getFile(name) {
        try {
            const r = await fetch(`https://gist.githubusercontent.com/1ZAMZAMICH1/${GIST_ID}/raw/${name}.json?rnd=${Math.random()}`);
            if (!r.ok) return [];
            return await r.json();
        } catch (e) { return []; }
    }

    console.log("⏳ Загружаем данные из облака...");
    const hotels = await getFile('hotels');
    const restaurants = await getFile('restaurants');
    const points = await getFile('map_points');

    console.log(`Статистика БД: Отелей: ${hotels.length}, Ресторанов: ${restaurants.length}, Точек на карте: ${points.length}`);

    let newPointsCount = 0;
    const updatedPoints = [...points];

    // Хелпер для проверки существования точки
    const hasPoint = (id, type) => {
        const idField = type === 'hotel' ? 'hotelId' : 'restaurantId';
        return updatedPoints.some(p => String(p[idField]) === String(id));
    };

    // 1. Проверяем Отели
    hotels.forEach(h => {
        if (!h.lat || !h.lng) return;
        if (!hasPoint(h.id, 'hotel')) {
            console.log(`📍 Создаем точку для отеля: ${h.name_ru || h.name}`);
            updatedPoints.push({
                id: 'p_h_' + h.id + '_' + Math.floor(Math.random() * 1000),
                pos: [parseFloat(h.lat), parseFloat(h.lng)],
                type: 'hotel',
                hotelId: h.id,
                title_ru: h.name_ru || h.name,
                icon: h.image || ""
            });
            newPointsCount++;
        }
    });

    // 2. Проверяем Рестораны
    restaurants.forEach(r => {
        if (!r.lat || !r.lng) return;
        if (!hasPoint(r.id, 'restaurant')) {
            console.log(`📍 Создаем точку для ресторана: ${r.name_ru || r.name}`);
            updatedPoints.push({
                id: 'p_r_' + r.id + '_' + Math.floor(Math.random() * 1000),
                pos: [parseFloat(r.lat), parseFloat(r.lng)],
                type: 'restaurant',
                restaurantId: r.id,
                title_ru: r.name_ru || r.name,
                icon: r.image || ""
            });
            newPointsCount++;
        }
    });

    if (newPointsCount === 0) {
        console.log("✅ Все объекты уже есть на карте. Исправление не требуется.");
        return;
    }

    console.log(`🚀 Отправляем ${newPointsCount} новых точек в базу...`);
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            files: {
                "map_points.json": { content: JSON.stringify(updatedPoints, null, 2) }
            }
        })
    });

    if (response.ok) {
        console.log("\x1b[32m%s\x1b[0m", `🎉 ГОТОВО! Карта синхронизирована. Добавлено ${newPointsCount} меток.`);
    } else {
        console.error("❌ Ошибка записи:", await response.text());
    }
}

fixMap();
