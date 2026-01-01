const request = async (
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const requestOptions = { ...init };
  const token = localStorage.getItem("token");
  const headers = new Headers(requestOptions.headers);

  if (token) headers.set("Authorization", "Bearer " + token);
  headers.set("Content-Type", "application/json");

  requestOptions.headers = headers;

  const response = await fetch(url, requestOptions);
  // unauthorized requests could be a result of expired tokens
  if (response.status === 401) {
    const newTokenResponse = await fetch("/api/token/refresh", {
      method: "POST",
    });
    if (newTokenResponse.ok) {
      const newTokenResult = await newTokenResponse.json();
      localStorage.setItem("token", newTokenResult?.data?.token);
      return request(url, init);
    }
  }
  return response;
};

const get = async (
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  return request(url, {
    method: "GET",
    ...init,
  });
};

const post = async (
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  return request(url, {
    method: "POST",
    ...init,
  });
};

const patch = async (
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  return request(url, {
    method: "PATCH",
    ...init,
  });
};

const del = async (
  url: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  return request(url, {
    method: "DELETE",
    ...init,
  });
};

export default {
  request,
  get,
  post,
  patch,
  del,
};
