import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const boleto = payload.record;

    if (!boleto || !boleto.bol_data_do_vencimento) {
      return new Response(JSON.stringify({ message: "Sem data de vencimento." }), { status: 200 });
    }

    const dataVencimento = boleto.bol_data_do_vencimento;
    const nomeBeneficiario = boleto.bol_nome_do_beneficiario || "Beneficiário não identificado";
    const valor = boleto.bol_valor_do_documento || "Valor não identificado";
    const linhaDigitavel = boleto.bol_linha_digitavel || "Linha digitável não disponível";

    let dataFormatada = "";
    if (dataVencimento.includes("/")) {
      const partes = dataVencimento.split("/");
      dataFormatada = `${partes[2]}${partes[1]}${partes[0]}`;
    } else {
      dataFormatada = dataVencimento.replace(/-/g, "");
    }

    const tituloBoleto = `Pagar: ${nomeBeneficiario}`;
    
    const agora = new Date();
    const dtStamp = agora.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `${agora.getTime()}@finsaai.com.br`;

    const conteudoIcs = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Finsaai//Notificacoes//PT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `SUMMARY:${tituloBoleto}`,
      `DTSTART;VALUE=DATE:${dataFormatada}`,
      `DESCRIPTION:Lembrete de pagamento.\\nBeneficiario: ${nomeBeneficiario}\\nValor: R$ ${valor}\\nLinha Digitavel: ${linhaDigitavel}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const base64Ics = btoa(unescape(encodeURIComponent(conteudoIcs)));

    const resendPayload = {
      from: "FinSAAI <boletos@notificacoes.finsaai.com.br>",
      to: ["sfgustavo00@gmail.com"],
      subject: `🔔 Novo Boleto registrado - Vence em ${dataVencimento}`,
      html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Olá! Um novo boleto foi processado.</h2>
              <p><strong>Beneficiário:</strong> ${nomeBeneficiario}</p>
              <p><strong>Valor:</strong> R$ ${valor}</p>
              <p><strong>Linha Digitável:</strong> ${linhaDigitavel}</p>
              <p>A data de vencimento está programada para: <strong>${dataVencimento}</strong></p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p>📅 Clique no arquivo <strong>vencimento.ics</strong> em anexo para agendar este compromisso no seu calendário.</p>
          </div>
      `,
      attachments: [
        {
          filename: "vencimento.ics",
          content: base64Ics,
          content_type: "text/calendar"
        }
      ]
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(resendPayload)
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});