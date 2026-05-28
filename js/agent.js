/**
 * F1 UNIVERSE - AGENT ENGINE (2026)
 * Sistema centralizado de toma de decisiones e interacción en tiempo real
 */

// 1. MEMORIA DE ESTADO DEL AGENTE
const AgentContext = {
  currentTab: "races",
  isSystemReady: false,
  lastSearchQuery: "",

  getSnapshot() {
    return {
      tab: this.currentTab,
      hasRaces: typeof S !== 'undefined' && !!S.races,
      hasStandings: typeof S !== 'undefined' && !!S.standings,
      loading: typeof S !== 'undefined' && S.loading
    };
  }
};

// 2. CATÁLOGO DE HERRAMIENTAS EJECUTABLES (ACTIONS)
const AgentTools = {
  // Cambia la pestaña visual de la aplicación
  switchTab(targetTab) {
    if (typeof go === 'function') {
      go(targetTab);
      AgentContext.currentTab = targetTab;
      return true;
    }
    return false;
  },

  // Cambia el filtro interno del mundial (Pilotos / Constructores)
  toggleStandingsFilter(filter) {
    this.switchTab('standings');
    if (typeof swt === 'function') {
      swt(filter);
      return true;
    }
    return false;
  },

  // Fuerza al sistema a realizar una petición en vivo a los servidores
  async triggerLiveSync() {
    if (typeof F1Agent !== 'undefined' && typeof F1Agent.initSystem === 'function') {
      await F1Agent.initSystem();
      return "Sincronización de telemetría y feeds completada con éxito.";
    }
    return "Error: El módulo de comunicación API no está disponible.";
  },

  // BÚSQUEDA AVANZADA EN TIEMPO REAL: Escanea pilotos, circuitos y países
  searchInRealTime(query) {
    const p = query.toLowerCase();
    let results = [];

    // Buscar en el calendario de carreras
    if (S && S.races) {
      S.races.forEach(r => {
        if (r.raceName.toLowerCase().includes(p) || 
            r.Circuit.circuitName.toLowerCase().includes(p) || 
            r.Circuit.Location.country.toLowerCase().includes(p)) {
          results.push(`🏁 **Carrera encontrada:** ${r.raceName} en ${r.Circuit.Location.country} (Fecha: ${fd(r.date)})`);
        }
      });
    }

    // Buscar en la clasificación de pilotos
    if (S && S.standings && S.standings.d) {
      S.standings.d.forEach(drv => {
        const fullName = `${drv.Driver.givenName} ${drv.Driver.familyName}`.toLowerCase();
        if (fullName.includes(p) || drv.Constructors?.[0]?.name.toLowerCase().includes(p)) {
          results.push(`👤 **Piloto:** ${drv.Driver.givenName} ${drv.Driver.familyName} (#${drv.position}) | Equipo: ${drv.Constructors[0].name} | Puntos: **${drv.points}**`);
        }
      });
    }

    return results;
  }
};

// 3. ENRUTADOR SEMÁNTICO DE INTENCIONES
const AgentRouter = {
  async processInput(userInput) {
    const prompt = userInput.trim().toLowerCase();
    AgentContext.lastSearchQuery = prompt;
    const state = AgentContext.getSnapshot();

    // COMANDO 1: Forzar actualización en tiempo real
    if (prompt.includes('actualiza') || prompt.includes('sincroniza') || prompt.includes('recarga') || prompt.includes('forzar')) {
      addMsg('a', "🔄 *Agente IA:* Conectando con los servidores de F1 para actualizar clasificaciones y tiempos...");
      const log = await AgentTools.triggerLiveSync();
      return `✅ **Acción del Agente:** ${log} Todo el panel visual se ha redibujado.`;
    }

    // COMANDO 2: Navegación automatizada por secciones de la interfaz
    if (prompt.includes('ir a') || prompt.includes('muéstrame') || prompt.includes('ver') || prompt.includes('pestaña') || prompt.includes('llévame')) {
      if (prompt.includes('carrera') || prompt.includes('calendario') || prompt.includes('circuito')) {
        AgentTools.switchTab('races');
        return "🤖 Entendido. Te he redirigido a la sección de **Carreras**. Aquí tienes el orden cronológico del campeonato.";
      }
      if (prompt.includes('constructores') || prompt.includes('escuderías') || prompt.includes('equipos')) {
        AgentTools.toggleStandingsFilter('c');
        return "🤖 ¡A la orden! He abierto el **Mundial de Constructores** con el desglose de puntos por piloto.";
      }
      if (prompt.includes('pilotos') || prompt.includes('mundial') || prompt.includes('clasificación')) {
        AgentTools.toggleStandingsFilter('d');
        return "🤖 Cambiando la vista al panel general de la clasificación de **Pilotos**.";
      }
    }

    // COMANDO 3: Consulta de la próxima carrera (Análisis predictivo de fechas)
    if (prompt.includes('próxima') || prompt.includes('proxima') || prompt.includes('cuándo') || prompt.includes('cuando') || prompt.includes('donde') || prompt.includes('dónde')) {
      if (!state.hasRaces) {
        addMsg('a', "⏳ *Agente IA:* No encuentro datos en la memoria local. Iniciando descarga automática...");
        await AgentTools.triggerLiveSync();
      }
      
      const now = new Date();
      const nextRace = S.races.find(r => new Date(r.date + 'T23:59:00') >= now);
      
      if (nextRace) {
        return `🏁 **Análisis de Calendario 2026:**\n\nLa próxima cita en el campeonato es el **${nextRace.raceName}**.\n📍 Circuito: **${nextRace.Circuit.circuitName}** (${nextRace.Circuit.Location.country}).\n📅 Gran Premio programado para el **${fd(nextRace.date)}**.`;
      }
    }

    // COMANDO 4: BÚSQUEDA ACTIVA EN TIEMPO REAL (Fuzzy Search de datos de F1)
    // Si el usuario escribe un nombre propio, un país o una marca, el agente escanea la app por completo
    if (prompt.length > 2) {
      const searchMatches = AgentTools.searchInRealTime(prompt);
      if (searchMatches.length > 0) {
        return `🔍 **Resultados de la búsqueda en tiempo real para "${userInput}":**\n\n${searchMatches.join('\n\n')}`;
      }
    }

    // Respuesta por defecto si no sabe qué hacer
    return "🤖 Estoy listo para gestionar la aplicación. Puedes pedirme acciones como:\n* *'Llévame al mundial de constructores'* \n* *'Busca a Ferrari'* (Búsqueda en tiempo real) \n* *'Actualiza los datos ahora mismo'*";
  }
};
