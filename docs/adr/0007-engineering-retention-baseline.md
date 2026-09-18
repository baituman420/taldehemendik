# ADR-0007: Engineering retention baseline

- Estado: Aceptado como baseline técnico
- Fecha: 2026-09-18
- Marcado obligatorio: **legal review required before live pilot**

## Decisión

- Notas libres de Availability: borrar 30 días después del Event.
- Invitations expiradas/revocadas y GuardianLinkRequests rechazadas/canceladas: 90 días.
- Events, Availability estructurada, Callups, Notices y datos operativos: durante TeamSeason y hasta 12 meses tras su cierre.
- Auditoría de seguridad y cambios críticos: 12 meses inicialmente.
- Después: borrar o anonimizar PII cuando pueda conservarse la integridad técnica necesaria.

## Consecuencias

Estos plazos guían jobs, esquemas y tests, pero no constituyen política legal definitiva. Deben revisarse jurídicamente antes de usar datos reales.

