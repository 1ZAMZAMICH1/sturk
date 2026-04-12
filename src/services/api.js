// src/services/api.js - GITHUB GIST VERSION
const GIST_ID = '422713639bb29643abef3fef6c220400';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export const fetchSheetData = async (sheetName) => {
  try {
    const response = await fetch(`https://gist.githubusercontent.com/1ZAMZAMICH1/${GIST_ID}/raw/${sheetName}.json?rnd=${Math.random()}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (e) { return []; }
};

const updateAllGistData = async (sheetName, data) => {
  try {
    console.log('Sending to GitHub:', sheetName, data);
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [`${sheetName}.json`]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
        const err = await response.text();
        alert(`GitHub Error: ${err}`);
        return false;
    }
    
    // Пытаемся получить подтверждение от гитхаба
    const result = await response.json();
    console.log('GitHub Answer:', result);
    return true;
  } catch (err) {
    alert(`Request failed: ${err.message}`);
    return false;
  }
};

export const updateSheetData = async (sheetName, action, payload) => {
    try {
        let currentData = await fetchSheetData(sheetName);
        if (!Array.isArray(currentData)) currentData = [];
        let newData = [...currentData];

        if (action === 'add') {
            payload.id = payload.id || Date.now().toString(); // Гарантируем ID
            newData.push(payload);
        } else if (action === 'edit' || action === 'update') {
            const index = newData.findIndex(item => String(item.id) === String(payload.id));
            if (index !== -1) newData[index] = payload;
            else {
                console.warn('Update failed: ID not found. Skipping to prevent duplicate.');
                return false; 
            }
        } else if (action === 'delete') {
            newData = newData.filter(item => {
                // Пытаемся удалить по ID (самый надежный способ)
                if (payload.id && String(item.id) === String(payload.id)) return false;
                
                // Если ID нет, пытаемся по атракшион айди
                if (payload.attractionId && String(item.attractionId) === String(payload.attractionId)) return false;

                // Если и этого нет (мусорная запись), чистим по заголовку и позиции
                const itemPos = Array.isArray(item.pos) ? item.pos.join(',') : String(item.pos);
                const payloadPos = Array.isArray(payload.pos) ? payload.pos.join(',') : String(payload.pos);
                
                if (item.title === payload.title && itemPos === payloadPos) return false;

                return true;
            });
        }

        return await updateAllGistData(sheetName, newData);
    } catch (e) {
        console.error(e);
        return false;
    }
};
