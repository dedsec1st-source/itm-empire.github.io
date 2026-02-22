// ===== КОНФИГУРАЦИЯ ПОДКЛЮЧЕНИЯ К СЕРВЕРУ =====
// Определяем базовый URL API автоматически
const API_BASE_URL = (() => {
    // Если мы на том же домене, где крутится Nginx (85.239.60.142), 
    // то можно использовать относительные пути
    if (window.location.hostname === '85.239.60.142' || 
        window.location.hostname === 'localhost') {
        return '';  // относительные пути
    }
    // Если фронтенд на GitHub Pages, а API на сервере
    return 'https://85.239.60.142';  // явно указываем HTTPS
})();

console.log('🌐 API URL:', API_BASE_URL || '(относительный)');
