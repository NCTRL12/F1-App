async function send() {
  const inp = document.getElementById('cin');
  const txt = inp.value.trim();
  if (!txt) return;

  // Limpiar el cuadro de texto del usuario
  inp.value = ''; 
  inp.style.height = 'auto';
  
  // Ocultar las sugerencias rápidas iniciales si existen
  const qrow = document.getElementById('qrow');
  if (qrow) qrow.style.display = 'none';

  // 1. Mostrar el mensaje del usuario en pantalla
  addMsg('u', txt); 
  
  // 2. Activar la animación de los tres puntitos del Agente
  showTyping(); 
  document.getElementById('sbtn').disabled = true;

  try {
    // 3. El Agente analiza el texto, decide si mutar la UI, actualiza la API si es necesario y genera el informe
    const agentReply = await AgentRouter.processInput(txt);
    
    // 4. Mostrar respuesta en pantalla
    hideTyping();
    addMsg('a', agentReply);
  } catch (error) {
    console.error("Error en el procesamiento del agente:", error);
    hideTyping();
    addMsg('a', "⚠️ Lo siento, jefe. Ha ocurrido un error interno en mi línea de comandos al procesar la app.");
  } finally {
    document.getElementById('sbtn').disabled = false;
  }
}
