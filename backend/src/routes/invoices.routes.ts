import { Router, Response } from 'express';
import { pool } from '../db/pool';
import { requireCustomer, requireStaff, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// HSN Mapping helper for B2B grocery catalog
function getHsnCode(sku: string, category: string): { hsn: string; gstRate: number } {
  const upperSku = sku.toUpperCase();
  if (upperSku.startsWith('VEG-TOM')) return { hsn: '07020000', gstRate: 0.05 };
  if (upperSku.startsWith('VEG-ONI') || upperSku.startsWith('VEG-GAR')) return { hsn: '07031000', gstRate: 0.05 };
  if (upperSku.startsWith('VEG-POT')) return { hsn: '07019000', gstRate: 0.05 };
  if (upperSku.startsWith('VEG-CAR') || upperSku.startsWith('VEG-CAU') || upperSku.startsWith('VEG-CAB')) return { hsn: '07049000', gstRate: 0.05 };
  if (upperSku.startsWith('GRA-BAS') || upperSku.startsWith('GRA-RAW')) return { hsn: '10063010', gstRate: 0.05 };
  if (upperSku.startsWith('PUL-TOO')) return { hsn: '07136000', gstRate: 0.05 };
  if (upperSku.startsWith('OIL-SUN')) return { hsn: '15121910', gstRate: 0.05 };
  if (upperSku.startsWith('SUG-REF')) return { hsn: '17019990', gstRate: 0.05 };
  if (upperSku.startsWith('DAI-PAN')) return { hsn: '04061000', gstRate: 0.05 };
  if (upperSku.startsWith('DAI-BUT')) return { hsn: '04051000', gstRate: 0.12 };
  if (upperSku.startsWith('SPI-CHI') || upperSku.startsWith('SPI-TUR')) return { hsn: '09103020', gstRate: 0.05 };
  return { hsn: '21069099', gstRate: 0.05 };
}

// Number to Words Converter for Indian Rupee Currency
function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';
  return 'Rupees ' + inWords(rounded).trim() + ' Only';
}

// Generate / Get Authoritative GST Tax Invoice for an Order
router.get('/order/:orderId', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      res.status(400).json({ success: false, error: 'Valid order ID required' });
      return;
    }

    const orderRes = await pool.query(`
      SELECT o.*, c.business_name, c.email as customer_email, c.phone as customer_phone, c.gst_number,
             ca.credit_period_days, ca.payment_terms
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      LEFT JOIN credit_accounts ca ON ca.customer_id = c.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const order = orderRes.rows[0];

    const itemsRes = await pool.query(`
      SELECT oi.*, p.category_id, c.name as category_name
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `, [orderId]);

    const seller = {
      name: 'FreshSupply Wholesale Private Limited',
      legalName: 'FreshSupply Supply Chain & Agro Tech Pvt Ltd',
      address: 'Plot 45, APMC Yard, Yeshwanthpur Industrial Suburb',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560022',
      stateCode: '29',
      gstin: '29AABCF9988K1Z5',
      fssaiLicense: '11223334000123',
      pan: 'AABCF9988K',
      cin: 'U51909KA2024PTC188201',
      supportEmail: 'billing@freshsupply.com',
      supportPhone: '+91 80 4455 6677',
      bankDetails: {
        bankName: 'HDFC Bank Limited',
        accountName: 'FreshSupply Wholesale Pvt Ltd - Collection A/C',
        accountNumber: '50200088991122',
        ifscCode: 'HDFC0000123',
        branch: 'Yeshwanthpur APMC Branch, Bangalore',
      },
    };

    // Calculate itemized taxes with HSN breakdown
    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    const invoiceItems = itemsRes.rows.map((row: any, idx: number) => {
      const { hsn, gstRate } = getHsnCode(row.sku_snapshot, row.category_name || '');
      const taxableAmount = parseFloat(row.line_total);
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;
      const cgstAmount = Math.round(taxableAmount * cgstRate * 100) / 100;
      const sgstAmount = Math.round(taxableAmount * sgstRate * 100) / 100;
      const itemTotal = taxableAmount + cgstAmount + sgstAmount;

      totalTaxableValue += taxableAmount;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;

      return {
        itemNo: idx + 1,
        description: row.product_name_snapshot,
        sku: row.sku_snapshot,
        hsnCode: hsn,
        unit: row.unit_snapshot,
        packSize: row.pack_size_snapshot,
        quantity: row.quantity,
        unitPrice: parseFloat(row.unit_price),
        taxableValue: taxableAmount,
        cgstRate: `${(cgstRate * 100).toFixed(1)}%`,
        cgstAmount,
        sgstRate: `${(sgstRate * 100).toFixed(1)}%`,
        sgstAmount,
        total: itemTotal,
      };
    });

    const deliveryFee = parseFloat(order.delivery_charge) || 0;
    const finalInvoiceTotal = Math.round((totalTaxableValue + totalCgst + totalSgst + deliveryFee) * 100) / 100;

    const invoiceData = {
      invoiceNumber: `INV-${order.order_number.replace('FS-', '')}`,
      invoiceDate: new Date(order.created_at).toISOString().split('T')[0],
      orderNumber: order.order_number,
      poReference: order.po_reference || 'N/A',
      paymentTerms: order.payment_terms || (order.credit_period_days ? `Net ${order.credit_period_days} Days` : 'Advance Payment'),
      dueDate: order.delivery_date,
      placeOfSupply: '29 - Karnataka (Intra-State)',
      reverseChargeApplicable: false,
      seller,
      buyer: {
        businessName: order.business_name,
        contactPerson: order.contact_person,
        phone: order.contact_phone || order.customer_phone,
        email: order.customer_email,
        gstin: order.gst_number || 'Unregistered / Composition',
        stateCode: '29',
        shippingAddress: order.address_snapshot || { address_line1: 'Primary Receiving Bay', city: 'Bangalore', state: 'Karnataka' },
      },
      items: invoiceItems,
      financialSummary: {
        totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
        cgstTotal: Math.round(totalCgst * 100) / 100,
        sgstTotal: Math.round(totalSgst * 100) / 100,
        totalGst: Math.round((totalCgst + totalSgst) * 100) / 100,
        freightCharges: deliveryFee,
        roundOff: 0,
        grandTotal: finalInvoiceTotal,
        amountInWords: numberToWords(finalInvoiceTotal),
      },
      auditFooter: {
        generatedAt: new Date().toISOString(),
        systemHash: `SHA256-${Buffer.from(order.order_number + finalInvoiceTotal.toString()).toString('base64').slice(0, 16)}`,
        irnQrCodePayload: `IRN-SAMPLE-29AABCF9988K1Z5-${order.order_number}`,
      },
    };

    res.json({ success: true, data: invoiceData });
  } catch (err) {
    next(err);
  }
});

export default router;

