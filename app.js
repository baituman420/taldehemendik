/**
 * Talde Hemendik! - Interactive Demo Controller & State Store
 * Controls:
 * - 14-Step Guided Tour for testing & stakeholder demos
 * - Role Switcher: Coach (Mikel) <-> Parent/Guardian (Amaia - Ibai #9)
 * - Navigation between all 11 Stitch-designed screens (A - K)
 * - Reactive state: Event creation, RSVP collection, Call-up generation, Late drop-out (Fever), Substitution of Ane #16
 */

const SQUAD_DATA = [
  { id: 1, number: 1, name: "Gorka Mendia", role: "Portero", status: "DISPONIBLE", rsvp: "Confirmó ayer 19:10", tutor: "Iker Mendia", phone: "611 22 33 44" },
  { id: 2, number: 2, name: "Eneko Larrea", role: "Lateral", status: "DISPONIBLE", rsvp: "Confirmó hoy 08:15", tutor: "Joseba Larrea", phone: "622 33 44 55" },
  { id: 3, number: 3, name: "Julen Bilbao", role: "Lateral", status: "DISPONIBLE", rsvp: "Confirmó ayer 20:20", tutor: "Xabier Bilbao", phone: "633 44 55 66" },
  { id: 4, number: 4, name: "Jon Gorostiaga", role: "Defensa", status: "DISPONIBLE", rsvp: "Confirmó hoy 08:30", tutor: "Iñaki Gorostiaga", phone: "644 55 66 77" },
  { id: 5, number: 5, name: "Markel Ruiz", role: "Defensa", status: "DISPONIBLE", rsvp: "Confirmó ayer 19:40", tutor: "Elena Ruiz", phone: "655 66 77 88" },
  { id: 6, number: 6, name: "Ander Sagasti", role: "Centrocampista", status: "DISPONIBLE", rsvp: "Confirmó ayer 21:00", tutor: "Begoña Sagasti", phone: "666 77 88 99" },
  { id: 7, number: 7, name: "Unai Etxebarria", role: "Extremo", status: "DISPONIBLE", rsvp: "Confirmó ayer 20:05", tutor: "Kepa y Leire", phone: "677 88 99 00" },
  { id: 8, number: 8, name: "Oier Agirre", role: "Centrocampista", status: "DISPONIBLE", rsvp: "Confirmó ayer 19:55", tutor: "Maite Agirre", phone: "688 99 00 11" },
  { id: 9, number: 9, name: "Ibai Aranguren", role: "Delantero", status: "DISPONIBLE", rsvp: "Confirmó ayer 19:12", tutor: "Amaia Aranguren", phone: "654 32 10 98" },
  { id: 10, number: 10, name: "Mikel Zabaleta", role: "Centrocampista", status: "DISPONIBLE", rsvp: "Confirmó ayer 21:15", tutor: "Aitor Zabaleta", phone: "699 00 11 22" },
  { id: 11, number: 11, name: "Aimar Ortiz", role: "Delantero", status: "DISPONIBLE", rsvp: "Confirmó hoy 09:00", tutor: "Miren Ortiz", phone: "600 11 22 33" },
  { id: 12, number: 12, name: "Nahia Azkarate", role: "Defensa", status: "DISPONIBLE_RESERVA", rsvp: "Confirmó hoy 09:10", tutor: "Nerea Azkarate", phone: "612 23 34 45" },
  { id: 13, number: 13, name: "Asier Urkijo", role: "Centrocampista", status: "NO_DISPONIBLE", rsvp: "No puede (Viaje)", tutor: "Mikel Urkijo", phone: "623 34 45 56" },
  { id: 14, number: 14, name: "Iker Baroja", role: "Extremo", status: "DISPONIBLE", rsvp: "Confirmó ayer 22:30", tutor: "Carmen Baroja", phone: "634 45 56 67" },
  { id: 15, number: 15, name: "Irati Zabala", role: "Extremo", status: "DISPONIBLE_RESERVA", rsvp: "Confirmó hoy 09:45", tutor: "Patxi Zabala", phone: "645 56 67 78" },
  { id: 16, number: 16, name: "Ane Gorostiaga", role: "Mediocentro / Delantera", status: "DISPONIBLE_RESERVA", rsvp: "Confirmó hoy", tutor: "Iñaki Gorostiaga", phone: "644 55 66 77" },
  { id: 17, number: 17, name: "Olatz Bengoa", role: "Defensa", status: "NO_DISPONIBLE", rsvp: "No puede (Reposo lesión)", tutor: "Sonia Bengoa", phone: "656 67 78 89" },
  { id: 18, number: 18, name: "Peio Goikoetxea", role: "Mediocentro", status: "PENDIENTE", rsvp: "Pendiente", tutor: "Asier Goikoetxea", phone: "667 78 89 90" }
];

