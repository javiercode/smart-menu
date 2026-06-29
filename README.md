# SmartMenu Pro 🍽️📱

**SmartMenu Pro** es un ecosistema omnichannel moderno para la gestión de menús digitales interactivos en tiempo real. Diseñado bajo una arquitectura limpia por capas (Layered Architecture) y desacoplado mediante el patrón de diseño **MVVM (Model-View-ViewModel)** en React con TypeScript, esta aplicación permite a los restaurantes gestionar sus menús cíclicos semanales de forma ultra-eficiente, brindando a los comensales una interfaz interactiva de marca blanca rápida y compatible con asistentes de voz (Alexa y Google Assistant).

---

## 🌐 Enlace de Prueba en Producción (Demo en Vivo)

Puedes visualizar la versión de producción desplegada y totalmente interactiva en el siguiente enlace oficial:
👉 **[https://javiercode.github.io/smart-menu/](https://javiercode.github.io/smart-menu/)**

---

## 🚀 Características Destacadas

### 👤 Portal del Cliente (B2C Landing Page)
* **Resolución Semanal al Vuelo:** El cliente interactúa con una cabecera de calendario familiar (pudiendo adelantar o atrasar días), pero el sistema resuelve asíncronamente qué día de la semana representa la fecha calendario seleccionada para consultar el menú cíclico del restaurante.
* **Carga de Marca Blanca Activa:** Los colores del encabezado, botones, chips y acentos estéticos se adaptan dinámicamente en tiempo real al cargar las preferencias de color primario y secundario configuradas por el dueño del restaurante.
* **Filtros por Categoría:** Chips deslizables e interactivos para segmentar la lista en Entradas, Platos Fuertes, Postres, Bebidas u Otros de forma instantánea.
* **Caché Local Persistente (0ms Loads):** Configurado con la persistencia fuera de línea de Cloud Firestore a través de IndexedDB del navegador. Las configuraciones de marca y las imágenes Base64 se almacenan en caché local; tras la primera visita, las posteriores cargas del menú y de fotos toman **0 milisegundos**, reduciendo el consumo de transferencia a cero.

### 🔑 Panel del Administrador (B2B Control Panel)
* **Onboarding Demo en Un Solo Clic:** Un botón inteligente en la autenticación que pre-llena los datos de registro demo y asocia el primer código de invitación. En un solo clic, registra la cuenta en tu Firebase real o, si ya existía, cambia visualmente e inicia sesión automáticamente.
* **Registro Protegido mediante Invitaciones:** Flujo seguro SaaS controlado por base de datos en la colección `authorization_codes` de Firestore. Solo permite registrarse si el usuario posee un código de acceso válido, vigente y no canjeado anteriormente.
* **Gestión por Ciclo de Días:** Los dueños de restaurantes configuran sus menús cíclicos de Lunes a Domingo de manera fija en vez de programar calendarios complejos, ahorrando tiempo de gestión.
* **Carga de Fotos en Base64 Local:** Un selector de archivos que comprime y convierte imágenes locales en cadenas Base64 seguras de menos de 800KB para almacenarlas directamente en Firestore, haciéndolo 100% independiente de almacenamiento externo y ideal para GitHub Pages.
* **Generador de Código QR Automático:** Genera instantáneamente códigos QR dinámicos y escaneables vinculados a la URL y slug específicos de tu marca.
* **Soporte y Conversión de WhatsApp:** Botones de ayuda pre-configurados para que comensales o dueños interesados inicien conversaciones comerciales por WhatsApp con el administrador de SmartMenu Pro de forma directa y fluida.

### ⚙️ CI/CD y Despliegue Estático
* **GitHub Actions Workflow (`.github/workflows/deploy.yml`):** Canalización de compilación automática gatillada en cada push a la rama principal, ejecutando de forma limpia las pruebas de Vitest e inyectando claves de Firebase desde secrets para desplegar en la rama `gh-pages`.
* **Solución 404 Estática para SPAs:** Implementa el mecanismo de redirecciones de rutas profundas de cliente (`/admin`) mediante scripts de enrutamiento sincronizados en `public/404.html` y `<head>` de `index.html`, evitando el clásico error 404 de GitHub Pages al recargar o entrar directo a rutas profundas.

---

## 🎟️ Guía de Onboarding para Pruebas (Cómo Ingresar)

Para ingresar por primera vez a tu propio panel de control y experimentar la base de datos en tiempo real:

1. Ve a la sección de administración: **`https://javiercode.github.io/smart-menu/admin`**
2. Haz clic en el botón inferior: **"Probar Demo (Autocompletar)"**.
3. Se autocompletarán los campos y se ingresará el código de invitación inicial **`DEMO-CODE-2026`** (el sistema auto-siembra este y otros 4 códigos en tu base de datos Firestore de forma automática en su primer arranque).
4. Haz clic en **"Registrar Restaurante"**. ¡El sistema creará la cuenta demo y te dará acceso al Dashboard inmediatamente!
5. En tus visitas posteriores, podrás iniciar sesión directamente ingresando `admin@demo.com` y `password123`.

---

## 🛠️ Comandos de Ejecución Local

Sigue estas instrucciones para clonar, ejecutar y probar la aplicación en tu entorno de desarrollo local:

### 1. Clonar el repositorio e Instalar dependencias:
```bash
git clone https://github.com/tu-usuario/smart-menu.git
cd smart-menu
npm install
```

### 2. Configurar Variables de Entorno:
Crea un archivo `.env` en la raíz copiando el contenido de `.env.example` y rellena tus credenciales reales de Firebase console:
```bash
cp .env.example .env
```

### 3. Levantar Servidor de Desarrollo Local:
```bash
npm run dev
```
Abre en tu navegador la URL provista (típicamente `http://localhost:5173/`).

### 4. Compilar para Producción (Optimizado):
```bash
npm run build
```

### 5. Ejecutar Pruebas Unitarias de Vitest:
Ejecuta la suite de pruebas unitarias seguras de forma interactiva o en lote:
```bash
npm run test
```
*(Nuestras pruebas corren de manera aislada utilizando un entorno simulado Happy-DOM de alta velocidad).*
