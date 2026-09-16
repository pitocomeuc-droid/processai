import type { VercelRequest, VercelResponse } from '@vercel/node'

const RESEND_KEY = process.env.RESEND_API_KEY!
const ADMIN_EMAIL = 'pitocomeuc@gmail.com'

function adminOnboardingHtml(data: {
  ownerName: string; ownerEmail: string; companyName: string; sector: string;
  answers: { question: string; answer: string }[]
}) {
  const rows = data.answers.map(a => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A3E;color:#94A3B8;font-size:13px;vertical-align:top;width:35%">${a.question}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #2A2A3E;color:#E2E8F0;font-size:13px">${a.answer}</td>
    </tr>`).join('')

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F0F1A;border-radius:16px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#6C63FF,#4F46E5);padding:24px 32px">
    <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">🚀 Novo Cliente Cadastrado</h1>
    <p style="color:#C7D2FE;margin:4px 0 0;font-size:14px">ProcessAI — Painel Admin</p>
  </div>
  <div style="padding:24px 32px">
    <div style="background:#1E1E2E;border-radius:12px;padding:16px;margin-bottom:20px">
      <p style="color:#6C63FF;font-size:11px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Dados do Cliente</p>
      <p style="color:#fff;font-size:16px;font-weight:600;margin:0 0 4px">${data.companyName} — ${data.sector}</p>
      <p style="color:#94A3B8;font-size:13px;margin:0">${data.ownerName} · ${data.ownerEmail}</p>
    </div>
    <p style="color:#6C63FF;font-size:11px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Diagnóstico Completo</p>
    <table style="width:100%;border-collapse:collapse;background:#1E1E2E;border-radius:12px;overflow:hidden">${rows}</table>
    <div style="margin-top:20px;text-align:center">
      <a href="https://processai-br.vercel.app/admin" style="background:linear-gradient(135deg,#6C63FF,#4F46E5);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;display:inline-block">
        Ver no Painel Admin →
      </a>
    </div>
  </div>
  <div style="background:#1E1E2E;padding:12px 32px;text-align:center">
    <p style="color:#475569;font-size:11px;margin:0">ProcessAI Admin · Apenas para uso interno</p>
  </div>
</div>`
}

function adminPlanHtml(data: {
  ownerName: string; ownerEmail: string; companyName: string; sector: string;
  problem: string; planTitle: string; methodology: string;
  tasks: { titulo: string; descricao: string; prioridade: string; prazo_dias: number; impacto: string }[];
  kpis: string[];
}) {
  const taskRows = data.tasks.map((t, i) => `
    <div style="background:#1E1E2E;border-radius:10px;padding:12px 16px;margin-bottom:8px;border-left:3px solid ${t.prioridade === 'alta' ? '#EF4444' : t.prioridade === 'media' ? '#F59E0B' : '#10B981'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <p style="color:#fff;font-size:13px;font-weight:600;margin:0">${i + 1}. ${t.titulo}</p>
        <span style="color:#94A3B8;font-size:11px">${t.prazo_dias}d · ${t.prioridade}</span>
      </div>
      <p style="color:#94A3B8;font-size:12px;margin:0 0 4px">${t.descricao}</p>
      <p style="color:#10B981;font-size:11px;margin:0">→ ${t.impacto}</p>
    </div>`).join('')

  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F0F1A;border-radius:16px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#6C63FF,#4F46E5);padding:24px 32px">
    <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">🤖 IA Gerou um Plano de Ação</h1>
    <p style="color:#C7D2FE;margin:4px 0 0;font-size:14px">ProcessAI — Relatório de Diagnóstico</p>
  </div>
  <div style="padding:24px 32px">
    <div style="background:#1E1E2E;border-radius:12px;padding:16px;margin-bottom:20px">
      <p style="color:#6C63FF;font-size:11px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Cliente</p>
      <p style="color:#fff;font-size:16px;font-weight:600;margin:0 0 4px">${data.companyName} — ${data.sector}</p>
      <p style="color:#94A3B8;font-size:13px;margin:0">${data.ownerName} · ${data.ownerEmail}</p>
    </div>
    <div style="background:#1E1E2E;border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid rgba(239,68,68,0.2)">
      <p style="color:#EF4444;font-size:11px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Problema Relatado</p>
      <p style="color:#E2E8F0;font-size:14px;margin:0;line-height:1.5">${data.problem}</p>
    </div>
    <div style="margin-bottom:16px">
      <p style="color:#6C63FF;font-size:11px;font-weight:700;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Plano Gerado pela IA</p>
      <p style="color:#fff;font-size:15px;font-weight:600;margin:0 0 4px">${data.planTitle}</p>
      <p style="color:#94A3B8;font-size:12px;margin:0">Metodologia: ${data.methodology}</p>
    </div>
    ${taskRows}
    ${data.kpis.length > 0 ? `
    <div style="background:#1E1E2E;border-radius:10px;padding:12px 16px;margin-top:12px">
      <p style="color:#6C63FF;font-size:11px;font-weight:700;margin:0 0 8px;text-transform:uppercase">KPIs para medir</p>
      ${data.kpis.map(k => `<p style="color:#94A3B8;font-size:12px;margin:0 0 4px">• ${k}</p>`).join('')}
    </div>` : ''}
    <div style="margin-top:20px;text-align:center">
      <a href="https://processai-br.vercel.app/admin" style="background:linear-gradient(135deg,#6C63FF,#4F46E5);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;display:inline-block">
        Criar Solução para Este Cliente →
      </a>
    </div>
  </div>
</div>`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, name, type, adminData } = req.body
  if (!to || !type) return res.status(400).json({ error: 'Missing fields' })

  let subject = ''
  let html = ''

  if (type === 'welcome') {
    subject = 'Bem-vindo ao ProcessAI! 🚀'
    html = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0F0F1A;border-radius:16px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#6C63FF,#4F46E5);padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700">ProcessAI</h1>
    <p style="color:#C7D2FE;margin:4px 0 0;font-size:14px">Otimização inteligente de processos</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#fff;margin:0 0 12px;font-size:20px">Olá, ${name || 'bem-vindo'}! 👋</h2>
    <p style="color:#94A3B8;font-size:15px;line-height:1.6;margin:0 0 20px">
      Sua conta no ProcessAI foi criada com sucesso. Agora você tem acesso a um consultor de IA que vai ajudar a identificar gargalos e otimizar os processos da sua empresa.
    </p>
    <div style="text-align:center">
      <a href="https://processai-br.vercel.app/dashboard" style="background:linear-gradient(135deg,#6C63FF,#4F46E5);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;display:inline-block">
        Acessar meu painel
      </a>
    </div>
  </div>
</div>`
  } else if (type === 'admin-onboarding' && adminData) {
    subject = `🚀 Novo cliente: ${adminData.companyName} (${adminData.sector})`
    html = adminOnboardingHtml(adminData)
  } else if (type === 'admin-plan' && adminData) {
    subject = `🤖 Plano gerado: ${adminData.companyName} — ${adminData.planTitle}`
    html = adminPlanHtml(adminData)
  } else {
    return res.status(400).json({ error: 'Unknown template' })
  }

  // For admin types, always send to admin email
  const recipient = type.startsWith('admin-') ? ADMIN_EMAIL : to

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'ProcessAI <onboarding@resend.dev>', to: [recipient], subject, html }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.message || 'Resend error')
    res.json({ id: data.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send email' })
  }
}
