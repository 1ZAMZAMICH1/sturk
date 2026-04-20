const fs = require('fs');
const path = require('path');

const GIST_ID = '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_TOKEN_HERE';

async function sync() {
    console.log("\x1b[35m%s\x1b[0m", "🚀 ИНИЦИАЛИЗАЦИЯ ПРЯМОЙ СИНХРОНИЗАЦИИ БД...");

    const hotelsPath = path.join(__dirname, 'new_hotels.json');
    const restosPath = path.join(__dirname, 'new_restos.json');

    const newHotels = fs.existsSync(hotelsPath) ? JSON.parse(fs.readFileSync(hotelsPath, 'utf8')) : [];
    const newRestos = fs.existsSync(restosPath) ? JSON.parse(fs.readFileSync(restosPath, 'utf8')) : [];

    console.log(`🔎 Обнаружено в файлах: ${newHotels.length} отелей, ${newRestos.length} ресторанов.`);

    async function getFile(name) {
        try {
            const r = await fetch(`https://gist.githubusercontent.com/1ZAMZAMICH1/${GIST_ID}/raw/${name}.json?rnd=${Math.random()}`);
            if (!r.ok) return [];
            return await r.json();
        } catch (e) { return []; }
    }

    console.log("⏳ Получаем текущее состояние базы...");
    let dbHotels = await getFile('hotels');
    let dbRestos = await getFile('restaurants');
    let dbPoints = await getFile('map_points');

    const merge = (db, fresh) => {
        const existingNames = new Set(db.map(x => (x.name_ru || x.name || '').trim().toLowerCase()));
        const filtered = fresh.filter(x => {
            const name = (x.name_ru || x.name || '').trim().toLowerCase();
            return name.length > 0 && !existingNames.has(name);
        });
        return [...db, ...filtered];
    };

    const addedHotels = finalHotelsCount = merge(dbHotels, newHotels).length - dbHotels.length;
    const addedRestos = finalRestosCount = merge(dbRestos, newRestos).length - dbRestos.length;

    const finalHotels = merge(dbHotels, newHotels);
    const finalRestos = merge(dbRestos, newRestos);

    console.log(`➕ Будет добавлено новых записей: ${addedHotels} отелей, ${addedRestos} ресторанов.`);

    const generatePoints = (items, type) => {
        return items.map(item => {
            const idField = type === 'hotel' ? 'hotelId' : 'restaurantId';
            const existing = dbPoints.find(p => String(p[idField]) === String(item.id) || (p.title_ru === (item.name_ru || item.name)));
            if (existing) return null;

            if (!item.lat || !item.lng) return null;

            return {
                id: 'p_' + Date.now().toString().slice(-4) + Math.floor(Math.random() * 1000),
                pos: [parseFloat(item.lat), parseFloat(item.lng)],
                type: type,
                [idField]: item.id,
                title_ru: item.name_ru || item.name,
                icon: item.image || ""
            };
        }).filter(Boolean);
    };

    const newHotelPoints = generatePoints(newHotels, 'hotel');
    const newRestoPoints = generatePoints(newRestos, 'restaurant');
    const finalPoints = [...dbPoints, ...newHotelPoints, ...newRestoPoints];

    if (addedHotels === 0 && addedRestos === 0) {
        console.log("☕️ Новых данных не обнаружено. Все объекты уже в базе.");
        return;
    }

    console.log(`📡 Отправка в Gist (ID: ${GIST_ID})...`);
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            files: {
                "hotels.json": { content: JSON.stringify(finalHotels, null, 2) },
                "restaurants.json": { content: JSON.stringify(finalRestos, null, 2) },
                "map_points.json": { content: JSON.stringify(finalPoints, null, 2) }
            }
        })
    });

    if (response.ok) {
        console.log("\x1b[32m%s\x1b[0m", "🎉 БАЗА УСПЕШНО ОБНОВЛЕНА! Новые точки на карте появятся после обновления страницы сайта.");
    } else {
        const errText = await response.text();
        console.error("❌ ОШИБКА ОБНОВЛЕНИЯ:", errText);
    }
}

sync();
