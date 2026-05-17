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
