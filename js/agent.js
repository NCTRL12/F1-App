/**
 * MOTOR DEL AGENTE CENTRAL F1 (2026)
 * Controla la interfaz, cambia pestañas y hace búsquedas cruzadas en tiempo real.
 */

const AgentTools = {
  // Acción: Moverse entre pestañas
  switchTab(targetTab) {
    if (typeof go === 'function') { go(targetTab); return true; }
    return false;
  },

  // Acción: Cambiar filtros del mundial (Pilotos o Constructores)
  toggleStandings(filter) {
    this.switchTab('standings');
    if (typeof swt === 'function') { swt(filter); return true; }
    return false;
  },

  // Acción: Búsqueda cruzada masiva en caliente (Memoria de datos)
  searchRealTime(query) {
    const p = query.toLowerCase();
    let matches = [];

    // Buscar en las carreras guardadas
    if (S && S.races) {
      S.races.forEach(r => {
        if (r.raceName.toLowerCase().includes(p) || r.Circuit.circuitName.toLowerCase().includes(p)) {
          matches.push(`🏁 **GP Encontrado:** ${r.raceName}\n📍 Trazado: ${r.Circuit.circuitName}\n📅 Fecha: ${fd(r.date)}`);
        }
      });
    }

    // Buscar en la lista de pilotos y sus puntos
    if (S && S.standings && S.standings.d) {
      S.standings.d.forEach(drv => {
        const name = `${drv.Driver.givenName} ${drv.Driver.familyName}`.toLowerCase();
        if (name.includes(p) || drv.Constructors?.[0]?.name.toLowerCase().includes(p)) {
          matches.push(`👤 **Piloto:** ${drv.Driver.givenName} ${drv.Driver.familyName} (#${drv.position})\n🏆 Escudería: ${drv.Constructors[0].name} | Puntos: **${drv.points} pts**`);
        }
      });
    }

    return matches;
  }
};

const AgentRouter = {
  async processInput(userInput) {
    const prompt = userInput.toLowerCase().trim();

    // 1. Detección automática de intenciones para mover la UI (Pestañas)
    if (prompt.includes('ir a') || prompt.includes('muéstrame') || prompt.includes('ver') || prompt.includes('pestaña')) {
      if (prompt.includes('carrera') || prompt.includes('calendario')) {
        AgentTools.switchTab('races');
        return "🤖 ¡Recibido! Te acabo de mover a la pestaña de **Carreras**.";
      }
      if (prompt.includes('constructores') || prompt.includes('escuderías') || prompt.includes('equipos')) {
        AgentTools.toggleStandings('c');
        return "🤖 Entendido. Cambiando panel al **Mundial de Constructores** con los desgloses activos.";
      }
      if (prompt.includes('pilotos') || prompt.includes('mundial')) {
        AgentTools.toggleStandings('d');
        return "🤖 Hecho, jefe. Pantalla cambiada a la clasificación general de **Pilotos**.";
      }
    }

    // 2. Consulta inteligente de la próxima carrera
    if (prompt.includes('próxima') || prompt.includes('proxima') || prompt.includes('cuándo') || prompt.includes('cuando') || prompt.includes('donde') || prompt.includes('dónde')) {
      if (S && S.races) {
        const now = new Date();
        const next = S.races.find(r => new Date(r.date + 'T23:59:00') >= now);
        if (next) {
          return `🏁 **Sincronización del circuito completada:**\n\nLa próxima cita es el **${next.raceName}**.\n📍 Circuito: **${next.Circuit.circuitName}**.\n📅 Fecha: **${fd(next.date)}**.`;
        }
      }
      return "⚠️ Los datos del mundial aún se están cargando desde el feed, dame un segundo.";
    }

    // 3. Búsqueda libre en caliente si escribe un nombre, escudería o palabra suelta
    if (prompt.length > 2) {
      const search = AgentTools.searchRealTime(prompt);
      if (search.length > 0) {
        return `🔍 **Búsqueda en tiempo real ejecutada:**\n\n${search.join('\n\n')}`;
      }
    }

    return "🤖 No he podido ejecutar ninguna orden. Puedes pedirme cosas como:\n* *'Llévame a la pestaña de constructores'* \n* *'¿Dónde se corre la próxima carrera?'* \n* *'Busca a Verstappen'*";
  }
};
