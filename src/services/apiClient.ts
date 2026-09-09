const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>
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
    response = await fetch(url.toString());
  } catch {
    throw new ApiError("Não foi possível conectar à API.", 0);
  }

  if (!response.ok) {
    throw new ApiError(`Erro ao consultar ${path} (${response.status}).`, response.status);
  }

  return response.json() as Promise<T>;
}
