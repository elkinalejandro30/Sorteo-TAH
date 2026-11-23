# Sorteo TAH — Batallón Supremacy

Aplicación web estática para revelar en vivo los emparejamientos del Torneo de Alianzas Hispanas (TAH) de Supremacy 1914. Esta rama prepara el sorteo de **octavos de final** con las 16 alianzas que ganaron sus combates de la ronda anterior. Se formarán 8 enfrentamientos.

## Estructura

| Ruta | Función |
| --- | --- |
| `dist/index.html` | Estructura de la página, textos y controles del sorteo. |
| `dist/app.js` | Lista de clasificados, selección aleatoria, emparejamientos, progreso y persistencia local. |
| `dist/styles.css` | Estilos base y diseño adaptable. |
| `dist/refinements.css` | Ajustes adicionales de presentación. |
| `test/sorteo.test.cjs` | Pruebas del listado, el avance independiente y los ocho combates. |
| `.openai/hosting.json` | Configuración de publicación estática de Sites; sirve el directorio `dist`. |

No hay dependencias ni proceso de compilación. Para probarlo localmente, abre `dist/index.html` en un navegador moderno. El navegador necesita `crypto.getRandomValues`, `localStorage`, `dialog` e `IntersectionObserver`.

Para ejecutar las pruebas automatizadas: `node --test test/sorteo.test.cjs` (Node.js 18 o posterior).

## Lógica del sorteo

1. `QUALIFIED` contiene los 16 ganadores, con el número TAH y GID del combate que les dio el cupo. Las entradas con `2` son equipos distintos de sus homónimos.
2. Al revelar una alianza, `app.js` toma solo las que aún no han salido. Genera un índice con `crypto.getRandomValues` y muestreo por rechazo para evitar sesgo del módulo.
3. Cada dos revelaciones consecutivas forman un combate. Los primeros cuatro combates aparecen en el Frente A y los otros cuatro en el Frente B.
4. Los índices revelados se guardan inmediatamente en `localStorage` bajo la clave `batallon-supremacy-sorteo-octavos-v1`. Al recargar, el navegador continúa donde quedó. La clave es distinta de la usada para dieciseisavos, por lo que el sorteo anterior no llena esta nueva ronda.
5. **Reiniciar sorteo** borra el avance de octavos únicamente en ese navegador. El sorteo se realiza en cada navegador por separado; esta aplicación no sincroniza ni certifica resultados entre dispositivos.

## Clasificados

Se usan los nombres de los ganadores indicados para cada combate, incluidos los cuatro resultados sin fecha proporcionada. Las fechas y horas de la tabla son las informadas para la ronda anterior; no se indicó zona horaria.

| Combate | GID | Clasificado | Fecha y hora informada |
| --- | --- | --- | --- |
| TAH 01 | 10948268 | EuropaVII | 12/11/2026 16:40 |
| TAH 02 | 10945257 | Los Guerreros Aguila | No indicada |
| TAH 03 | 10944141 | Sturmtruppen | 12/11/2026 15:26 |
| TAH 04 | 10946169 | The Golden Prophecy | No indicada |
| TAH 05 | 10942318 | Mort Imperium | 07/11/2026 13:21 |
| TAH 06 | 10946039 | AETT Blar | 10/11/2026 23:45 |
| TAH 07 | 10944358 | Pura Vida 2 | 06/11/2026 15:21 |
| TAH 08 | 10940766 | Guardia Nocturna | 07/11/2026 20:35 |
| TAH 09 | 10945005 | Grupo de Operaciones Maldito II | 06/11/2026 21:14 |
| TAH 10 | 10945039 | K I N G S 2 | No indicada |
| TAH 11 | 10945961 | The Raptors Supremacy | No indicada |
| TAH 12 | 10944912 | Sturmtruppen 2 | 07/11/2026 17:40 (confirmación de rendición) |
| TAH 13 | 10944214 | Orden Ashura | 04/11/2026 22:38 |
| TAH 14 | 10944071 | GEM | 10/11/2026 12:48 |
| TAH 15 | 10944086 | Asylum | 12/11/2026 17:43 |
| TAH 16 | 10945872 | Pura Vida | 05/11/2026 13:56 |
