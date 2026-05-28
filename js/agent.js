/**
 * MOTOR DEL AGENTE CENTRAL F1 (2026) - EDICIÓN INTEGRADA (SIN N8N)
 * Se conecta directamente con la API de IA usando salidas estructuradas en JSON.
 */

// ⚠️ PEGA AQUÍ TU CLAVE SECRETA DE DESARROLLO
const IA_API_KEY = "TU_API_KEY_DE_GEMINI_O_OPENAI_AQUÍ";

const AgentTools = {
  // Acción: Moverse entre pestañas de la app
  switchTab(targetTab) {
    if (typeof go === 'function') { 
      go(targetTab); 
      return `Éxito: Interfaz movida a la pestaña ${targetTab}`; 
    }
    return "Error: La función de navegación no está lista.";
  },

  // Acción: Cambiar filtros del mundial (Pilotos o Constructores)
  toggleStandings(filter) {
    this.switchTab('standings');
    if (typeof swt === 'function') { 
      swt(filter); 
      return `Éxito: Filtro cambiado a ${filter === 'd' ? 'Pilotos' : 'Constructores'}`; 
    }
    return "Error: La función de filtrado no está lista.";
  }
};

const AgentRouter = {
  async processInput(userInput) {
    
    // Si no has configurado tu clave, el bot te avisa
    if (IA_API_KEY.includes("TU_API_KEY")) {
      return "⚠️ **Error del Agente:** No has configurado tu `IA_API_KEY` dentro del archivo `js/agent.js`. Introduce tu clave de desarrollo para activar el razonamiento.";
    }

    // Usaremos el modelo gpt-4o-mini por su velocidad y bajo coste (puedes cambiarlo por el endpoint de Gemini si prefieres)
    const API_URL = "https://api.openai.com/v1/chat/completions";

    // Configuramos las instrucciones del sistema y el formato estricto de respuesta
    const systemInstruction = `Eres el Agente IA de una app de F1. Analiza el mensaje del usuario y decide si debes ejecutar una acción visual. 
    Debes responder OBLIGATORIAMENTE con un formato JSON que contenga estos tres campos:
    {
      "reply": "Tu respuesta redactada en español para el chat.",
      "action": "switchTab", "toggleStandings" o null si no se requiere acción.,
      "argument": "races", "standings", "chat", "d" (pilotos) o "c" (constructores) según la acción, o null.
    }`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${IA_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userInput }
          ],
          // Forzamos al modelo a responder estrictamente en formato JSON
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (!response.ok) throw new Error("Error en la comunicación con el servidor de IA.");

      const data = await response.json();
      // Parseamos el JSON que ha fabricado el cerebro de la IA
      const aiResponse = JSON.parse(data.choices[0].message.content);

      // Si la IA ha deducido una acción técnica, el navegador la ejecuta al instante
      if (aiResponse.action) {
        if (aiResponse.action === "switchTab") {
          AgentTools.switchTab(aiResponse.argument);
        } else if (aiResponse.action === "toggleStandings") {
          AgentTools.toggleStandings(aiResponse.argument);
        }
      }

      // Mostramos el texto inteligente en la burbuja del chat
      return aiResponse.reply || "🤖 Acción procesada.";

    } catch (error) {
      console.error("Error en el núcleo del agente:", error);
      return "⚠️ *Agente IA:* Error de respuesta en mi módulo de lenguaje. Comprueba la validez de tu API Key.";
    }
  }
};
