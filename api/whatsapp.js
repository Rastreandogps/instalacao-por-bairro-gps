// /api/whatsapp.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { WHATSAPP_TOKEN, PHONE_NUMBER_ID, TEAM_RECEIVER_MSISDN, TEMPLATE_NAME, TEMPLATE_LANG } = process.env;

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID || !TEAM_RECEIVER_MSISDN) {
    return res.status(500).json({ error: 'Variáveis de ambiente faltando (WHATSAPP_TOKEN, PHONE_NUMBER_ID, TEAM_RECEIVER_MSISDN).' });
  }

  try {
    const { nome, whats, email, mensagem } = req.body || {};
    if (!nome || !whats) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes (nome, whats).' });
    }

    // Monta um texto consolidado dos dados do lead
    const resumo = [
      `Novo lead pelo site Rastreando GPS`,
      `• Nome: ${nome}`,
      `• WhatsApp informado: ${whats}`,
      `• E-mail: ${email || '(não informado)'}`,
      `• Mensagem: ${mensagem || '(vazio)'}`
    ].join('\n');

    // 1) Envia para o NÚMERO INTERNO da equipe (você recebe imediatamente)
    // Usando TEMPLATE (recomendado em produção)
    const templateName = TEMPLATE_NAME || 'novo_lead_site'; // crie e aprove um template com 1 variável {{1}}
    const templateLang = TEMPLATE_LANG || 'pt_BR';

    const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

    // Tenta com TEMPLATE
    let payload = {
      messaging_product: 'whatsapp',
      to: TEAM_RECEIVER_MSISDN.replace(/\D/g, ''), // ex: 5521969312625
      type: 'template',
      template: {
        name: templateName,
        language: { code: templateLang },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: resumo }]
          }
        ]
      }
    };

    let waRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Caso o template não esteja aprovado ainda, tenta fallback com texto (pode falhar se não houver janela ativa)
    if (!waRes.ok) {
      const errText = await waRes.text();
      // console.warn('Template falhou, tentando texto. Erro:', errText);

      payload = {
        messaging_product: 'whatsapp',
        to: TEAM_RECEIVER_MSISDN.replace(/\D/g, ''),
        type: 'text',
        text: { body: resumo }
      };

      waRes = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!waRes.ok) {
        const errText2 = await waRes.text();
        return res.status(500).json({ error: 'Falha ao enviar via WhatsApp API', details: errText, fallback: errText2 });
      }
    }

    // 2) (Opcional) responder também para o CLIENTE confirmando recebimento
    // Descomente se quiser enviar confirmação ao número do cliente (necessita template aprovado para business-initiated):
    /*
    const confirmPayload = {
      messaging_product: 'whatsapp',
      to: String(whats).replace(/\D/g, ''),
      type: 'template',
      template: {
        name: 'confirmacao_recebida',  // crie/aponte um template seu
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: nome }]
          }
        ]
      }
    };
    const confirmRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(confirmPayload)
    });
    // Apenas loga eventual erro de confirmação; não bloqueia a resposta principal
    */

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', details: String(err) });
  }
}
