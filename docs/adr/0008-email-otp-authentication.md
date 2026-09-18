# ADR-0008: Autenticación MVP mediante email OTP

- Estado: Aceptado
- Fecha: 2026-09-18

## Decisión

Método MVP: OTP de seis dígitos por email, detrás de un AuthAdapter compatible con un proveedor administrado.

Flujo COACH: entrada para crear/gestionar equipo → email → OTP → crear User si no existe → crear Team/TeamSeason/Membership COACH.

Flujo GUARDIAN: Invitation válida → email → OTP → crear User si no existe → GuardianLinkRequest. No existe auto-registro para explorar equipos sin Invitation.

Un User existente puede autenticarse normalmente y acceder a Memberships existentes.

## Consecuencias

El dominio usa User y `auth_subject`; no conoce Supabase ni otro proveedor. Se requieren rate limits, anti-enumeración y entregabilidad de email.

