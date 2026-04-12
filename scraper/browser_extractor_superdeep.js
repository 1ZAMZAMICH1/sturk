/**
 * ========================================================
 * УЛЬТИМАТИВНЫЙ БРАУЗЕРНЫЙ ЭКСТРАКТОР (IFRAME + SEO DATA)
 * ========================================================
 */

(async function() {
    console.log("%c 🚀 ИНИЦИАЛИЗАЦИЯ УЛЬТИМАТИВНОГО ЭКСТРАКТОРА v3...", "color: #ff3366; font-size: 20px; font-weight: bold;");
    
    const cards = document.querySelectorAll('[data-testid="property-card"]');
    const results = [];
    const citySearch = document.querySelector('[data-testid="searchbox-layout-vertical"] input')?.value || "Туркестан";
    const city = citySearch.includes("Шым") ? "Шымкент" : "Туркестан";

    console.log(`Найдено ${cards.length} объектов. Начинаем полное сканирование...`);
    
    // Создаем невидимый фрейм-контейнер, чтобы отрисовывались картинки (добавим скролл вниз)
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100px';
    container.style.height = '100px';
    container.style.zIndex = '-9999';
    container.style.opacity = '0.01'; // Сделаем чуть прозрачным, чтобы браузер не блокировал как невидимое
    document.body.appendChild(container);

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const defaultName = card.querySelector('[data-testid="title"]')?.innerText.trim() || "";
        const urlRaw = card.querySelector('[data-testid="title-link"]')?.href || "";
        if (!urlRaw) continue;

        const url = urlRaw.split('?')[0] + "?lang=ru"; 
        console.log(`[%c${i+1}/${cards.length}%c] Парсинг: ${defaultName}...`, "color: #4CAF50", "color: inherit");
        
        try {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.width = "100%";
            iframe.height = "100%";
            container.appendChild(iframe);

            await new Promise(resolve => {
                iframe.onload = () => setTimeout(resolve, 3500); // Даем 3.5 сек на подгрузку
            });

            const doc = iframe.contentDocument || iframe.contentWindow.document;

            // ХАК: Проскроллим внутри фрейма, чтобы подгрузились ленивые (lazy) картинки
            iframe.contentWindow.scrollTo(0, 500);

            // 1. Попробуем вытащить данные из скрытого SEO блока (там всегда есть фото и описание!)
            let seoData = {};
            try {
                const ldJsonNodes = doc.querySelectorAll('script[type="application/ld+json"]');
                for (let node of ldJsonNodes) {
                    const parsed = JSON.parse(node.innerText);
                    // Ищем блок где есть описание или картинка
                    if (parsed.description && parsed.image) {
                        seoData = parsed;
                        break;
                    }
                    if (parsed['@graph']) {
                        const hotelNode = parsed['@graph'].find(item => item['@type'] === 'Hotel' || item['@type'] === 'LodgingBusiness');
                        if (hotelNode) seoData = hotelNode;
                    }
                }
            } catch(e) {}

            // 2. ОПИСАНИЕ
            let descNode = doc.querySelector('#property_description_content, [data-testid="property-description"] p');
            let description_ru = descNode ? descNode.innerText.trim() : (seoData.description || "");

            // 3. ФОТОГРАФИИ
            let galleryImages = [];
            // Собираем все картинки
            const imgs = Array.from(doc.querySelectorAll('img'));
            for (let img of imgs) {
                let src = img.src || img.dataset.highres || img.dataset.lazy || "";
                if (src.includes('images/hotel')) {
                    // Превращаем превью в огромное фото
                    src = src.replace(/max\d+/, 'max1024x768').replace(/square\d+/, 'max1024x768');
                    galleryImages.push(src);
                }
            }
            if (seoData.image && typeof seoData.image === 'string') {
                galleryImages.push(seoData.image);
            } else if (Array.isArray(seoData.image)) {
                galleryImages.push(...seoData.image);
            }
            galleryImages = [...new Set(galleryImages)].filter(src => src.startsWith('http')).slice(0, 15);

            // 4. КООРДИНАТЫ
            let lat = 0, lng = 0;
            if (seoData.hasMap && Array.isArray(seoData.hasMap)) {
                const geo = seoData.hasMap[0]; // Иногда лежит тут
                if (geo && geo.latitude) { lat = geo.latitude; lng = geo.longitude; }
            }
            if (lat === 0) {
                const mapNode = doc.querySelector('[data-atlas-latlng]');
                if (mapNode) {
                    const coordsRaw = mapNode.getAttribute('data-atlas-latlng');
                    [lat, lng] = coordsRaw.split(',').map(Number);
                }
            }

            // 5. УДОБСТВА УЛЬТРА (Все мелкие иконки)
            const amenitiesNodes = Array.from(doc.querySelectorAll('.important_facility, [data-testid="facility"] div, .bui-list__item'));
            const amenities = [...new Set(amenitiesNodes.map(node => node.innerText.trim()).filter(t => t.length > 2 && t.length < 40))];

            // 6. ЗВЕЗДНОСТЬ И РЕЙТИНГ БУКИНГА
            const ratingNode = doc.querySelector('.b5cd09854e.d10a6220b4, [data-testid="review-score-component"] div');
            const bookingScore = ratingNode ? ratingNode.innerText : "8.5";

            // 7. НОМЕРА И ИХ ЦЕНЫ
            const rooms = [];
            const roomRows = Array.from(doc.querySelectorAll('.room_loop_counter2, .js-rt-block-row, [data-testid="room-card"], [data-testid="room-row"]'));
            roomRows.forEach(row => {
                const roomNameNode = row.querySelector('.hprt-roomtype-link, [data-testid="room-type-title"]');
                const roomPriceNode = row.querySelector('.bui-price-display__value, .prco-valign-middle-pt-auto, [data-testid="price-and-discounted-price"]');
                const roomBedsNode = row.querySelector('.hprt-roomtype-bed, [data-testid="bed-type"]');
                
                if (roomNameNode) {
                    rooms.push({
                        title: roomNameNode.innerText.trim().replace(/\n/g, ''),
                        priceText: roomPriceNode ? roomPriceNode.innerText.trim().replace(/\s+/g, ' ') : "Уточняйте",
                        beds: roomBedsNode ? roomBedsNode.innerText.trim().replace(/\n/g, ' ') : ""
                    });
                }
            });

            const uniqueRooms = [...new Map(rooms.map(item => [item['title'], item])).values()];

            results.push({
                id: '17' + Date.now().toString().slice(-6) + i,
                name_ru: defaultName,
                name_en: defaultName,
                name_kz: defaultName,
                city: city,
                type: "Hotel",
                image: galleryImages[0] || "",
                stars: 5,
                booking_rating: bookingScore,
                priceTag: uniqueRooms.length > 0 && uniqueRooms[0].priceText !== "Уточняйте" ? uniqueRooms[0].priceText : "По запросу",
                lat: lat,
                lng: lng,
                gallery: galleryImages,
                description_ru: description_ru || "Великолепный отель в центре со всеми удобствами.",
                description_en: "Excellent hotel in " + city + " with high-quality service.",
                description_kz: city + " қаласындағы тамаша қонақ үй.",
                amenities: amenities.length > 0 ? amenities : ["Wi-Fi", "Кондиционер", "Парковка"],
                rooms: uniqueRooms,
                nearbyAttractions: []
            });
            
            container.removeChild(iframe);
            
        } catch (e) {
            console.error(`Ошибка при сборе данных для ${defaultName}: `, e);
        }
    }

    document.body.removeChild(container);

    const blob = new Blob([JSON.stringify(results, null, 4)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `MEGA_HOTELS_ULTRA_${city}.json`;
    document.body.appendChild(a);
    a.click();
    console.log(`%c 🏆 ГОТОВО! Сохранено: MEGA_HOTELS_ULTRA_${city}.json`, "background: #4CAF50; color: white; padding: 5px; font-weight: bold;");
})();
