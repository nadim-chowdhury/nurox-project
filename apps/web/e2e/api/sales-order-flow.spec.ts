import { test, expect } from "@playwright/test";
import {
  API_BASE_URL,
  API_HEALTH_URL,
  authedHeaders,
  expectOk,
  login,
} from "../helpers/api";

/** Unwrap `{ data: T }` API responses when present. */
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

/**
 * API integration E2E: quotation → sales order → confirm → finance invoice + Mushak 6.3.
 *
 * Prerequisites:
 *   pnpm docker:up   (or API on :3001 with seeded admin@nurox.app)
 *
 * Run:
 *   pnpm test:e2e:api
 */
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

test.describe("Sales order to invoice (API E2E)", () => {
  test("full revenue flow with Mushak 6.3", async ({ request }) => {
    test.skip(
      !(await isApiReachable(request)),
      "API not reachable — start with: pnpm docker:up",
    );

    const { accessToken } = await login(request);
    const headers = authedHeaders(accessToken);
    const runId = Date.now();

    // 1. CRM account
    const accountRes = await request.post(`${API_BASE_URL}/sales/accounts`, {
      headers,
      data: {
        name: `E2E Customer ${runId}`,
        taxBin: "123456789012",
        billingAddress: "123 Test Road, Dhaka",
      },
    });
    await expectOk(accountRes, "Create account");
    const account = unwrap<{ id: string }>(await accountRes.json());

    // 2. Product
    const productRes = await request.post(
      `${API_BASE_URL}/inventory/products`,
      {
        headers,
        data: {
          sku: `E2E-SKU-${runId}`,
          name: `E2E Widget ${runId}`,
          basePrice: 1000,
          uom: "PCS",
        },
      },
    );
    await expectOk(productRes, "Create product");
    const product = unwrap<{ id: string }>(await productRes.json());

    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 3. Quotation
    const qtRes = await request.post(`${API_BASE_URL}/sales/quotations`, {
      headers,
      data: {
        accountId: account.id,
        issueDate: now.toISOString(),
        validUntil: validUntil.toISOString(),
        currency: "BDT",
        lines: [
          {
            productId: product.id,
            quantity: 2,
            unitPrice: 1000,
            discountPercent: 0,
            taxPercent: 15,
            sdPercent: 0,
          },
        ],
      },
    });
    await expectOk(qtRes, "Create quotation");
    const quotation = unwrap<{ id: string }>(await qtRes.json());

    // 4. Send quotation
    const sendRes = await request.post(
      `${API_BASE_URL}/sales/quotations/${quotation.id}/send`,
      { headers },
    );
    await expectOk(sendRes, "Send quotation");

    // 5. Convert to sales order
    const convertRes = await request.post(
      `${API_BASE_URL}/sales/quotations/${quotation.id}/convert`,
      { headers },
    );
    await expectOk(convertRes, "Convert quotation");
    const salesOrder = unwrap<{
      id: string;
      status: string;
      totalAmount: number;
    }>(await convertRes.json());
    expect(salesOrder.status).toBe("DRAFT");
    expect(Number(salesOrder.totalAmount)).toBeGreaterThan(0);

    // 6. Confirm sales order
    const confirmRes = await request.post(
      `${API_BASE_URL}/sales/sales-orders/${salesOrder.id}/confirm`,
      { headers },
    );
    await expectOk(confirmRes, "Confirm sales order");
    const confirmed = unwrap<{ status: string }>(await confirmRes.json());
    expect(confirmed.status).toBe("CONFIRMED");

    // 7. Create invoice + Mushak 6.3
    const invoiceRes = await request.post(
      `${API_BASE_URL}/sales/sales-orders/${salesOrder.id}/create-invoice`,
      {
        headers,
        data: {
          sellerName: "Nurox ERP E2E Ltd",
          sellerBin: "111111111111",
          sellerAddress: "E2E Tower, Dhaka, Bangladesh",
        },
      },
    );
    await expectOk(invoiceRes, "Create invoice from SO");
    const result = unwrap<{
      financeInvoiceId: string;
      mushak63Id: string;
      invoiceNumber: string;
      salesOrder: {
        status: string;
        financeInvoiceId: string;
        mushak63Id: string;
      };
    }>(await invoiceRes.json());

    expect(result.financeInvoiceId).toBeTruthy();
    expect(result.mushak63Id).toBeTruthy();
    expect(result.invoiceNumber).toContain("INV-");
    expect(result.salesOrder.status).toBe("INVOICED");
    expect(result.salesOrder.financeInvoiceId).toBe(result.financeInvoiceId);
    expect(result.salesOrder.mushak63Id).toBe(result.mushak63Id);

    // 8. Mushak 6.3 retrievable
    const mushakRes = await request.get(
      `${API_BASE_URL}/compliance/mushak-63/${result.mushak63Id}`,
      { headers },
    );
    await expectOk(mushakRes, "Get Mushak 6.3");
    const mushak = unwrap<{
      totalVatAmount: number;
      totalAmountInclTax: number;
    }>(await mushakRes.json());
    expect(Number(mushak.totalVatAmount)).toBeGreaterThan(0);
    expect(Number(mushak.totalAmountInclTax)).toBeGreaterThan(0);
  });
});
