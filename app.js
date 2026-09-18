/**
 * Talde Hemendik! V2 - Product Architecture Controller
 * Centered on the Coach's mental model:
 * 1. La Mesa del Entrenador (INICIO)
 * 2. El Tiempo del Equipo (AGENDA)
 * 3. Las Personas (EQUIPO / PLANTILLA)
 * 4. Comunicaciones Oficiales (AVISOS)
 * Plus Initial Onboarding & Parent Flow (Elena Gómez / Ibai #9)
 */

const SQUAD_DATA = [
  { id: 1, number: 1, name: "Gorka Elejalde", role: "Portero", status: "CONVOCADO", rsvp: "Confirmado ayer 19:10", tutor: "Iker Elejalde", phone: "611 22 33 44", medical: "Apto · Sin observaciones" },
  { id: 2, number: 2, name: "Eneko Zabala", role: "Defensa", status: "CONVOCADO", rsvp: "Confirmado hoy 08:15", tutor: "Joseba Zabala", phone: "622 33 44 55", medical: "Apto" },
  { id: 3, number: 3, name: "Julen Ortiz", role: "Defensa", status: "CONVOCADO", rsvp: "Confirmado ayer 20:20", tutor: "Xabier Ortiz", phone: "633 44 55 66", medical: "Apto" },
  { id: 4, number: 4, name: "Jon Beltrán", role: "Defensa", status: "CONVOCADO", rsvp: "Confirmado hoy 08:30", tutor: "Iñaki Beltrán", phone: "644 55 66 77", medical: "Apto" },
  { id: 5, number: 5, name: "Markel Saenz", role: "Centrocampista", status: "CONVOCADO", rsvp: "Confirmado ayer 19:40", tutor: "Elena Saenz", phone: "655 66 77 88", medical: "Apto" },
  { id: 6, number: 6, name: "Ander Lopez", role: "Centrocampista", status: "CONVOCADO", rsvp: "Confirmado ayer 21:00", tutor: "Begoña Lopez", phone: "666 77 88 99", medical: "Apto" },
  { id: 7, number: 7, name: "Unai Martinez", role: "Delantero", status: "CONVOCADO", rsvp: "Confirmado ayer 20:05", tutor: "Kepa Martinez", phone: "677 88 99 00", medical: "Apto" },
  { id: 8, number: 8, name: "Oier Gomez", role: "Centrocampista", status: "CONVOCADO", rsvp: "Confirmado ayer 19:55", tutor: "Maite Gomez", phone: "688 99 00 11", medical: "Apto" },
  { id: 9, number: 9, name: "Ibai Aranguren", role: "Delantero Centro", status: "BAJA_MEDICA", rsvp: "Baja (Esguince de tobillo leve)", tutor: "Elena Gómez (Madre)", phone: "620 44 55 66", medical: "Plantilla correctora bota der. · Esguince leve de tobillo" },
  { id: 10, number: 10, name: "Mikel Zabaleta", role: "Centrocampista", status: "CONVOCADO", rsvp: "Confirmado ayer 21:15", tutor: "Aitor Zabaleta", phone: "699 00 11 22", medical: "Apto" },
  { id: 11, number: 11, name: "Aimar Ortiz", role: "Delantero", status: "CONVOCADO", rsvp: "Confirmado hoy 09:00", tutor: "Miren Ortiz", phone: "600 11 22 33", medical: "Apto" },
  { id: 12, number: 12, name: "Nahia Garcia", role: "Centrocampista", status: "RESERVA", rsvp: "Confirmó disponibilidad", tutor: "Nerea Garcia", phone: "612 23 34 45", medical: "Apto" },
  { id: 13, number: 13, name: "Asier Urkijo", role: "Centrocampista", status: "NO_DISPONIBLE", rsvp: "No puede (Viaje familiar)", tutor: "Mikel Urkijo", phone: "623 34 45 56", medical: "Apto" },
  { id: 14, number: 14, name: "Iker Baroja", role: "Extremo", status: "CONVOCADO", rsvp: "Confirmado ayer 22:30", tutor: "Carmen Baroja", phone: "634 45 56 67", medical: "Apto" },
  { id: 15, number: 15, name: "Irati Fernandez", role: "Delantera", status: "RESERVA", rsvp: "Confirmó disponibilidad", tutor: "Patxi Fernandez", phone: "645 56 67 78", medical: "Apto" },
  { id: 16, number: 16, name: "Ane Mintegi", role: "Centrocampista", status: "SUSTITUTA_ELEGIDA", rsvp: "Disponible · Reserva Torneo", tutor: "Iñaki Mintegi", phone: "644 55 66 77", medical: "Apto" },
  { id: 17, number: 17, name: "Olatz Bengoa", role: "Defensa", status: "NO_DISPONIBLE", rsvp: "No puede (Reposo lesión)", tutor: "Sonia Bengoa", phone: "656 67 78 89", medical: "En recuperación" },
  { id: 18, number: 18, name: "Peio Gómez", role: "Defensa", status: "NO_DISPONIBLE", rsvp: "Plazo cerrado sin respuesta", tutor: "Asier Gómez", phone: "667 78 89 90", medical: "Apto" }
];

