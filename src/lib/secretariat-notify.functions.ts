import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SECRETARIAT_TO = "2tomilache2@gmail.com";
const FROM = "eElev <info@e-elev.online>";

const payloadSchema = z.object({
  requestId: z.string().min(1).max(64),
  tipLabel: z.string().min(1).max(200),
  elevName: z.string().min(1).max(200),
  clasa: z.string().min(1).max(50),
  scoala: z.string().min(1).max(200),
  parentName: z.string().min(1).max(200),
  parentRole: z.string().min(1).max(100),
  institutie: z.string().min(1).max(200),
  contextLabel: z.string().max(300).optional(),
  detalii: z.record(z.string().max(100), z.string().max(500)).optional(),
  documente: z.array(z.string().max(200)).max(20).optional(),
  createdAt: z.string().min(1).max(64),
});

export const notifySecretariat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.resend ?? process.env.RESEND;
    if (!apiKey) {
      throw new Error("Secretul Resend nu este configurat.");
    }

    const detaliiRows = Object.entries(data.detalii ?? {})
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;">${escapeHtml(k)}</td><td style="padding:6px 12px;color:#0f172a;font-size:13px;font-weight:500;">${escapeHtml(v)}</td></tr>`,
      )
      .join("");

    const docsList = (data.documente ?? []).length
      ? `<ul style="margin:8px 0 0;padding-left:18px;color:#0f172a;font-size:13px;">${data.documente!
          .map((d) => `<li>${escapeHtml(d)}</li>`)
          .join("")}</ul>`
      : '<p style="margin:8px 0 0;color:#64748b;font-size:13px;">Fără documente atașate.</p>';

    const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:24px 28px;background:#0f172a;color:#fff;">
      <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:.7;">Cerere nouă · eElev</p>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;">${escapeHtml(data.tipLabel)}</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:.8;">Cod cerere: <strong>${escapeHtml(data.requestId)}</strong></p>
    </td></tr>
    <tr><td style="padding:20px 28px;">
      <h2 style="margin:0 0 10px;font-size:14px;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">Elev</h2>
      <p style="margin:0;font-size:14px;color:#0f172a;"><strong>${escapeHtml(data.elevName)}</strong> · Clasa ${escapeHtml(data.clasa)}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${escapeHtml(data.scoala)}</p>
    </td></tr>
    <tr><td style="padding:0 28px 20px;">
      <h2 style="margin:0 0 10px;font-size:14px;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">Solicitant</h2>
      <p style="margin:0;font-size:14px;color:#0f172a;">${escapeHtml(data.parentName)} <span style="color:#64748b;">(${escapeHtml(data.parentRole)})</span></p>
      <p style="margin:2px 0 0;font-size:13px;color:#64748b;">Trimisă către: ${escapeHtml(data.institutie)} · ${escapeHtml(new Date(data.createdAt).toLocaleString("ro-RO"))}</p>
      ${data.contextLabel ? `<p style="margin:6px 0 0;font-size:13px;color:#475569;font-style:italic;">${escapeHtml(data.contextLabel)}</p>` : ""}
    </td></tr>
    ${
      detaliiRows
        ? `<tr><td style="padding:0 28px 20px;"><h2 style="margin:0 0 10px;font-size:14px;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">Detalii</h2><table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;">${detaliiRows}</table></td></tr>`
        : ""
    }
    <tr><td style="padding:0 28px 24px;">
      <h2 style="margin:0 0 6px;font-size:14px;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;">Documente</h2>
      ${docsList}
    </td></tr>
    <tr><td style="padding:16px 28px;background:#f1f5f9;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#64748b;">Identitate confirmată prin ROeID. Acest email este generat automat de eElev.</p>
    </td></tr>
  </table>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [SECRETARIAT_TO],
        subject: `[${data.requestId}] ${data.tipLabel} — ${data.elevName}`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend send failed", res.status, body);
      throw new Error(`Trimitere email eșuată (${res.status}): ${body.slice(0, 200)}`);
    }

    return { ok: true as const };
  });

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
