import { test, expect } from "@playwright/test";
import {
  API_BASE_URL,
  API_HEALTH_URL,
  authedHeaders,
  expectOk,
  login,
} from "../helpers/api";

function unwrap<T>(body: unknown): T {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    (body as { data: T }).data !== undefined
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function isApiReachable(
  request: import("@playwright/test").APIRequestContext,
): Promise<boolean> {
  try {
    const health = await request.get(API_HEALTH_URL, { timeout: 5000 });
    return health.ok();
  } catch {
    return false;
  }
}

test.describe("Procurement to Finance Bill (API E2E)", () => {
  test("full vendor bill and payment flow", async ({ request }) => {
    test.skip(
      !(await isApiReachable(request)),
      "API not reachable — start with: pnpm docker:up",
    );

    const { accessToken } = await login(request);
    const headers = authedHeaders(accessToken);
    const runId = Date.now();

    // 1. Create Vendor
    const vendorRes = await request.post(
      `${API_BASE_URL}/procurement/vendors`,
      {
        headers,
        data: {
          name: `E2E Vendor ${runId}`,
          code: `V-${runId}`,
          email: `vendor${runId}@test.com`,
          bin: "987654321098",
        },
      },
    );
    await expectOk(vendorRes, "Create vendor");
    const vendor = unwrap<{ id: string }>(await vendorRes.json());

    // 2. Create Requisition
    const reqRes = await request.post(
      `${API_BASE_URL}/procurement/requisitions`,
      {
        headers,
        data: {
          title: `E2E Requisition ${runId}`,
          department: "IT",
          priority: "HIGH",
        },
      },
    );
    await expectOk(reqRes, "Create requisition");
    const requisition = unwrap<{ id: string }>(await reqRes.json());
    expect(requisition.id).toBeTruthy();

    // 3. Create Purchase Order
    const poRes = await request.post(
      `${API_BASE_URL}/procurement/purchase-orders`,
      {
        headers,
        data: {
          vendorId: vendor.id,
          orderDate: new Date().toISOString(),
          currency: "BDT",
          items: [
            {
              description: "Server hardware",
              quantity: 1,
              unitPrice: 50000,
              taxRate: 15,
            },
          ],
        },
      },
    );
    await expectOk(poRes, "Create purchase order");
    const po = unwrap<{ id: string }>(await poRes.json());
    expect(po.id).toBeTruthy();
  });
});