const GUIDED_STEPS = [
  {
    step: 1,
    role: "onboard",
    screen: "v2_00_onboarding_welcome",
    tab: "onboard",
    title: "1. Acceso Inicial: ¿Cómo vas a utilizar la app?",
    desc: "Pantalla única de bienvenida para todo el club. El usuario elige su función: 'Soy entrenador / staff' o 'Soy padre, madre o tutor'. Sin apps separadas.",
    actionHint: "Pulsa 'Soy entrenador / staff' para iniciar la creación del equipo."
  },
  {
    step: 2,
    role: "coach",
    screen: "v2_00_coach_create_team",
    tab: "onboard",
    title: "2. Flujo Entrenador: Crear equipo & Código OYON16",
    desc: "Formulario corto: Infantil A, CD Oyón, Fútbol. 18 jugadores precargados federativos. Se genera el código OYON16 con botón para WhatsApp.",
    actionHint: "Pulsa 'Ir a la mesa del entrenador' para acceder al panel con la puesta en marcha."
  },
  {
    step: 3,
    role: "parent",
    screen: "v2_00_parent_join_team",
    tab: "onboard",
    title: "3. Flujo Familia: Unirse al equipo & vincular menor",
    desc: "Elena Gómez entra con el código OYON16. Selecciona a su hijo Ibai Aranguren (#9). El sistema exige validación del míster para proteger los datos médicos del menor.",
    actionHint: "Pulsa 'Enviar solicitud de vinculación' para notificar al cuerpo técnico."
  },
  {
    step: 4,
    role: "coach",
    screen: "v2_01_coach_home",
    tab: "inicio",
    title: "4. Mesa del Entrenador: Puesta en marcha & Aprobación",
    desc: "El inicio muestra temporalmente el estado de puesta en marcha (18 jugadores, 12 vinculadas, 6 pendientes) y la solicitud de Elena Gómez. Con 1 toque el míster aprueba.",
    actionHint: "Pulsa 'Aceptar' en la solicitud de Elena Gómez para vincularla a Ibai (#9)."
  },
  {
    step: 5,
    role: "coach",
    screen: "v2_01_coach_home",
    tab: "inicio",
    title: "5. La Mesa del Entrenador: Triage y Pendiente de ti",
    desc: "El míster visualiza de inmediato la alerta crítica del Torneo Oyón: 11/12 convocados por la baja médica sobrevenida de Ibai Aranguren.",
    actionHint: "Pulsa en 'Resolver baja' en la tarjeta del Torneo Oyón."
  },
  {
    step: 6,
    role: "coach",
    screen: "v2_02_coach_agenda",
    tab: "agenda",
    title: "6. Agenda Semanal: Cronología y Fases de Eventos",
    desc: "Los eventos ordenados en el tiempo: HOY entreno (18:00h), SÁBADO Torneo Oyón (con aviso de baja), LUNES entreno. Cada tarjeta refleja la fase de su Event Hub.",
    actionHint: "Pulsa 'Gestionar evento' en la tarjeta del Torneo Oyón."
  },
  {
    step: 7,
    role: "coach",
    screen: "v2_05_event_hub_normal",
    tab: "agenda",
    title: "7. Event Hub: Disponibilidad como protagonista",
    desc: "En fase de recogida, la disponibilidad es el bloque principal: 14 Disponibles, 2 No disponibles, 2 Pendientes. La convocatoria no estorba hasta cerrar el plazo.",
    actionHint: "Pulsa 'Recordar a pendientes (2)' para enviar un aviso instantáneo."
  },
  {
    step: 8,
    role: "coach",
    screen: "v2_06_event_hub_injury",
    tab: "agenda",
    title: "8. Sustitución de Baja: Tratamiento Neutral de Reservas",
    desc: "Ibai causa baja médica. El sistema presenta a las 3 reservas disponibles (Ane #16, Nahia #12, Irati #15) con la misma visibilidad neutra, sin rankings arbitrarios.",
    actionHint: "Selecciona a Ane Mintegi (#16) y pulsa 'Confirmar sustitución'."
  },
  {
    step: 9,
    role: "coach",
    screen: "v2_03_coach_roster",
    tab: "equipo",
    title: "9. Plantilla & Ficha Individual de Ibai (#9)",
    desc: "18 fichas federativas con filtros rápidos. La ficha individual de Ibai muestra su lesión, contactos de emergencia protegidos de Elena y seguro federativo.",
    actionHint: "Observa la ficha de Ibai y luego pulsa 'Familia' en la barra superior."
  },
  {
    step: 10,
    role: "parent",
    screen: "v2_07_parent_home",
    tab: "inicio",
    title: "10. Inicio Tutor: Solo lo que le importa a la familia",
    desc: "Elena Gómez solo ve a su hijo Ibai, sus horarios y la acción pendiente destacada para el fin de semana, sin listas tácticas de otros 17 niños.",
    actionHint: "Pulsa 'Responder disponibilidad' en la tarjeta del Torneo Oyón."
  },
  {
    step: 11,
    role: "parent",
    screen: "v2_08_parent_rsvp",
    tab: "inicio",
    title: "11. RSVP en 3 Segundos: Cero fricción para familias",
    desc: "3 botones grandes con ergonomía táctil: SÍ / NO / DUDA. Permite añadir notas para el míster y confirmar con un toque.",
    actionHint: "Selecciona una opción y pulsa 'Guardar respuesta'."
  }
];

