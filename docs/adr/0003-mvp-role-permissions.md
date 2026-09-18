# ADR-0003: Permisos MVP de COACH, STAFF y GUARDIAN

- Estado: Aceptado
- Fecha: 2026-09-18

## Decisión

COACH posee las acciones estructurales y todas las operativas.

STAFF puede crear/modificar eventos, consultar y registrar disponibilidad delegada, crear/modificar/publicar convocatorias, gestionar sustituciones, publicar avisos y consultar datos operativos necesarios de jugadores del equipo. No crea ni edita Player/RosterEntry en MVP.

STAFF no puede cambiar configuración estructural, gestionar Memberships o GuardianLinks, invitar/eliminar staff, crear/cerrar temporadas ni eliminar Team.

GUARDIAN sólo accede a información general permitida y a Players vinculados bajo la triple condición Membership + GuardianLink + RosterEntry activas.

## Consecuencias

No se implementa RBAC granular en MVP. La policy central utiliza tres roles; el modelo podrá añadir capacidades finas en fase posterior sin cambiar las entidades principales.
