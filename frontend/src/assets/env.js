window.__env = window.__env || {};

// Detectar automáticamente el entorno
(function () {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    // Desarrollo local (localhost:4200)
    if (hostname === 'localhost' && (port === '4200' || port === '4201')) {
        window.__env.API_URL = 'http://localhost:8000';
        window.__env.AUTH_URL = 'http://localhost:8001';
        console.log('🔧 Development mode: Using localhost');
    }
    // Kubernetes con Ingress (cualquier IP/dominio)
    else {
        // Usa rutas relativas - el Ingress enruta /api y /auth
        const baseUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`;
        window.__env.API_URL = `${baseUrl}/api`;
        window.__env.AUTH_URL = `${baseUrl}/auth`;
        console.log('☸️ Kubernetes mode: Using Ingress paths', baseUrl);
    }
})();
