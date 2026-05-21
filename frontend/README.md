# Interfaz de Usuario Móvil (Frontend) 📱

## ¿Qué hace este servicio?
Es la aplicación móvil orientada a los usuarios. Funciona como la puerta de entrada para diagnosticar la morfología corporal e interactuar con el *Feed* de ropa. Se enfoca en una altísima usabilidad y una experiencia de usuario (UX) curada e impecable.

## ¿Por qué React Native + TailwindCSS?
- **React Native:** Permite escribir código en JavaScript/React y compilarlo nativamente para iOS y Android de manera simultánea. Posee gran acceso al hardware (giroscopios y APIs nativas de cámara).
- **TailwindCSS (NativeWind):** Facilita la construcción de interfaces estéticas, modo oscuro nativo, y prototipado rápido de diseños muy modernos de manera consistente y sin hojas de estilo en cascada kilométricas.

---

## Flujo del Programa (La Navegación)

El frontend está particionado en 3 flujos consecutivos (Stack Navigation) para llevar al usuario de la mano y minimizar la fricción o la confusión:

### 1. Onboarding (`GuideScreen` & `VerificationScreen`)
El mayor enemigo de la IA es la basura (Garbage In = Garbage Out). Si el usuario se saca una foto con una chaqueta invernal *oversize*, la IA dirá que es un "Óvalo" u hombre obeso.
- **Misión de esta pantalla:** Detener al usuario antes de permitir el acceso a la cámara para enseñarle, con iconografía clara (🟢 / 🔴), qué prendas están permitidas y el entorno de luz ideal.

### 2. Cámara Asistida (`AssistedCamera`)
En lugar de permitir que la persona saque una foto movida o a oscuras (lo que causaría falsos negativos), la cámara posee una "Lógica de Bloqueo":
- Mediante Hooks que leen los fotogramas (`Luz Óptima`) y el giroscopio (`Estabilidad`), el sistema evalúa constantemente el entorno.
- El botón de captura solo cambia de gris (deshabilitado) a color activo cuando ambos "semáforos" están en verde. 

### 3. Discovery Feed (`FeedScreen`)
La interfaz lúdica tipo "Swipe" al estilo Tinder.
- **Gestos:** Deslizar a la derecha envía un "LIKE" al Backend. Deslizar a la izquierda un "DISLIKE".
- **Objetivo:** Educar a la base de datos Mongo (Colección Interacciones) sobre qué cortes y colores prefiere esa persona específica, permitiendo que la App le recomiende, eventualmente, ropa que le queda espectacular *y* que a su vez sea de su gusto personal.

---

## 🚀 Guía de Ejecución

El Frontend corre de manera local (fuera de Docker) para que pueda conectarse fácilmente con tu dispositivo móvil a través de Expo.

### Pasos para levantar el proyecto

1. Abre tu terminal en esta carpeta (`frontend`).
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. (Opcional pero Recomendado) Si usas el Backend en Docker u otra PC, asegúrate de que la App sepa en qué IP buscar al servidor ejecutando el script automático:
   ```bash
   npm run update-ip
   ```
4. Inicia el servidor de Expo (limpiando caché para evitar errores de navegación antiguos):
   ```bash
   npx expo start -c
   ```
5. Escanea el código QR desde tu celular (iOS -> Cámara, Android -> Expo Go).

### 🛠 Solución de Errores Comunes
- **Network Request Failed (Backend Inalcanzable):** Significa que el celular no puede llegar al servidor de Node.js o IA. Asegúrate de haber corrido `npm run update-ip`, y verifica que tanto tu celular como tu PC estén conectados a la misma red Wi-Fi.
- **Native module cannot be null:** Estás intentando correr un paquete nativo incompatible con Expo Go. Limpia el caché (`npx expo start -c`) o verifica que las dependencias estén alineadas con el SDK de Expo (actualmente SDK 54).
- **La app te devuelve a GuideScreen:** Si borraste el caché pero estabas "logueado" con un usuario inconsistente, Expo conservó el AsyncStorage pero perdió la bandera de silueta. Usa el botón "Cerrar Sesión" en el Perfil para limpiar el estado y vuelve a ingresar.
