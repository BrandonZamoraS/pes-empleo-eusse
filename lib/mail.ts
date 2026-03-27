type MailgunEnv = {
  MAILGUN_API_KEY?: string | undefined;
  MAILGUN_DOMAIN?: string | undefined;
  MAILGUN_FROM?: string | undefined;
  MAILGUN_REGION?: string | undefined;
  MAILGUN_API_BASE_URL?: string | undefined;
  [key: string]: string | undefined;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface MailgunErrorContext {
  status: number;
  apiBaseUrl: string;
  domain: string;
  from: string;
  body: string;
}

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function getMailgunDomainError(domain: string): string | undefined {
  if (!domain) {
    return "MAILGUN_DOMAIN no esta configurado";
  }

  if (domain === "smtp.mailgun.org" || domain === "api.mailgun.net" || domain === "api.eu.mailgun.net") {
    return "MAILGUN_DOMAIN debe ser tu dominio de envio de Mailgun, no un host SMTP/API";
  }

  return undefined;
}

export function resolveMailgunConfig(env: MailgunEnv = process.env) {
  const apiKey = env.MAILGUN_API_KEY ?? "";
  const domain = env.MAILGUN_DOMAIN ?? "";
  const from = env.MAILGUN_FROM ?? `Portal Empleo Eusse <no-reply@${domain}>`;
  const apiBaseUrl = normalizeApiBaseUrl(
    env.MAILGUN_API_BASE_URL
      ?? (env.MAILGUN_REGION?.toLowerCase() === "eu" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net"),
  );
  const domainError = getMailgunDomainError(domain);
  const configured = Boolean(apiKey && domain) && !domainError;

  return {
    configured,
    apiKey,
    domain,
    from,
    error: !apiKey ? "MAILGUN_API_KEY no esta configurado" : domainError,
    apiBaseUrl,
    apiUrl: `${apiBaseUrl}/v3/${domain}/messages`,
  };
}

export function buildMailgunErrorDetails({ status, apiBaseUrl, domain, from, body }: MailgunErrorContext) {
  let hint: string | undefined;

  if (status === 401) {
    hint = "Mailgun devolvio 401 Unauthorized. Revisa MAILGUN_API_KEY.";
  } else if (status === 403) {
    hint =
      `Mailgun devolvio 403 Forbidden. Revisa que la API key pertenezca a la cuenta de Mailgun correcta, ` +
      `que el dominio ${domain} exista y este verificado en Mailgun, y que el remitente ${from} sea valido para ese dominio.`;
  } else if (status === 404) {
    hint = `Mailgun devolvio 404. Revisa MAILGUN_DOMAIN (${domain}) y la base API (${apiBaseUrl}).`;
  }

  return {
    status,
    apiBaseUrl,
    domain,
    from,
    body,
    hint,
  };
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const config = resolveMailgunConfig();

  if (!config.configured) {
    console.error('Mailgun not configured:', config.error ?? 'MAILGUN_API_KEY or MAILGUN_DOMAIN missing');
    return { success: false, error: config.error ?? 'Servicio de correo no configurado' };
  }

  const form = new URLSearchParams();
  form.append('from', config.from);
  form.append('to', to);
  form.append('subject', subject);
  form.append('html', html);

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString('base64')}`,
      },
      body: form,
    });

    if (!response.ok) {
      const text = await response.text();
      const details = buildMailgunErrorDetails({
        status: response.status,
        apiBaseUrl: config.apiBaseUrl,
        domain: config.domain,
        from: config.from,
        body: text,
      });
      console.error('Mailgun error:', details);
      return { success: false, error: details.hint ?? 'Error al enviar el correo' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Error al conectar con el servicio de correo' };
  }
}
