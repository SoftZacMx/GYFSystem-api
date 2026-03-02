export interface NotificationEmailData {
  recipientName: string;
  message: string;
  type: string;
  createdAt: Date;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function typeBadgeColor(type: string): string {
  switch (type) {
    case 'warning': return '#e67e22';
    case 'document': return '#3498db';
    case 'event': return '#9b59b6';
    default: return '#2ecc71';
  }
}

export function notificationEmailSubject(data: NotificationEmailData): string {
  const prefix: Record<string, string> = {
    info: 'Información',
    warning: 'Aviso importante',
    document: 'Documento',
    event: 'Evento',
  };
  return `${prefix[data.type] ?? 'Notificación'} — Files Manager`;
}

export function notificationEmailHtml(data: NotificationEmailData): string {
  const color = typeBadgeColor(data.type);
  const date = data.createdAt.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#1a73e8;padding:20px 24px;">
              <h1 style="margin:0;color:#fff;font-size:20px;">Files Manager</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 8px;color:#333;">Hola <strong>${escapeHtml(data.recipientName)}</strong>,</p>
              <p style="margin:0 0 16px;color:#555;">Tienes una nueva notificación:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-left:4px solid ${color};border-radius:4px;padding:16px;margin-bottom:16px;">
                <tr>
                  <td style="padding:12px 16px;">
                    <span style="display:inline-block;background:${color};color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;text-transform:uppercase;margin-bottom:8px;">${escapeHtml(data.type)}</span>
                    <p style="margin:8px 0 0;color:#333;font-size:15px;">${escapeHtml(data.message)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#999;font-size:12px;">${date}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f7;padding:16px 24px;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:11px;">Este correo fue enviado automáticamente por Files Manager.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function notificationEmailText(data: NotificationEmailData): string {
  return `Hola ${data.recipientName},\n\nTienes una nueva notificación [${data.type}]:\n\n${data.message}\n\n— Files Manager`;
}