const GUIDED_STEPS = [
  {
    step: 1,
    role: "coach",
    screen: "screen_a_home_coach",
    title: "1. Entrenador entra en Inicio",
    desc: "Mikel (entrenador) consulta el resumen operativo. El bloque 'REQUIERE TU ATENCIÓN' destaca el Torneo Oyón con las respuestas recibidas.",
    actionHint: "Pulsa en 'Gestionar Disponibilidad y Convocatoria' o en la tarjeta del Torneo Oyón."
  },
  {
    step: 2,
    role: "coach",
    screen: "screen_c_create_event",
    title: "2. Crear evento rápido",
    desc: "Formulario limpio y ultra ágil diseñado para usar a pie de campo. Solo los datos estrictamente necesarios.",
    actionHint: "Observa el switch 'Solicitar disponibilidad' activado con fecha límite y pulsa 'Crear evento'."
  },
  {
    step: 3,
    role: "coach",
    screen: "screen_d_event_detail_coach",
    title: "3. Solicitar disponibilidad",
    desc: "El evento queda programado y la solicitud se envía automáticamente a las familias de la plantilla.",
    actionHint: "El sistema muestra las respuestas en tiempo real: 14 Disponibles, 2 No disponibles, 2 Pendientes."
  },
  {
    step: 4,
    role: "parent",
    screen: "screen_g_home_parent",
    title: "4. Tutor recibe la solicitud",
    desc: "Cambiamos a la vista de Amaia (madre de Ibai #9). La pantalla es radicalmente más simple: cero ruido, solo su hijo y la acción requerida.",
    actionHint: "Pulsa el botón grande 'Responder Disponibilidad' en la tarjeta destacada."
  },
  {
    step: 5,
    role: "parent",
    screen: "screen_h_rsvp_parent",
    title: "5. Tutor responde en 3 segundos",
    desc: "Tres botones táctiles masivos de alta legibilidad: SÍ, NO, o TODAVÍA NO LO SÉ. Sin formularios largos.",
    actionHint: "Pulsa 'SÍ, PUEDE ASISTIR' y confirma la respuesta."
  },
  {
    step: 6,
    role: "coach",
    screen: "screen_d_event_detail_coach",
    title: "6. Entrenador consulta respuestas",
    desc: "Mikel comprueba en el detalle del evento cómo la lista de disponibles se ha consolidado.",
    actionHint: "La disponibilidad está clara. Observa quiénes siguen pendientes."
  },
  {
    step: 7,
    role: "coach",
    screen: "screen_d_event_detail_coach",
    title: "7. Recordar a pendientes con 1 tap",
    desc: "Sin redactar mensajes en WhatsApp ni perseguir a padres: un solo toque en 'Recordar a pendientes' envía un recordatorio automático.",
    actionHint: "Pulsa el botón 'Crear Convocatoria' fijado en la parte inferior."
  },
  {
    step: 8,
    role: "coach",
    screen: "screen_e_create_squad",
    title: "8. Crear convocatoria oficial",
    desc: "El entrenador parte de los disponibles y marca 12 jugadores. Contador flotante en tiempo real (12/12) y reservas identificados.",
    actionHint: "Pulsa 'Publicar Convocatoria Oficial (12)' para notificar a las familias convocadas."
  },
  {
    step: 9,
    role: "parent",
    screen: "screen_i_callup_parent",
    title: "9. Tutor consulta la convocatoria",
    desc: "Amaia recibe el aviso y ve: '¡IBAI ESTÁ CONVOCADO!'. Horarios de partido y vestuario, equipación obligatoria y confirmación.",
    actionHint: "Supongamos que surge un imprevisto. Pulsa '⚠️ Ya no puede asistir (Informar de baja)'."
  },
  {
    step: 10,
    role: "parent",
    screen: "screen_i_callup_parent",
    title: "10. Tutor informa de baja sobrevenida",
    desc: "Amaia indica el motivo justificado ('Fiebre 38.5°') con diálogo de seguridad para evitar errores accidentales.",
    actionHint: "Confirma la baja en el diálogo emergente para ver la reacción inmediata del sistema."
  },
  {
    step: 11,
    role: "coach",
    screen: "screen_f_squad_published_injury",
    title: "11. Entrenador recibe alerta de crisis",
    desc: "El entrenador recibe una alerta roja de Nivel 1 en su móvil: 'Ibai ya no puede asistir por fiebre. Plantilla incompleta: 11/12'.",
    actionHint: "El pánico habitual de WhatsApp se resuelve con el asistente de reemplazo inferior."
  },
  {
    step: 12,
    role: "coach",
    screen: "screen_f_squad_published_injury",
    title: "12. Sistema muestra sustitutos disponibles",
    desc: "La aplicación detecta automáticamente los 3 jugadores disponibles que no habían sido convocados: Ane, Nahia e Irati.",
    actionHint: "El sistema destaca a Ane Gorostiaga (#16) como Reserva 1 recomendada."
  },
  {
    step: 13,
    role: "coach",
    screen: "screen_f_squad_published_injury",
    title: "13. Entrenador convoca a Ane con 1 tap",
    desc: "Sin listas de espera ni mensajes confusos, Mikel pulsa '+ Convocar como sustituta' sobre Ane Gorostiaga.",
    actionHint: "Pulsa '+ Convocar como sustituta' o el botón inferior azul para resolver la baja."
  },
  {
    step: 14,
    role: "coach",
    screen: "screen_f_squad_published_injury",
    title: "14. Convocatoria actualizada y aviso enviado",
    desc: "La convocatoria vuelve a estar completa con 12/12 jugadores. La familia de Ane recibe la convocatoria y el tablón de avisos queda actualizado.",
    actionHint: "¡Flujo completado con éxito! Puedes explorar la plantilla y los avisos o reiniciar la demo."
  }
];