class TeamAppState {
  constructor() {
    this.currentRole = "onboard"; // 'onboard' | 'coach' | 'parent'
    this.currentScreen = "v2_00_onboarding_welcome";
    this.currentTab = "inicio";
    this.currentStepIndex = 0;
    this.selectedSubstitute = "Ane Mintegi";
    this.substitutionConfirmed = false;
    this.parentRsvpChoice = "SI";
    this.isElenaApproved = false;
    this.linkedFamiliesCount = 12;
    this.pendingFamiliesCount = 6;
  }

  init() {
    // Deep linking & URL parameter handling (WhatsApp invites / RSVP links)
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get("screen") || window.location.hash.replace("#", "");
    const joinCode = params.get("join");
    const rsvpParam = params.get("rsvp");

    if (joinCode || screenParam === "v2_00_parent_join_team") {
      this.currentRole = "parent";
      this.goToScreen("v2_00_parent_join_team");
      if (joinCode) this.showToast("Código de invitación " + joinCode + " validado.");
    } else if (rsvpParam || screenParam === "v2_08_parent_rsvp") {
      this.currentRole = "parent";
      this.goToScreen("v2_08_parent_rsvp", "inicio");
    } else if (screenParam && document.getElementById(screenParam)) {
      if (screenParam.startsWith("v2_07_") || screenParam.startsWith("v2_08_")) {
        this.currentRole = "parent";
      } else if (screenParam.startsWith("v2_00_")) {
        this.currentRole = "onboard";
      } else {
        this.currentRole = "coach";
      }
      this.goToScreen(screenParam);
    } else {
      this.goToScreen(this.currentScreen);
    }

    this.updateBottomNav();
    this.updateRoleUI();
    this.updateStepUI();
  }

