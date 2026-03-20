export interface N8nResponse {
  text: string;
  audioUrl?: string; // Opcional: Se o n8n já devolver um áudio pronto
}

// Isso avisa ao MainScreen que o n8n está ativo e não é para usar o Gemini local
export const isWebhookConfigured = () => true; 

export const sendToN8n = async (payload: any): Promise<N8nResponse> => {
  // A sua URL exata
  const WEBHOOK_URL = "https://webhook.naveedu.io/webhook/maplebear-tutor";

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Enviando todos os dados mastigados para o seu n8n usar
      body: JSON.stringify({
        mensagem: payload.message,
        tutor: payload.tutorKey,
        estilo: payload.styleId,
        aluno: payload.studentInfo,
        historico: payload.conversationHistory
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro no n8n (${response.status}): ${errorText || 'Sem mensagem de erro'}`);
    }

    // Lendo a resposta como texto primeiro para evitar o erro de JSON vazio
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === "") {
      console.warn("O n8n respondeu com sucesso (200), mas o corpo da resposta está vazio.");
      return {
        text: "O n8n recebeu a mensagem, mas não enviou uma resposta de texto. Verifique o nó 'Respond to Webhook' no seu fluxo.",
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Erro ao converter resposta do n8n para JSON:", responseText);
      return {
        text: "O n8n enviou uma resposta que não é um JSON válido. Verifique o formato de saída no n8n.",
      };
    }

    // ATENÇÃO AQUI: Estamos assumindo que o seu n8n devolve um JSON assim: 
    // { "resposta": "Texto do urso" }
    // Se o nome do campo for diferente no n8n, mude o 'data.resposta' abaixo!
    return {
      text: data.resposta || data.text || data.message || "Ops, o n8n não enviou o texto no formato esperado.",
      audioUrl: data.audioUrl || undefined
    };

  } catch (error) {
    console.error("Falha ao comunicar com o n8n:", error);
    throw error;
  }
};

// Função auxiliar caso o seu n8n devolva um link de áudio pronto (mp3/wav)
export const playN8nAudio = (
  url: string,
  onStart: () => void,
  onEnd: () => void,
  onError: (err: any) => void
) => {
  try {
    const audio = new Audio(url);
    audio.onplay = onStart;
    audio.onended = onEnd;
    audio.onerror = onError;
    audio.play().catch(onError);
    return { audio, abort: () => audio.pause() };
  } catch (e) {
    onError(e);
    return null;
  }
};