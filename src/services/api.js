// src/services/api.js
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyaHmd1AJgQmff0hGiOhHoYiOtcwigttla878nq95ANN_2ZuYP7o8z8zJn2x4tEtJOSsQ/exec';

/**
 * Получение данных из Google Sheets
 * @param {string} sheetName - Имя листа (hotels, restaurants, guides, articles)
 */
export const fetchSheetData = async (sheetName) => {
    try {
        const response = await fetch(`${SCRIPT_URL}?sheet=${sheetName}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data.error) {
            console.error(`API Error (${sheetName}):`, data.error);
            return [];
        }

        return data;
    } catch (error) {
        console.error(`Fetch error (${sheetName}):`, error);
        return [];
    }
};

/**
 * Запись/обновление данных в Google Sheets через JSONP-трюк (обход CORS).
 * Apps Script не поддерживает CORS для POST: мы отправляем через GET с параметрами.
 */
export const updateSheetData = async (sheetName, action, payload) => {
    try {
        const encoded = encodeURIComponent(JSON.stringify(payload));
        const url = `${SCRIPT_URL}?sheet=${sheetName}&action=${action}&data=${encoded}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();

        if (result.error) {
            console.error('Apps Script error:', result.error);
            return false;
        }

        return result.success === true;
    } catch (error) {
        console.error('updateSheetData error:', error);
        return false;
    }
};
