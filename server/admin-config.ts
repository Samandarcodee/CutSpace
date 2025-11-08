const DEFAULT_ADMIN_IDS = ["5928372261"];

function parseAdminIds(): string[] {
  const raw = process.env.ADMIN_TELEGRAM_IDS;
  if (!raw) {
    return DEFAULT_ADMIN_IDS;
  }

  const parsed = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  return parsed.length > 0 ? parsed : DEFAULT_ADMIN_IDS;
}

const ADMIN_ID_LIST = parseAdminIds();

export const ADMIN_TELEGRAM_IDS = new Set(ADMIN_ID_LIST);

export function getAdminIdList(): string[] {
  return ADMIN_ID_LIST;
}

export function getAdminIdBigIntList(): bigint[] {
  const result: bigint[] = [];
  for (const id of ADMIN_ID_LIST) {
    try {
      result.push(BigInt(id));
    } catch (_error) {
      console.warn(
        `[admin-config] Skipping invalid admin telegram id "${id}" – unable to convert to BigInt.`,
      );
    }
  }
  return result;
}

export function getPrimaryAdminId(): string | undefined {
  return ADMIN_ID_LIST[0];
}

export function isAdminTelegramId(value: unknown): boolean {
  if (typeof value === "string") {
    return ADMIN_TELEGRAM_IDS.has(value.trim());
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return false;
    }
    return ADMIN_TELEGRAM_IDS.has(Math.trunc(value).toString());
  }

  if (typeof value === "bigint") {
    return ADMIN_TELEGRAM_IDS.has(value.toString());
  }

  return false;
}
