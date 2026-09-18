const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  // Corpo JSON da resposta de erro, quando o backend manda um (ex: { message }
  // do Laravel). Guardado à parte pra quem quiser mostrar um erro mais
  // detalhado sem quebrar quem só usa .message/.status como já era.
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseErrorBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (
    error instanceof ApiError &&
    error.body &&
    typeof error.body === "object" &&
    "message" in error.body &&
    typeof (error.body as { message?: unknown }).message === "string"
  ) {
    return (error.body as { message: string }).message;
  }

  return fallback;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  headers?: Record<string, string>
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL não configurada.", 0);
  }

  const url = new URL(path, API_URL);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), { headers });
  } catch {
    throw new ApiError("Não foi possível conectar à API.", 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Erro ao consultar ${path} (${response.status}).`,
      response.status,
      await parseErrorBody(response)
    );
  }

  return response.json() as Promise<T>;
}

export async function apiDelete<T>(
  path: string,
  headers?: Record<string, string>
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL não configurada.", 0);
  }

  const url = new URL(path, API_URL);

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...headers,
      },
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API.", 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Erro ao consultar ${path} (${response.status}).`,
      response.status,
      await parseErrorBody(response)
    );
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL não configurada.", 0);
  }

  const url = new URL(path, API_URL);

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API.", 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Erro ao consultar ${path} (${response.status}).`,
      response.status,
      await parseErrorBody(response)
    );
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL não configurada.", 0);
  }

  const url = new URL(path, API_URL);

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API.", 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Erro ao consultar ${path} (${response.status}).`,
      response.status,
      await parseErrorBody(response)
    );
  }

  return response.json() as Promise<T>;
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("NEXT_PUBLIC_API_URL não configurada.", 0);
  }

  const url = new URL(path, API_URL);

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API.", 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Erro ao consultar ${path} (${response.status}).`,
      response.status,
      await parseErrorBody(response)
    );
  }

  return response.json() as Promise<T>;
}
