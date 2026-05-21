# Core de Negocio (Backend) ⚙️

## ¿Qué hace este servicio?
Este servicio desarrollado en **Node.js con Express** es el cerebro orquestador que centraliza el tráfico de datos. Actúa como intermediario entre la App Móvil (Frontend) y el Microservicio de IA. 

Sus responsabilidades son:
1. **Evaluar e Interpretar Métricas:** Recibe de la IA variables crudas (ej. Distancia de hombros = 345px, Cadera = 350px) y las convierte en información lógica (ej. Silueta "Reloj de Arena" al aplicar la tolerancia de S ≈ H).
2. **Garantizar la Autenticación:** Gestiona las credenciales de usuarios.
3. **Persistir Datos (MongoDB):** Administra el catálogo de ropa, el histórico de usuarios y las preferencias (motor de recomendaciones).

---

## ¿Por qué Node.js y MongoDB?
- **Node.js:** Por su altísima velocidad de concurrencia y naturaleza asíncrona, ideal para servir como API Gateway que enruta solicitudes rápidas a la IA y responde a miles de dispositivos simultáneos.
- **MongoDB:** La ropa es asimétrica en atributos (un pantalón tiene "tiro" pero no "escote", una remera tiene "tipo de cuello" pero no "largo de pierna"). Una base de datos NoSQL permite almacenar objetos JSON dinámicos sin obligar a esquemas de tablas SQL con docenas de columnas nulas.

---

## Estructura de Datos (Mongoose)

El modelo de datos se basa en 5 colecciones que se conectan entre sí mediante referencias (IDs):

1. **`Usuario`**: Guarda la silueta asignada y las medidas numéricas. Nunca guarda fotos.
2. **`Prenda`**: Contiene la URL pública de la imagen de la ropa, y `tags_compatibilidad` (por ej. `['Triángulo', 'Reloj de Arena']`).
3. **`Usuario_Interaccion`**: La tabla analítica clave. Cada vez que el frontend desliza a la derecha (LIKE) o mira algo por mucho tiempo, se guarda aquí uniendo `usuario_id` con `prenda_id`. Esto retroalimenta el motor de ML de gustos.
4. **`Combinacion`**: Lista (`Array`) de `Prenda_ids` para armar un Outfit (pantalón + remera + accesorios).
5. **`Estilos_Config`**: Un diccionario técnico donde se parametriza qué hace que un estilo sea "Grunge", "Minimalista", etc.

### ¿Cómo fluyen los datos?
1. El usuario abre la cámara y la App manda un _POST_ con la imagen hacia la **API IA**.
2. La IA devuelve al **Backend** que el usuario tiene medidas `S: 120, W: 80, H: 122`.
3. El `morphologyController` en este backend aplica matemáticas y descubre que `S ≈ H`, por ende es **Reloj de Arena**.
4. El backend va a **MongoDB**, busca en la colección `Prendas` aquellas que tengan en `tags_compatibilidad` la etiqueta "Reloj de Arena".
5. Se retorna el JSON con esas prendas al Frontend para poblar el _Feed de Descubrimiento_.

---

## 🚀 Guía de Ejecución

El Backend está diseñado para ejecutarse en contenedores Docker mediante `docker-compose` desde la raíz del proyecto, pero también puedes correrlo individualmente para desarrollo.

### Ejecución recomendada (vía Docker en la Raíz)
Si ejecutas `docker-compose up -d` en la carpeta raíz del repositorio, este backend se empaquetará automáticamente usando su propio `Dockerfile` y se conectará a un contenedor de MongoDB sin configuración extra.

### Ejecución Individual Local (Sin Docker)
Si necesitas desarrollar exclusivamente el backend sin levantar todo el orquestador:

1. Abre tu terminal en esta carpeta (`backend`).
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Asegúrate de tener **MongoDB** corriendo en tu máquina (ej. puerto 27017). Si usas MongoDB Atlas, edita el archivo `.env` y coloca tu URI en `MONGO_URI`.
4. Levanta el servidor en modo desarrollo (con hot-reload activado vía node --watch):
   ```bash
   npm run dev
   ```

### 🛠 Solución de Errores Comunes
- **MongoNetworkError o Error de Conexión:** Si el backend lanza error al conectar con la base de datos, significa que MongoDB no está corriendo en tu máquina local. Si usas Docker, verifica que el contenedor `asesor_mongo` esté activo.
- **Port 3000 is already in use:** Otro proceso está usando el puerto 3000. Cierra otros servidores Node.js que tengas corriendo.
- **Error interno del servidor al login/registro:** Verifica que hayas configurado correctamente la cadena de conexión de MongoDB y que no tengas usuarios duplicados.
