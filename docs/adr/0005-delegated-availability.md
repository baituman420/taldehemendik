# ADR-0005: Disponibilidad delegada

- Estado: Aceptado
- Fecha: 2026-09-18

## Contexto

Durante la adopción seguirán llegando respuestas por teléfono, WhatsApp o conversación presencial.

## Decisión

COACH y STAFF pueden registrar Availability por un Player del equipo con:

- estado;
- `actor_user_id`;
- timestamp de servidor;
- `source=STAFF_RECORDED`;
- nota operativa breve opcional.

Un tutor autorizado puede cambiarla después mientras la ventana esté abierta. La última respuesta válida es vigente; el historial conserva actor, fuente, estado anterior/nuevo y timestamp.

## Consecuencias

La UI futura podrá mostrar “Registrado por Mikel · comunicado por teléfono”. La fuente no altera las reglas de deadline ni de concurrencia.

