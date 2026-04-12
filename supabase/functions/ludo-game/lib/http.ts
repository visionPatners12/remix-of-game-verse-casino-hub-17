import { corsHeaders } from "../../_shared/cors.ts";

export class LudoHandledError extends Error {
  code: string;
  details?: Record<string, unknown>;
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function jsonOk(payload: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

export function jsonFail(code: string, message: string, details?: Record<string, unknown>) {
  return jsonOk({ ok: false, code, error: message, ...(details ?? {}) });
}

export function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("Authorization");
  if (!authorization) return null;
  return authorization.replace("Bearer ", "").trim();
}