class TeamAppState {
  constructor() {
    this.currentRole = "coach"; // 'coach' | 'parent'
    this.currentScreen = "screen_a_home_coach";
    this.currentStepIndex = 0; // 0 to 13
    
    // Live dynamic scenario states
    this.tournamentCreated = true;
    this.parentRsvpConfirmed = false;
    this.squadPublished = false;
    this.ibaiHasDroppedOut = false;
    this.aneSubstituted = false;
    
    this.selectedSquadIds = new Set([9, 7, 4, 5, 10, 11, 3, 8, 2, 6, 1, 14]); // 12 players
  }

  setRole(role) {
    this.currentRole = role;
    if (role === "coach") {
      if (this.currentScreen.includes("parent")) {
        this.currentScreen = this.ibaiHasDroppedOut ? "screen_f_squad_published_injury" : "screen_a_home_coach";
      }
    } else {
      if (this.currentScreen.includes("coach") || this.currentScreen === "screen_j_roster") {
        this.currentScreen = this.squadPublished ? "screen_i_callup_parent" : "screen_g_home_parent";
      }
    }
    this.render();
  }

  goToScreen(screenId) {
    this.currentScreen = screenId;
    if (screenId.includes("parent")) {
      this.currentRole = "parent";
    } else if (screenId.includes("coach") || screenId === "screen_c_create_event" || screenId === "screen_e_create_squad") {
      this.currentRole = "coach";
    }
    this.render();
  }

  goToStep(stepNumber) {
    const target = GUIDED_STEPS.find(s => s.step === stepNumber);
    if (!target) return;
    this.currentStepIndex = stepNumber - 1;
    this.currentRole = target.role;
    this.currentScreen = target.screen;

    // Apply logical scenario state adjustments for each step
    if (stepNumber >= 5) this.parentRsvpConfirmed = true;
    if (stepNumber >= 8) this.squadPublished = true;
    if (stepNumber >= 10) this.ibaiHasDroppedOut = true;
    if (stepNumber >= 13) this.aneSubstituted = true;

    if (stepNumber < 5) this.parentRsvpConfirmed = false;
    if (stepNumber < 8) this.squadPublished = false;
    if (stepNumber < 10) this.ibaiHasDroppedOut = false;
    if (stepNumber < 13) this.aneSubstituted = false;

    this.render();
    this.showToast(`Paso ${stepNumber}: ${target.title}`);
  }

