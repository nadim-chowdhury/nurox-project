export const INVOICE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; color: #333; line-height: 1.5; }
        .invoice-container { padding: 20px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #00b96b; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #00b96b; }
        .invoice-title { font-size: 32px; font-weight: bold; text-align: right; }
        .details { margin-top: 30px; display: flex; justify-content: space-between; }
        .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        .table th { background: #f8f8f8; padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .table td { padding: 10px; border-bottom: 1px solid #eee; }
        .totals { margin-top: 30px; text-align: right; }
        .totals-row { margin-bottom: 5px; }
        .grand-total { font-size: 20px; font-weight: bold; color: #00b96b; border-top: 2px solid #eee; padding-top: 10px; }
        .footer { margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="logo">NUROX ERP</div>
            <div class="invoice-title">{{title}}</div>
        </div>

        <div class="details">
            <div>
                <strong>FROM:</strong><br>
                {{tenantName}}<br>
                {{tenantAddress}}<br>
                {{tenantEmail}}
            </div>
            <div style="text-align: right;">
                <strong>TO:</strong><br>
                {{customerName}}<br>
                {{customerEmail}}<br>
                <br>
                <strong>Invoice #:</strong> {{invoiceNumber}}<br>
                <strong>Date:</strong> {{issueDate}}<br>
                <strong>Due Date:</strong> {{dueDate}}
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Qty</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                {{#each lines}}
                <tr>
                    <td>{{description}}</td>
                    <td style="text-align: right;">{{quantity}}</td>
                    <td style="text-align: right;">{{formatCurrency unitPrice}}</td>
                    <td style="text-align: right;">{{formatCurrency lineTotal}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">Subtotal: {{formatCurrency subtotal}}</div>
            <div class="totals-row">Tax: {{formatCurrency taxAmount}}</div>
            <div class="grand-total">Total: {{formatCurrency totalAmount}}</div>
        </div>

        <div class="footer">
            <strong>Payment Terms:</strong> {{paymentTerms}}<br>
            <strong>Bank Details:</strong> {{bankDetails}}<br>
            <br>
            <em>Thank you for your business!</em>
        </div>
    </div>
</body>
</html>
`;
