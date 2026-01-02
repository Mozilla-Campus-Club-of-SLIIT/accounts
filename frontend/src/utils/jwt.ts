type JwtPayloadTypes = string | number | boolean | object | JwtPayloadTypes[];

export type JwtBody = {
  header: {
    alg: string;
    type: string;
  };
  payload: Record<string, JwtPayloadTypes> & {
    exp: number;
    iat: number;
  };
};

export const decode = (jwt: string): JwtBody | null => {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    return { header, payload };
  } catch (e: unknown) {
    return null;
  }
};

export default {
  decode,
};
