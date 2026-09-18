# ADR-0001: Team, TeamSeason y Membership

- Estado: Aceptado
- Fecha: 2026-09-18

## Contexto

El equipo es la entidad permanente, pero categoría, nombre competitivo, plantilla y permisos cambian cada temporada.

## Decisión

- `Team` representa el squad/cohorte estable. Su nombre base puede evolucionar sin cambiar su ID.
- `TeamSeason` contiene `season_label`, categoría, display label competitivo opcional, configuración y estado de esa temporada.
- `Membership` pertenece a `TeamSeason`; User no tiene rol global.
- Cada temporada crea nuevas Memberships operativas.
- `GuardianLink` puede conservar historia User–Player, pero el acceso requiere conjuntamente Membership activa + GuardianLink activo + RosterEntry activa en la TeamSeason.
- Un rollover futuro permite renovación explícita individual o bulk por COACH; nunca acceso silencioso por pertenencia anterior.

## Consecuencias

Agenda, disponibilidad y convocatorias no se arrastran. Users, Team, Player y GuardianLink pueden conservarse bajo reglas de renovación y retención.

