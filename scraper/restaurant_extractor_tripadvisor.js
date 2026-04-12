/**
 * ========================================================
 * УЛЬТИМАТИВНЫЙ ПАРСЕР РЕСТОРАНОВ (TRIPADVISOR EDITION)
 * ========================================================
 * Инструкция:
 * 1. Открой TripAdvisor, найди рестораны Туркестана (или Шымкента).
 * 2. Прокрути список до конца (чтобы все карточки загрузились).
 * 3. Вставь этот код в консоль (F12 -> Console).
 */

(async function() {
    console.log("%c 👨‍🍳 ИНИЦИАЛИЗАЦИЯ ПАРСЕРА РЕСТОРАНОВ v1.0...", "color: #ff9800; font-size: 20px; font-weight: bold;");
    
    // Селекторы на листинге (могут меняться, TripAdvisor часто обновляет классы)
    // Ищем ссылки на отзывы ресторанов
    const links = Array.from(document.querySelectorAll('a[href*="/Restaurant_Review-"]'))
        .filter(a => a.innerText.trim().length > 3)
        .filter((v, i, a) => a.findIndex(t => (t.href === v.href)) === i); // Уникальные

    const results = [];
    const cityName = document.querySelector('input[placeholder*="Куда"]')?.value || "Туркестан";

    console.log(`Найдено ${links.length} ссылок на рестораны. Начинаем глубокое погружение...`);
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0'; container.style.left = '0';
    container.style.width = '100px'; container.style.height = '100px';
    container.style.zIndex = '-9999'; container.style.opacity = '0.01';
    document.body.appendChild(container);

    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const url = link.href;
        const defaultName = link.innerText.trim();

        console.log(`[%c${i+1}/${links.length}%c] Заходим в: ${defaultName}...`, "color: #ff9800", "color: inherit");
        
        try {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.width = "100%";
            iframe.height = "100%";
            container.appendChild(iframe);

            await new Promise(resolve => {
                const timeout = setTimeout(resolve, 6000); // Тайм-аут на случай блокировки
                iframe.onload = () => {
                    clearTimeout(timeout);
                    setTimeout(resolve, 3000); // Даем время на рендер
                };
            });

            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc || doc.body.innerText.length < 100) {
                console.warn(`Не удалось прочитать содержимое для ${defaultName} (возможно X-Frame-Options)`);
                container.removeChild(iframe);
                continue;
            }

            // 1. SEO DATA (JSON-LD) - Клондайк данных!
            let seoData = {};
            try {
                const ldJsonNodes = doc.querySelectorAll('script[type="application/ld+json"]');
                for (let node of ldJsonNodes) {
                    const parsed = JSON.parse(node.innerText);
                    const item = Array.isArray(parsed) ? parsed[0] : parsed;
                    if (item['@type'] === 'Restaurant' || item['@type'] === 'FoodEstablishment') {
                        seoData = item;
                        break;
                    }
                }
            } catch(e) {}

            // 2. ФОТО (Ищем большие картинки в галерее)
            let galleryImages = [];
            const photoNodes = Array.from(doc.querySelectorAll('img[src*="/media/photo-"]'));
            galleryImages = photoNodes.map(img => img.src.replace(/w=\d+&h=\d+/, 'w=1000&h=800')).filter(s => s.length > 10);
            
            if (seoData.image) {
                if (Array.isArray(seoData.image)) galleryImages.push(...seoData.image);
                else galleryImages.push(seoData.image);
            }
            galleryImages = [...new Set(galleryImages)].slice(0, 12);

            // 3. КУХНИ / ОСОБЕННОСТИ
            const tags = Array.from(doc.querySelectorAll('.S_MeS.Z.Y.H._S.M, .dlByZ, .fSAuS')).map(n => n.innerText.trim());
            const cuisines = seoData.servesCuisine || tags.filter(t => t.length > 2 && t.length < 30);

            // 4. КООРДИНАТЫ
            let lat = 0, lng = 0;
            if (seoData.geo) {
                lat = parseFloat(seoData.geo.latitude);
                lng = parseFloat(seoData.geo.longitude);
            }

            // 5. ОПИСАНИЕ
            const descNode = doc.querySelector('.fIrGe._T.BTZ6S, .RfBGI');
            const description_ru = descNode ? descNode.innerText.trim() : (seoData.description || "");

            // 6. КОНТАКТЫ
            const phone = doc.querySelector('a[href^="tel:"]')?.innerText.trim() || seoData.telephone || "";
            const address = doc.querySelector('.yEWoV, .fS99A')?.innerText.trim() || (seoData.address?.streetAddress || "");
            const website = doc.querySelector('a[data-test-target="website-link"]')?.href || seoData.url || "";

            // 7. ЧАСЫ РАБОТЫ
            const hoursNode = doc.querySelector('.W979S, .eSInm');
            const hours = hoursNode ? hoursNode.innerText.trim() : "Уточняйте на месте";

            results.push({
                id: 'rest_' + Date.now().toString().slice(-6) + i,
                name_ru: defaultName || seoData.name,
                name_en: seoData.name || defaultName,
                city: cityName,
                type: cuisines[0] || "Ресторан",
                cuisine: cuisines[0] || "Ресторан",
                image: galleryImages[0] || "",
                rating: seoData.aggregateRating?.ratingValue || "4.5",
                priceTag: doc.querySelector('.f6_Sg')?.innerText || "$$",
                lat: lat,
                lng: lng,
                gallery: galleryImages,
                cuisines: cuisines,
                address_ru: address,
                phone: phone,
                website: website,
                hours: hours,
                description_ru: description_ru || "Отборные ингредиенты и аутентичные рецепты в самом сердце города.",
                description_en: seoData.description || "Excellent dining experience with authentic flavors.",
                menu: [] 
            });

            container.removeChild(iframe);
            
        } catch (e) {
            console.error(`Ошибка: ${defaultName}`, e);
        }
    }

    document.body.removeChild(container);

    const blob = new Blob([JSON.stringify(results, null, 4)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `MEGA_RESTAURANTS_TA_${cityName}.json`;
    a.click();
    console.log(`%c 🏆 ГОТОВО! Сохранено: MEGA_RESTAURANTS_TA_${cityName}.json`, "background: #ff9800; color: white; padding: 5px; font-weight: bold;");
})();
