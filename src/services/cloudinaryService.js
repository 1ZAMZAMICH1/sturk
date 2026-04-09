// src/services/cloudinaryService.js

const CLOUD_NAME = 'dyuywnfy3';
const UPLOAD_PRESET = 'ml_default';

/**
 * Uploads an image file to Cloudinary
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
            mode: 'cors' // Явно указываем CORS
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cloudinary raw error:', errorText);
            throw new Error('Ошибка сервера Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};
