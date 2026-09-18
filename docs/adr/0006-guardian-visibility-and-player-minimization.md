# ADR-0006: Visibilidad del tutor y minimización del Player

- Estado: Aceptado
- Fecha: 2026-09-18

## Decisión

GUARDIAN puede consultar:

- información general/pública de su TeamSeason;
- agenda permitida y logística de Events;
- Notices de su audiencia;
- datos operativos, Availability y estado de Callup de sus propios Players.

No puede consultar teléfonos, datos privados, Availability ni GuardianLinks de otras familias, ni la plantilla completa con PII. En MVP no se publica la lista completa de convocados a todas las familias.

Birth date no forma parte del MVP ni se usa para identificar/vincular. Sólo podrá añadirse como campo opcional futuro ante necesidad operativa aprobada.

## Consecuencias

Las respuestas HTTP se filtran por policy, no sólo por UI. Una configuración futura de visibilidad de convocados queda conceptualmente posible pero fuera del MVP.

