# ADR-0002: Invitaciones y vínculo tutor–jugador

- Estado: Aceptado
- Fecha: 2026-09-18

## Contexto

El producto debe vincular familias sin enumerar menores ni convertir un código en autorización.

## Decisión

- Vía principal: desde Player, COACH genera “Invitar familia”. El token identifica internamente TeamSeason + Player + propósito.
- Antes de autenticar sólo se muestran metadatos públicos del equipo; nunca datos privados del Player.
- Tras email OTP, el tutor confirma la solicitud; se crea GuardianLinkRequest `PENDING` y COACH debe aprobarla.
- Fallback: invitación general; el tutor introduce nombre y dorsal opcional sin listado, autocomplete, coincidencias parciales ni confirmación de existencia.
- Invitation, GuardianLinkRequest, GuardianLink y Membership son conceptos separados.
- COACH aprueba, rechaza y revoca. STAFF no gestiona estos vínculos en MVP.

## Consecuencias

El token no concede acceso. La aprobación crea/activa Membership GUARDIAN y GuardianLink dentro de una transacción y deja auditoría.

