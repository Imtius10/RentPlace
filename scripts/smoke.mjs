#!/usr/bin/env node
/**
 * Smoke test for the RentPlace integration.
 *
 *   node scripts/smoke.mjs                       # API at NEXT_PUBLIC_API_URL (or default prod)
 *   API_URL=http://localhost:5000 node scripts/smoke.mjs
 *   APP_URL=http://localhost:3000 node scripts/smoke.mjs   # also check the web app routes
 *
 * Exits non-zero when any check fails.
 */

const API_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL ||
  "https://rent-nest-api-seven.vercel.app").replace(/\/+$/, "");
const APP_URL = (process.env.APP_URL || "").replace(/\/+$/, "");

const CREDS = {
  admin: { email: "admin@rentnest.com", password: "admin123" },
  tenant: { email: "tanvir@tenant.com", password: "123456" },
  landlord: { email: "imtius1@example.com", password: "12345678" },
};

let failures = 0;
const pass = (name) => console.log(`  ✓ ${name}`);
const fail = (name, detail) => {
  failures += 1;
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
};

async function json(path, { token, method = "GET", body, base = API_URL } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  return { res, data };
}

async function login(role) {
  const { res, data } = await json("/api/auth/login", {
    method: "POST",
    body: CREDS[role],
  });
  if (!res.ok || !data?.data?.accessToken) {
    throw new Error(`${role} login failed (${res.status})`);
  }
  return data.data.accessToken;
}

function check(name, condition, detail) {
  if (condition) pass(name);
  else fail(name, detail);
}

async function run() {
  console.log(`API: ${API_URL}`);

  const health = await json("/api/properties?limit=1", { base: API_URL }).catch(
    (error) => ({ error })
  );
  if (health.error) {
    fail("API reachable", health.error.message);
    return;
  }
  check(
    "GET /api/properties",
    health.res.ok && Array.isArray(health.data?.data),
    `status ${health.res.status}`
  );
  check(
    "pagination meta present",
    Number.isInteger(health.data?.meta?.total),
    JSON.stringify(health.data?.meta)
  );

  const categories = await json("/api/categories");
  check(
    "GET /api/categories",
    categories.res.ok && Array.isArray(categories.data?.data) && categories.data.data.length > 0
  );

  let adminToken;
  try {
    adminToken = await login("admin");
    pass("admin login");
  } catch (error) {
    fail("admin login", error.message);
  }

  if (adminToken) {
    const stats = await json("/api/admin/statistics", { token: adminToken });
    const payload = stats.data?.data;
    check(
      "admin statistics shape",
      stats.res.ok &&
        typeof payload?.users?.total === "number" &&
        typeof payload?.properties?.total === "number" &&
        typeof payload?.rentalRequests?.pending === "number",
      JSON.stringify(payload)
    );

    const users = await json("/api/admin/users?page=1&limit=5", {
      token: adminToken,
    });
    check(
      "GET /api/admin/users",
      users.res.ok &&
        Array.isArray(users.data?.data) &&
        users.data.data.every((u) => u.activeStatus && u.role)
    );

    const rentals = await json("/api/admin/rentals?page=1&limit=5", {
      token: adminToken,
    });
    check(
      "GET /api/admin/rentals",
      rentals.res.ok && Array.isArray(rentals.data?.data),
      `status ${rentals.res.status}`
    );
    const rows = rentals.data?.data ?? [];
    check(
      "admin rentals include property + tenant refs",
      rows.length > 0 &&
        rows.every((r) => r.property?.title && r.tenant?.email),
      rows.map((r) => Object.keys(r).join(",")).join(" | ")
    );
  }

  let tenantToken;
  try {
    tenantToken = await login("tenant");
    pass("tenant login");
  } catch (error) {
    fail("tenant login", error.message);
  }

  if (tenantToken) {
    const rentals = await json("/api/rentals?page=1&limit=5", {
      token: tenantToken,
    });
    check("GET /api/rentals", rentals.res.ok && Array.isArray(rentals.data?.data));
    const payments = await json("/api/payments?page=1&limit=5", {
      token: tenantToken,
    });
    check(
      "GET /api/payments",
      payments.res.ok && Array.isArray(payments.data?.data)
    );
  }

  let landlordToken;
  try {
    landlordToken = await login("landlord");
    pass("landlord login");
  } catch (error) {
    fail("landlord login", error.message);
  }

  if (landlordToken) {
    const props = await json("/api/landlord/properties?page=1&limit=5", {
      token: landlordToken,
    });
    check(
      "GET /api/landlord/properties",
      props.res.ok && Array.isArray(props.data?.data)
    );
    const requests = await json("/api/landlord/requests?page=1&limit=5", {
      token: landlordToken,
    });
    check(
      "GET /api/landlord/requests",
      requests.res.ok &&
        Array.isArray(requests.data?.data) &&
        (requests.data?.data ?? []).every((r) => r.property && r.tenant),
      `status ${requests.res.status}`
    );
  }

  const badCreds = await json("/api/auth/login", {
    method: "POST",
    body: { email: "admin@rentnest.com", password: "wrong-password" },
  });
  check(
    "wrong password rejected with a message",
    !badCreds.res.ok && Boolean(badCreds.data?.message),
    `status ${badCreds.res.status}`
  );

  if (APP_URL) {
    console.log(`APP: ${APP_URL}`);
    const routes = [
      ["/", 200],
      ["/properties", 200],
      ["/about", 200],
      ["/auth/login", 200],
      ["/no-access", 200],
      ["/payment/success", 200],
      ["/dashboard", 307],
      ["/dashboard/admin", 307],
    ];
    for (const [route, expected] of routes) {
      const res = await fetch(`${APP_URL}${route}`, { redirect: "manual" });
      check(
        `GET ${route} → ${expected}`,
        res.status === expected,
        `got ${res.status}`
      );
    }
  }
}

await run();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll smoke checks passed");