  nextStep() {
    if (this.currentStepIndex < GUIDED_STEPS.length - 1) {
      this.goToStep(this.currentStepIndex + 2);
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.goToStep(this.currentStepIndex);
    }
  }

  resetDemo() {
    this.currentRole = "coach";
    this.currentScreen = "screen_a_home_coach";
    this.currentStepIndex = 0;
    this.tournamentCreated = true;
    this.parentRsvpConfirmed = false;
    this.squadPublished = false;
    this.ibaiHasDroppedOut = false;
    this.aneSubstituted = false;
    this.selectedSquadIds = new Set([9, 7, 4, 5, 10, 11, 3, 8, 2, 6, 1, 14]);
    this.render();
    this.showToast("Demo reiniciada al estado inicial.");
  }

  togglePlayerInSquad(playerId) {
    if (this.selectedSquadIds.has(playerId)) {
      this.selectedSquadIds.delete(playerId);
    } else {
      if (this.selectedSquadIds.size >= 12) {
        this.showToast("Máximo 12 jugadores convocados permitidos.");
        return;
      }
      this.selectedSquadIds.add(playerId);
    }
    this.render();
  }

  triggerParentRsvp(answer) {
    if (answer === "SI") {
      this.parentRsvpConfirmed = true;
      this.showToast("✓ Respuesta registrada: Ibai asistirá al torneo.");
      this.goToScreen("screen_g_home_parent");
    } else if (answer === "NO") {
      this.showToast("Respuesta registrada: Ibai no podrá asistir.");
      this.goToScreen("screen_g_home_parent");
    } else {
      this.showToast("Respuesta registrada: Pendiente de confirmación.");
      this.goToScreen("screen_g_home_parent");
    }
  }

  triggerCallUpPublished() {
    this.squadPublished = true;
    this.showToast("📢 Convocatoria de 12 jugadores publicada y avisos enviados.");
    this.goToScreen("screen_f_squad_published_injury");
  }

  triggerLateInjury() {
    this.ibaiHasDroppedOut = true;
    this.showToast("⚠️ Baja de Ibai comunicada al entrenador.");
    this.goToStep(11);
  }

  triggerSubstitution() {
    this.aneSubstituted = true;
    this.selectedSquadIds.delete(9); // Ibai out
    this.selectedSquadIds.add(16); // Ane in
    this.showToast("✓ ¡Ane Gorostiaga (#16) convocada! Convocatoria completa 12/12.");
    this.goToStep(14);
  }

  openPlayerModal(playerId) {
    const player = SQUAD_DATA.find(p => p.id === playerId);
    if (!player) return;
    const modal = document.getElementById("player-detail-sheet");
    const nameEl = document.getElementById("sheet-player-name");
    const numEl = document.getElementById("sheet-player-num");
    const roleEl = document.getElementById("sheet-player-role");
    const tutorEl = document.getElementById("sheet-tutor-name");
    const phoneEl = document.getElementById("sheet-tutor-phone");
    const statusEl = document.getElementById("sheet-player-status");

    if (nameEl) nameEl.textContent = player.name;
    if (numEl) numEl.textContent = `#${player.number}`;
    if (roleEl) roleEl.textContent = player.role;
    if (tutorEl) tutorEl.textContent = player.tutor;
    if (phoneEl) phoneEl.textContent = player.phone;
    if (statusEl) {
      statusEl.textContent = player.status === "NO_DISPONIBLE" ? "No disponible (Baja justificada)" : (player.status === "PENDIENTE" ? "Pendiente de respuesta" : "Disponible para convocar");
    }

    if (modal) modal.classList.remove("hidden");
  }

  closePlayerModal() {
    const modal = document.getElementById("player-detail-sheet");
    if (modal) modal.classList.add("hidden");
  }

