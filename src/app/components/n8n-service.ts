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
      throw new Error(`Erro no n8n: ${response.status}`);
    }

    const data = await response.json();

    // ATENÇÃO AQUI: Estamos assumindo que o seu n8n devolve um JSON assim: 
    // { "resposta": "Texto do urso" }
    // Se o nome do campo for diferente no n8n, mude o 'data.resposta' abaixo!
    return {
      text: data.resposta || data.text || "Ops, o n8n não enviou o texto no formato certo.",
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