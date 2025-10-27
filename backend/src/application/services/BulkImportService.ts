import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { LOAImportRow, BulkImportResult } from '../dtos/loa/BulkImportLoaDto';
import { Result, ResultUtils } from '../../shared/types/common.types';

export class BulkImportService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Map Excel status to database enum
   * Maps from your sheet's status format to database LOAStatus enum
   */
  private mapStatus(excelStatus?: string): 'NOT_STARTED' | 'IN_PROGRESS' | 'SUPPLY_WORK_COMPLETED' | 'CHASE_PAYMENT' | 'CLOSED' {
    if (!excelStatus) return 'NOT_STARTED';

    const statusMap: Record<string, 'NOT_STARTED' | 'IN_PROGRESS' | 'SUPPLY_WORK_COMPLETED' | 'CHASE_PAYMENT' | 'CLOSED'> = {
      // Excel Status → Database Status (exact match)
      '1. Not Started': 'NOT_STARTED',
      '2. In Progress': 'IN_PROGRESS',
      '4. Supply/Work Completed': 'SUPPLY_WORK_COMPLETED',
      '7. Chase Payment': 'CHASE_PAYMENT',
      '9. Closed': 'CLOSED',
    };

    return statusMap[excelStatus] || 'NOT_STARTED';
  }

  /**
   * Parse Excel date to JavaScript Date
   */
  private parseExcelDate(value: any): Date | undefined {
    if (!value) return undefined;

    // If it's already a Date object
    if (value instanceof Date) {
      // Check for unrealistic years and auto-correct
      const year = value.getFullYear();
      if (year > 3000) {
        // Likely a typo like 20025 instead of 2025
        const correctedYear = parseInt(year.toString().substring(0, 4));
        value.setFullYear(correctedYear);
      }
      return value;
    }

    // If it's an Excel serial number
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      return new Date(date.y, date.m - 1, date.d);
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Check for year typos in string format (e.g., "17 July 20025")
      let cleanedValue = value;
      const yearMatch = value.match(/\b(20\d{3,})\b/); // Match years starting with "20" and having extra digits
      if (yearMatch) {
        const typoYear = yearMatch[1];
        // If year starts with "20" and has extra digits, it's likely "20025" → "2025"
        const correctedYear = '20' + typoYear.substring(2, 4); // Take "20" + next 2 digits
        cleanedValue = value.replace(typoYear, correctedYear);
      }

      const parsed = new Date(cleanedValue);
      if (!isNaN(parsed.getTime())) {
        // Additional check for unrealistic years
        const year = parsed.getFullYear();
        if (year > 3000) {
          const correctedYear = parseInt(year.toString().substring(0, 4));
          parsed.setFullYear(correctedYear);
        }
        return parsed;
      }
      return undefined;
    }

    return undefined;
  }

  /**
   * Parse numeric value, handling NaN and empty values
   */
  private parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '' || value === '-') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Parse Excel file and extract LOA rows
   */
  private async parseExcelFile(filePath: string): Promise<LOAImportRow[]> {
    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    // Map to LOAImportRow
    const rows: LOAImportRow[] = jsonData.map((row) => ({
      loaNumber: row['PO/LOA Number']?.toString().trim() || '',
      site: row['Site']?.toString().trim() || '',
      orderValue: this.parseNumber(row['Order Value']) || 0,
      workDescription: row['Description of Work']?.toString().trim() || '',
      orderReceivedDate: this.parseExcelDate(row['Order Received Date']),
      deliveryDate: this.parseExcelDate(row['Delivery Date']),
      orderDueDate: this.parseExcelDate(row['Order Due date']),
      orderStatus: row['Order Status']?.toString().trim(),
      emd: this.parseNumber(row['EMD']),
      securityDeposit: this.parseNumber(row['Security Deposit']),
      // Billing fields
      lastInvoiceNo: row['Last Invoice No.']?.toString().trim(),
      lastInvoiceAmount: this.parseNumber(row['Last Invoice Amount']),
      totalReceivables: this.parseNumber(row['Total Receivables '] || row['Total Receivables']),
      actualAmountReceived: this.parseNumber(row['Actual Amount Received']),
      amountDeducted: this.parseNumber(row['Amount Deducted']),
      amountPending: this.parseNumber(row['Amount Pending']),
      reasonForDeduction: row['Reason for deduction']?.toString().trim(),
      billLinks: row['Bill Links']?.toString().trim(),
      remarks: row['Remarks2']?.toString().trim(),
    }));

    return rows;
  }

  /**
   * Extract customer name from file name
   * Example: "GreenCell Sheet.xlsx" -> "GreenCell"
   */
  private extractCustomerNameFromFile(fileName: string): string {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.(xlsx|xls|csv)$/i, '');

    // Remove common suffixes like "Sheet", "Data", etc.
    const cleanedName = nameWithoutExt
      .replace(/\s+(sheet|data|export|import|list)$/i, '')
      .trim();

    return cleanedName;
  }

  /**
   * Normalize string for comparison (lowercase, remove extra spaces)
   */
  private normalizeString(str: string): string {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Find or create customer with case-insensitive matching
   */
  private async findOrCreateCustomer(customerName: string): Promise<string> {
    const normalizedName = this.normalizeString(customerName);

    // Try to find existing customer with case-insensitive match
    const existingCustomers = await this.prisma.customer.findMany();
    const matchingCustomer = existingCustomers.find(
      c => this.normalizeString(c.name) === normalizedName
    );

    if (matchingCustomer) {
      console.log(`Found existing customer: ${matchingCustomer.name} (ID: ${matchingCustomer.id})`);
      return matchingCustomer.id;
    }

    // Create new customer if not found
    // Generate ID from name (uppercase, no spaces)
    const customerId = customerName
      .toUpperCase()
      .replace(/\s+/g, '')
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 20); // Limit length

    const newCustomer = await this.prisma.customer.create({
      data: {
        id: customerId,
        name: customerName,
        headquarters: 'India' // Default placeholder
      }
    });

    console.log(`Created new customer: ${newCustomer.name} (ID: ${newCustomer.id})`);
    return newCustomer.id;
  }

  /**
   * Find or create site with duplicate prevention
   */
  private async findOrCreateSite(siteName: string, customerId: string): Promise<string> {
    const normalizedName = this.normalizeString(siteName);

    // Try to find existing site with case-insensitive match
    const existingSites = await this.prisma.site.findMany();
    const matchingSite = existingSites.find(
      s => this.normalizeString(s.name) === normalizedName
    );

    if (matchingSite) {
      return matchingSite.id;
    }

    // Create new site if not found
    // Generate site code
    const existingSitesForCustomer = await this.prisma.site.findMany({
      where: { zoneId: customerId },
      orderBy: { code: 'desc' },
      take: 1
    });

    let siteNumber = 1;
    if (existingSitesForCustomer.length > 0) {
      const latestCode = existingSitesForCustomer[0].code;
      const match = latestCode.match(/(\d+)$/);
      if (match) {
        siteNumber = parseInt(match[1]) + 1;
      }
    }

    const siteCode = `${customerId.substring(0, 5)}/SITE/${siteNumber.toString().padStart(3, '0')}`;

    const newSite = await this.prisma.site.create({
      data: {
        name: siteName,
        code: siteCode,
        zoneId: customerId,
        location: siteName, // Use site name as location
        address: `${siteName}, India`, // Default address
        status: 'ACTIVE'
      }
    });

    console.log(`Created new site: ${newSite.name} (ID: ${newSite.id}, Code: ${newSite.code})`);
    return newSite.id;
  }

  /**
   * Validate a single row
   */
  private validateRow(row: LOAImportRow, rowIndex: number): string | null {
    // Required fields validation
    if (!row.loaNumber) {
      return `Row ${rowIndex}: LOA Number is required`;
    }

    if (!row.site) {
      return `Row ${rowIndex}: Site is required`;
    }

    if (!row.orderValue || row.orderValue <= 0) {
      return `Row ${rowIndex}: Order Value must be a positive number`;
    }

    if (!row.workDescription || row.workDescription.length < 3) {
      return `Row ${rowIndex}: Work Description must be at least 3 characters`;
    }

    // Date validation
    if (row.orderReceivedDate && row.deliveryDate) {
      if (row.orderReceivedDate > row.deliveryDate) {
        return `Row ${rowIndex}: Order Received Date cannot be after Delivery Date`;
      }
    }

    return null;
  }

  /**
   * Bulk import LOAs from Excel file
   */
  async bulkImport(file: Express.Multer.File): Promise<Result<BulkImportResult>> {
    try {
      // Step 1: Parse Excel file
      const rows = await this.parseExcelFile(file.path);

      if (rows.length === 0) {
        return ResultUtils.fail('No data found in Excel file');
      }

      // Step 2: Extract customer name from file name and find/create customer
      const customerName = this.extractCustomerNameFromFile(file.originalname);
      console.log(`Extracted customer name from file: ${customerName}`);

      const customerId = await this.findOrCreateCustomer(customerName);

      // Step 3: Collect all unique site names from rows
      const uniqueSiteNames = new Set<string>();
      rows.forEach(row => {
        if (row.site && row.site.trim()) {
          uniqueSiteNames.add(row.site.trim());
        }
      });

      console.log(`Found ${uniqueSiteNames.size} unique site names in Excel`);

      // Step 4: Find or create all sites
      const siteMap = new Map<string, string>();
      for (const siteName of uniqueSiteNames) {
        const siteId = await this.findOrCreateSite(siteName, customerId);
        siteMap.set(siteName.toLowerCase().trim(), siteId);
      }

      // Step 5: Process each row
      const result: BulkImportResult = {
        totalRows: rows.length,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        errors: [],
        createdLoas: []
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // Excel row number (accounting for header)

        try {
          // Validate row
          const validationError = this.validateRow(row, rowNumber);
          if (validationError) {
            result.errors.push({
              row: rowNumber,
              loaNumber: row.loaNumber || 'N/A',
              error: validationError
            });
            result.failureCount++;
            continue;
          }

          // Check if LOA already exists
          const existingLoa = await this.prisma.lOA.findUnique({
            where: { loaNumber: row.loaNumber }
          });

          if (existingLoa) {
            result.errors.push({
              row: rowNumber,
              loaNumber: row.loaNumber,
              error: 'LOA number already exists'
            });
            result.skippedCount++;
            continue;
          }

          // Map site name to site ID (sites are now guaranteed to exist)
          const siteId = siteMap.get(row.site.toLowerCase().trim());
          if (!siteId) {
            // This should not happen as we created all sites above, but handle it just in case
            console.error(`Unexpected: Site '${row.site}' not found in siteMap`);
            result.errors.push({
              row: rowNumber,
              loaNumber: row.loaNumber,
              error: `Site '${row.site}' could not be mapped`
            });
            result.failureCount++;
            continue;
          }

          // Determine delivery period
          // Start date = Order Received Date
          // End date = Order Due Date (same as Delivery Date in the sheet)
          const deliveryPeriodStart = row.orderReceivedDate || new Date();
          const deliveryPeriodEnd = row.orderDueDate || row.deliveryDate || new Date(deliveryPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000);

          // Map status
          const status = this.mapStatus(row.orderStatus);

          // Create LOA with Invoice in a transaction
          const createdLoa = await this.prisma.$transaction(async (tx) => {
            // Create LOA
            const loa = await tx.lOA.create({
              data: {
                loaNumber: row.loaNumber,
                loaValue: row.orderValue,
                siteId: siteId,
                deliveryPeriod: {
                  start: deliveryPeriodStart.toISOString(),
                  end: deliveryPeriodEnd.toISOString()
                },
                dueDate: row.orderDueDate || null, // Add due date from Excel
                orderReceivedDate: row.orderReceivedDate || null, // Add order received date from Excel
                workDescription: row.workDescription,
                documentUrl: 'pending', // Will be updated later if document is uploaded
                status: status,
                tags: [],
                remarks2: row.remarks || null, // Map remarks from Excel to remarks2
                hasEmd: !!row.emd,
                emdAmount: row.emd,
                hasSecurityDeposit: !!row.securityDeposit,
                securityDepositAmount: row.securityDeposit,
              },
              include: {
                site: true
              }
            });

            // Create Invoice if any billing data exists
            const hasBillingData = row.lastInvoiceNo ||
                                   row.lastInvoiceAmount ||
                                   row.totalReceivables ||
                                   row.actualAmountReceived ||
                                   row.amountDeducted ||
                                   row.amountPending ||
                                   row.reasonForDeduction ||
                                   row.billLinks ||
                                   row.remarks;

            if (hasBillingData) {
              await tx.invoice.create({
                data: {
                  loaId: loa.id,
                  invoiceNumber: row.lastInvoiceNo,
                  invoiceAmount: row.lastInvoiceAmount,
                  totalReceivables: row.totalReceivables,
                  actualAmountReceived: row.actualAmountReceived,
                  amountDeducted: row.amountDeducted,
                  amountPending: row.amountPending,
                  deductionReason: row.reasonForDeduction,
                  billLinks: row.billLinks,
                  remarks: row.remarks,
                }
              });
            }

            return loa;
          });

          result.successCount++;
          result.createdLoas.push({
            loaNumber: createdLoa.loaNumber,
            loaValue: createdLoa.loaValue,
            site: createdLoa.site?.name || row.site
          });

        } catch (error) {
          console.error(`Error processing row ${rowNumber}:`, error);
          result.errors.push({
            row: rowNumber,
            loaNumber: row.loaNumber || 'N/A',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          });
          result.failureCount++;
        }
      }

      return ResultUtils.ok(result);

    } catch (error) {
      console.error('Bulk import error:', error);
      return ResultUtils.fail('Failed to process Excel file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      // Clean up uploaded file
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error('Error deleting temp file:', error);
      }
    }
  }
}