  setRole(role) {
    this.currentRole = role;
    if (role === "onboard") {
      this.goToScreen("v2_00_onboarding_welcome");
    } else if (role === "coach") {
      this.goToScreen("v2_01_coach_home", "inicio");
    } else {
      this.goToScreen("v2_07_parent_home", "inicio");
    }
    this.updateRoleUI();
    this.updateBottomNav();
    const roleLabels = {
      onboard: "Modo Acceso Inicial / Onboarding",
      coach: "Modo Entrenador: Mikel Zubeldia (CD Oyón)",
      parent: "Modo Familia: Elena Gómez (Madre de Ibai #9)"
    };
    this.showToast(roleLabels[role] || "Cambio de vista realizado");
  }

  goToTab(tab) {
    this.currentTab = tab;
    if (this.currentRole === "coach") {
      if (tab === "inicio") this.goToScreen("v2_01_coach_home", "inicio");
      else if (tab === "agenda") this.goToScreen("v2_02_coach_agenda", "agenda");
      else if (tab === "equipo") this.goToScreen("v2_03_coach_roster", "equipo");
      else if (tab === "avisos") this.goToScreen("screen_k_notices", "avisos");
    } else if (this.currentRole === "parent") {
      if (tab === "inicio") this.goToScreen("v2_07_parent_home", "inicio");
      else if (tab === "agenda") this.goToScreen("v2_02_coach_agenda", "agenda");
      else if (tab === "equipo" || tab === "hijos") this.goToScreen("v2_04_player_detail", "hijos");
      else if (tab === "avisos") this.goToScreen("screen_k_notices", "avisos");
    } else {
      // In onboard mode, clicking tabs switches to coach view
      this.setRole("coach");
      this.goToTab(tab);
    }
  }

  goToScreen(screenId, tab = null) {
    this.currentScreen = screenId;
    if (tab) this.currentTab = tab;

    // Hide all screens
    const allScreens = document.querySelectorAll(".app-screen-view");
    allScreens.forEach(s => s.classList.add("hidden"));

    // Show target screen
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove("hidden");
      const viewport = document.getElementById("phone-viewport");
      if (viewport) viewport.scrollTop = 0;
    }

    // Sync select dropdown in toolbar
    const select = document.getElementById("demo-screen-select");
    if (select) select.value = screenId;

