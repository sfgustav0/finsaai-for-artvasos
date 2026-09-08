// Essa variável fica na memória RAM do navegador do usuário
// Ela é um dicionário que anota: Nome do Arquivo -> { URL e Hora que Expira }
const cacheDeUrls = new Map<string, { url: string; expiraEm: number }>();

export async function obterUrlDoDocumento(nomeDoArquivo: string): Promise<string> {
  const agora = Date.now();

  // 1. VERIFICA O CACHE: O link já existe e ainda tem mais de 5 minutos de validade?
  const linkSalvo = cacheDeUrls.get(nomeDoArquivo);
  
  if (linkSalvo && linkSalvo.expiraEm > agora + 5 * 60 * 1000) {
    console.log("Usando link do Cache!"); // Só para você ver funcionando no F12
    return linkSalvo.url;
  }

  // 2. SE NÃO TEM OU EXPIROU: Faz a requisição pro backend
  console.log("Pedindo novo link pro servidor...");
  const resposta = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gerar-url-documento/${nomeDoArquivo}`);
  
  if (!resposta.ok) {
    throw new Error("Falha ao obter acesso ao documento");
  }

  const dados = await resposta.json();
  const urlAssinada = dados.url;

  // 3. SALVA NO CACHE: Guarda a nova URL avisando que ela morre em 1 hora
  cacheDeUrls.set(nomeDoArquivo, {
    url: urlAssinada,
    expiraEm: agora + 60 * 60 * 1000, // + 1 hora em milissegundos
  });

  return urlAssinada;
}