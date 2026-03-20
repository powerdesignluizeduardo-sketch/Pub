import { NextResponse } from 'next/server';

// Memória temporária para guardar as respostas
// Nota: Em Serverless (Vercel), isso funciona para testes rápidos.
const responses = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, text, audioUrl } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId é obrigatório' }, { status: 400 });
    }

    // Salva a resposta associada ao ID da conversa
    responses.set(conversationId, {
      text,
      audioUrl,
      timestamp: Date.now()
    });

    console.log(`Resposta recebida para ID: ${conversationId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar JSON' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId é obrigatório' }, { status: 400 });
  }

  const response = responses.get(conversationId);

  if (response) {
    // Opcional: remover da memória após entregar para economizar espaço
    // responses.delete(conversationId); 
    return NextResponse.json(response);
  }

  // Se não encontrou, retorna 404 para o app continuar tentando (polling)
  return NextResponse.json({ status: 'pending' }, { status: 404 });
}