    this.updateBottomNav();
  }

  updateBottomNav() {
    const bottomNav = document.getElementById("master-bottom-nav");
    if (!bottomNav) return;

    // If on onboarding screen, hide bottom nav
    if (this.currentScreen.startsWith("v2_00_")) {
      bottomNav.classList.add("hidden");
      return;
    } else {
      bottomNav.classList.remove("hidden");
    }

    const tabInicio = document.getElementById("nav-tab-inicio");
    const tabAgenda = document.getElementById("nav-tab-agenda");
    const tabEquipo = document.getElementById("nav-tab-equipo");
    const tabAvisos = document.getElementById("nav-tab-avisos");
    const equipoLabel = document.getElementById("nav-label-equipo");
    const equipoIcon = document.getElementById("nav-icon-equipo");

    if (equipoLabel) {
      equipoLabel.textContent = this.currentRole === "coach" ? "Equipo" : "Mis Hijos";
    }
    if (equipoIcon) {
      equipoIcon.textContent = this.currentRole === "coach" ? "groups" : "face";
    }

    // Reset styles
    [tabInicio, tabAgenda, tabEquipo, tabAvisos].forEach(el => {
      if (el) {
        el.className = "flex-1 flex flex-col items-center justify-center py-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer";
        const label = el.querySelector("span:last-child");
        if (label) label.className = "text-[11px] font-medium tracking-tight";
      }
    });

    // Determine active tab
    let activeTabEl = tabInicio;
    if (this.currentTab === "agenda" || this.currentScreen === "v2_02_coach_agenda" || this.currentScreen === "v2_05_event_hub_normal" || this.currentScreen === "v2_06_event_hub_injury" || this.currentScreen === "screen_c_create_event") {
      activeTabEl = tabAgenda;
    } else if (this.currentTab === "equipo" || this.currentTab === "hijos" || this.currentScreen === "v2_03_coach_roster" || this.currentScreen === "v2_04_player_detail") {
      activeTabEl = tabEquipo;
    } else if (this.currentTab === "avisos" || this.currentScreen === "screen_k_notices") {
      activeTabEl = tabAvisos;
    }

    if (activeTabEl) {
      activeTabEl.className = "flex-1 flex flex-col items-center justify-center py-1 text-primary font-bold transition-colors cursor-pointer";
      const label = activeTabEl.querySelector("span:last-child");
      if (label) label.className = "text-[11px] font-bold tracking-tight text-primary";
    }
  }

  updateRoleUI() {
    const btnOnboard = document.getElementById("role-btn-onboard");
    const btnCoach = document.getElementById("role-btn-coach");
    const btnParent = document.getElementById("role-btn-parent");

    [btnOnboard, btnCoach, btnParent].forEach(btn => {
      if (btn) btn.className = "px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer";
    });

    if (this.currentRole === "onboard" && btnOnboard) {
      btnOnboard.className = "px-2 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs transition-all cursor-pointer";
    } else if (this.currentRole === "coach" && btnCoach) {
      btnCoach.className = "px-2 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs transition-all cursor-pointer";
    } else if (this.currentRole === "parent" && btnParent) {
      btnParent.className = "px-2 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs transition-all cursor-pointer";
    }
  }

  nextStep() {
    if (this.currentStepIndex < GUIDED_STEPS.length - 1) {
      this.currentStepIndex++;
      this.applyCurrentStep();
    }
  }

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.applyCurrentStep();
    }
  }

  applyCurrentStep() {
    const step = GUIDED_STEPS[this.currentStepIndex];
    if (this.currentRole !== step.role) {
      this.currentRole = step.role;
      this.updateRoleUI();
    }
    this.goToScreen(step.screen, step.tab);
    this.updateStepUI();
  }

  updateStepUI() {
    const step = GUIDED_STEPS[this.currentStepIndex];
    const titleEl = document.getElementById("demo-step-title");
    const descEl = document.getElementById("demo-step-desc");
    const actionEl = document.getElementById("demo-step-action");
    const progressEl = document.getElementById("demo-step-progress");

    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (actionEl) actionEl.textContent = step.actionHint;
    if (progressEl) {
      const pct = Math.round(((this.currentStepIndex + 1) / GUIDED_STEPS.length) * 100);
      progressEl.style.width = `${pct}%`;
    }
  }

  // --- Onboarding Specific Interactions ---
  finishCoachSetup() {
    this.currentRole = "coach";
    this.updateRoleUI();
    this.goToScreen("v2_01_coach_home", "inicio");
    this.showToast("✓ Equipo CD Oyón · Infantil A creado con 18 jugadores federados precargados.");
  }

  shareInviteCode() {
    const inviteLink = "https://taldehemendik.app/unete/OYON16";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink).catch(() => {});
    }
    this.showToast("📲 Invitación WhatsApp copiada: 'Únete al CD Oyón Infantil A con código OYON16'");
  }

  copyInviteCode(btn) {
    const code = "OYON16";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.showToast("Código OYON16 copiado al portapapeles.");
  }

  submitParentJoinRequest() {
    const btn = document.getElementById("btn-submit");
    if (btn) {
      btn.disabled = true;
      btn.classList.remove("bg-primary-container");
      btn.classList.add("bg-secondary");
      btn.innerHTML = `<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span><span>Enviando al míster...</span>`;
    }

    setTimeout(() => {
      if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined text-[20px]">check_circle</span><span>¡Solicitud enviada a Mikel Zubeldia!</span>`;
      }
      this.showToast("✓ Solicitud de vinculación registrada para Ibai #9. Esperando aprobación técnica.");
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.classList.add("bg-primary-container");
          btn.classList.remove("bg-secondary");
          btn.innerHTML = `<span>Enviar solicitud de vinculación</span><span class="material-symbols-outlined text-[20px]">send</span>`;
        }
        // Advance to step 4 or show coach view
        this.currentStepIndex = 3;
        this.applyCurrentStep();
      }, 1400);
    }, 1000);
  }

  approveGuardianRequest() {
    this.isElenaApproved = true;
    this.linkedFamiliesCount = 13;
    this.pendingFamiliesCount = 5;

    const reqCard = document.getElementById("coach-pending-approval-card");
    const successBadge = document.getElementById("coach-approval-success-badge");
    const linkedEl = document.getElementById("coach-linked-count");
    const pendingEl = document.getElementById("coach-pending-count");

    if (reqCard) reqCard.classList.add("hidden");
    if (successBadge) successBadge.classList.remove("hidden");
    if (linkedEl) linkedEl.textContent = this.linkedFamiliesCount;
    if (pendingEl) pendingEl.textContent = this.pendingFamiliesCount;

    this.showToast("✓ Vinculación aprobada: Elena Gómez ahora tiene acceso a la ficha de Ibai Aranguren.");
  }

  rejectGuardianRequest() {
    const reqCard = document.getElementById("coach-pending-approval-card");
    if (reqCard) reqCard.classList.add("hidden");
    this.showToast("Solicitud rechazada.");
  }

  dismissOnboardingBanner() {
    const banner = document.getElementById("coach-onboarding-banner");
    if (banner) {
      banner.style.transition = "all 0.3s ease-out";
      banner.style.opacity = "0";
      banner.style.transform = "scale(0.95)";
      setTimeout(() => {
        banner.classList.add("hidden");
        this.showToast("✓ Estado de puesta en marcha ocultado. Mostrando La Mesa del Entrenador.");
      }, 300);
    }
  }

  // --- Injury & Event Hub Interactions ---
  selectReserve(name) {
    this.selectedSubstitute = name;
    ["ane", "nahia", "irati"].forEach(cand => {
      const card = document.getElementById(`sub-card-${cand}`);
      const radio = document.getElementById(`sub-radio-${cand}`);
      if (card) {
        if (name.toLowerCase().includes(cand)) {
          card.classList.add("border-primary", "bg-blue-50/40");
          card.classList.remove("border-outline-variant/60");
          if (radio) radio.textContent = "radio_button_checked";
        } else {
          card.classList.remove("border-primary", "bg-blue-50/40");
          card.classList.add("border-outline-variant/60");
          if (radio) radio.textContent = "radio_button_unchecked";
        }
      }
    });
    this.showToast(`Sustituta elegida para convocar: ${name}`);
  }

  confirmSubstitution() {
    this.substitutionConfirmed = true;
    const banner = document.getElementById("injury-resolved-banner");
    if (banner) banner.classList.remove("hidden");
    const activeSection = document.getElementById("injury-active-alert");
    if (activeSection) activeSection.classList.add("opacity-50");

    this.showToast(`✓ ¡Convocatoria 12/12 completa! Se ha convocado a ${this.selectedSubstitute} y se ha emitido el aviso oficial.`);
    setTimeout(() => {
      this.goToScreen("v2_01_coach_home", "inicio");
    }, 1800);
  }

  nudgePending() {
    this.showToast("🔔 Recordatorio instantáneo enviado a Ane Mintegi y Peio Gómez vía App.");
  }

  selectRsvpOption(choice) {
    this.parentRsvpChoice = choice;
    const options = ["si", "no", "duda"];
    options.forEach(opt => {
      const el = document.getElementById(`rsvp-opt-${opt}`);
      const rad = document.getElementById(`rsvp-radio-${opt}`);
      if (el) {
        if (opt === choice.toLowerCase()) {
          el.classList.add("ring-2", "ring-primary");
          if (rad) rad.textContent = "radio_button_checked";
        } else {
          el.classList.remove("ring-2", "ring-primary");
          if (rad) rad.textContent = "radio_button_unchecked";
        }
      }
    });
  }

  saveParentRsvp() {
    const statusMap = {
      SI: "✓ Disponibilidad confirmada: SÍ, asistirá.",
      NO: "Disponibilidad guardada: NO asistirá.",
      DUDA: "Disponibilidad guardada: Pendiente de confirmación."
    };
    this.showToast(statusMap[this.parentRsvpChoice] || "Respuesta guardada con éxito.");
    setTimeout(() => {
      this.goToScreen("v2_07_parent_home", "inicio");
    }, 1200);
  }

  showToast(message) {
    const toast = document.getElementById("demo-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("opacity-0", "pointer-events-none", "translate-y-2");
    toast.classList.add("opacity-100", "translate-y-0");

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove("opacity-100", "translate-y-0");
      toast.classList.add("opacity-0", "pointer-events-none", "translate-y-2");
    }, 3200);
  }

  showPlayerModal(playerId) {
    const player = SQUAD_DATA.find(p => p.id === playerId);
    if (!player) return;
    if (player.id === 9) {
      this.goToScreen("v2_04_player_detail", "equipo");
      return;
    }
    const modal = document.getElementById("player-detail-sheet");
    if (modal) {
      document.getElementById("sheet-player-num").textContent = `#${player.number}`;
      document.getElementById("sheet-player-name").textContent = player.name;
      document.getElementById("sheet-player-role").textContent = `${player.role} · CD Oyón Infantil A`;
      document.getElementById("sheet-player-status").textContent = player.rsvp;
      document.getElementById("sheet-tutor-name").textContent = player.tutor;
      document.getElementById("sheet-tutor-phone").textContent = player.phone;
      modal.classList.remove("hidden");
    }
  }

  closePlayerModal() {
    const modal = document.getElementById("player-detail-sheet");
    if (modal) modal.classList.add("hidden");
  }

  filterRoster(type) {
    const rows = document.querySelectorAll(".roster-player-row");
    rows.forEach(r => {
      if (type === "all") {
        r.classList.remove("hidden");
      } else if (type === "disponibles") {
        r.classList.toggle("hidden", r.dataset.status === "baja");
      } else if (type === "convocados") {
        r.classList.toggle("hidden", r.dataset.convocado !== "true");
      } else if (type === "bajas") {
        r.classList.toggle("hidden", r.dataset.status !== "baja");
      }
    });
    this.showToast(`Filtro aplicado: ${type.toUpperCase()}`);
  }

  resetDemo() {
    this.currentStepIndex = 0;
    this.substitutionConfirmed = false;
    this.isElenaApproved = false;
    this.linkedFamiliesCount = 12;
    this.pendingFamiliesCount = 6;
    const reqCard = document.getElementById("coach-pending-approval-card");
    const successBadge = document.getElementById("coach-approval-success-badge");
    const banner = document.getElementById("coach-onboarding-banner");
    if (reqCard) reqCard.classList.remove("hidden");
    if (successBadge) successBadge.classList.add("hidden");
    if (banner) {
      banner.classList.remove("hidden");
      banner.style.opacity = "1";
      banner.style.transform = "scale(1)";
    }
    this.setRole("onboard");
    this.applyCurrentStep();
    this.showToast("Demo reiniciada al inicio de Onboarding.");
  }
}

// Global instance
const teamApp = new TeamAppState();
window.teamApp = teamApp;

document.addEventListener("DOMContentLoaded", () => {
  teamApp.init();
});