  showToast(message, duration = 3000) {
    const toastEl = document.getElementById("demo-toast");
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove("opacity-0", "pointer-events-none", "translate-y-2");
    toastEl.classList.add("opacity-100", "translate-y-0");
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toastEl.classList.add("opacity-0", "pointer-events-none", "translate-y-2");
      toastEl.classList.remove("opacity-100", "translate-y-0");
    }, duration);
  }

  render() {
    // 1. Update active screen view visibility
    const screens = document.querySelectorAll(".app-screen-view");
    screens.forEach(screen => {
      if (screen.id === this.currentScreen) {
        screen.classList.remove("hidden");
      } else {
        screen.classList.add("hidden");
      }
    });

    // 2. Update external demo controls
    const roleCoachBtn = document.getElementById("demo-role-coach");
    const roleParentBtn = document.getElementById("demo-role-parent");
    if (roleCoachBtn && roleParentBtn) {
      if (this.currentRole === "coach") {
        roleCoachBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer";
        roleParentBtn.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer";
      } else {
        roleParentBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer";
        roleCoachBtn.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer";
      }
    }

    // 3. Update guided step info
    const stepObj = GUIDED_STEPS[this.currentStepIndex];
    const stepBadge = document.getElementById("demo-step-badge");
    const stepTitle = document.getElementById("demo-step-title");
    const stepDesc = document.getElementById("demo-step-desc");
    const stepAction = document.getElementById("demo-step-action");
    const stepProgress = document.getElementById("demo-step-progress");

    if (stepBadge) stepBadge.textContent = `Paso ${stepObj.step}/14`;
    const infoBtnLabel = document.getElementById("info-btn-label");
    if (infoBtnLabel) infoBtnLabel.textContent = `Paso ${stepObj.step}`;
    if (stepTitle) stepTitle.textContent = stepObj.title;
    if (stepDesc) stepDesc.textContent = stepObj.desc;
    if (stepAction) stepAction.textContent = stepObj.actionHint;
    if (stepProgress) stepProgress.style.width = `${((this.currentStepIndex + 1) / 14) * 100}%`;

    // 4. Update screen selector dropdown value
    const screenSelect = document.getElementById("demo-screen-select");
    if (screenSelect) screenSelect.value = this.currentScreen;

    // 5. Update squad selection counter on Screen E
    const squadCounterEl = document.getElementById("squad-selection-counter");
    if (squadCounterEl) {
      const count = this.selectedSquadIds.size;
      squadCounterEl.textContent = `${count} / 12 Convocados`;
      const publishBtn = document.getElementById("squad-publish-btn");
      if (publishBtn) {
        publishBtn.innerHTML = `Publicar Convocatoria Oficial (${count}) <span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
        if (count === 12) {
          publishBtn.disabled = false;
          publishBtn.classList.remove("opacity-50", "cursor-not-allowed");
        } else {
          publishBtn.disabled = true;
          publishBtn.classList.add("opacity-50", "cursor-not-allowed");
        }
      }
    }

    // 6. Update Substitution Status on Screen F
    const alertBox = document.getElementById("injury-alert-box");
    const replacementSection = document.getElementById("replacement-assistant-box");
    const resolvedBox = document.getElementById("substitution-resolved-box");
    const substituteRow = document.getElementById("roster-ane-row");
    const ibaiRow = document.getElementById("roster-ibai-row");

    if (alertBox && replacementSection && resolvedBox) {
      if (this.aneSubstituted) {
        alertBox.classList.add("hidden");
        replacementSection.classList.add("hidden");
        resolvedBox.classList.remove("hidden");
        if (substituteRow) substituteRow.classList.remove("hidden");
        if (ibaiRow) {
          ibaiRow.classList.add("opacity-50", "line-through");
        }
      } else {
        alertBox.classList.remove("hidden");
        replacementSection.classList.remove("hidden");
        resolvedBox.classList.add("hidden");
        if (substituteRow) substituteRow.classList.add("hidden");
        if (ibaiRow) {
          ibaiRow.classList.remove("line-through");
        }
      }
    }

    // 7. Scroll mobile frame viewport to top
    const phoneContainer = document.getElementById("phone-viewport");
    if (phoneContainer) phoneContainer.scrollTop = 0;
  }
}

// Global instance
window.teamApp = new TeamAppState();
window.toggleInfoCard = function() {
  const card = document.getElementById('demo-step-card');
  const icon = document.getElementById('info-btn-icon');
  if (card) {
    card.classList.toggle('hidden');
    if (icon) {
      icon.textContent = card.classList.contains('hidden') ? 'expand_more' : 'expand_less';
    }
  }
};
document.addEventListener("DOMContentLoaded", () => {
  window.teamApp.render();
});
