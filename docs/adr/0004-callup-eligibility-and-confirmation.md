# ADR-0004: Elegibilidad de convocatoria

- Estado: Aceptado
- Fecha: 2026-09-18

## Decisión

- `UNSURE` y `NO_RESPONSE` pueden incluirse en Callup.
- El backend devuelve warning y exige confirmación explícita de COACH/STAFF.
- `CANNOT_ATTEND` no puede añadirse a una Callup vigente.
- Antes de convocarlo, Availability debe cambiar por un flujo autorizado.
- No existen overrides silenciosos.
- Availability y Callup permanecen separados.

## Consecuencias

Publicar/revisar Callup revalida Availability dentro de la transacción. El frontend no puede ignorar warnings ni fabricar una confirmación.

