# FDR Migration Instructions

## Database Migration Required

You need to create a migration to rename the EMD table to FDR and add new fields.

### Steps:

1. **Generate the migration**:
```bash
cd backend
npx prisma migrate dev --name rename_emd_to_fdr
```

This will:
- Rename `EMD` table to `fdrs`
- Add new columns (category, accountNo, fdrNumber, accountName, maturityValue, contractNo, contractDetails, poc, location, emdAmount, sdAmount)
- Update status enum values (ACTIVE→RUNNING, EXPIRED→COMPLETED, RELEASED→RETURNED)
- Preserve existing data
- Update foreign key references in BudgetaryOffer, LOA, and Tender tables

2. **Apply the migration**:
```bash
npx prisma migrate deploy
```

3. **Generate Prisma Client**:
```bash
npx prisma generate
```

## Remaining Frontend Components to Create

You still need to create these files in `frontend/src/features/fdrs/components/`:

### 1. FDRList.tsx
Based on EMDList.tsx but with these changes:
- Add columns: Category, FDR Number, Account Name, POC, Location
- Update status options: RUNNING, COMPLETED, CANCELLED, RETURNED
- Change all EMD references to FDR
- Update API calls to /fdrs
- Add "Bulk Import" button

### 2. FDRForm.tsx
Based on EMDForm.tsx but add these new fields:
- category (FD/BG dropdown)
- accountNo (text input)
- fdrNumber (text input)
- accountName (text input)
- maturityValue (number input)
- contractNo (text input)
- contractDetails (textarea)
- poc (text input)
- location (text input)
- emdAmount (number input)
- sdAmount (number input)
- status (dropdown: RUNNING/COMPLETED/CANCELLED/RETURNED)

### 3. FDRDetail.tsx
Based on EMDDetail.tsx but display all new fields

### 4. FDRSidebar.tsx
Based on EMDSidebar.tsx with FDR terminology

### 5. BulkImportFDR.tsx (NEW)
Create a new component for Excel upload with:
- File upload input (accepts .xlsx, .xls)
- Upload button
- Progress indicator
- Results display showing:
  - Total rows processed
  - Success count
  - Failure count
  - Error details table

Example structure:
```tsx
export function BulkImportFDR() {
  const { bulkImportFDRs } = useFDRs();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportFDRResult | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const importResult = await bulkImportFDRs(file);
    setResult(importResult);
  };

  // ... render file input, button, and results
}
```

### 6. ExpiryNotification.tsx
Update to use FDR instead of EMD

## Update App.tsx Routing

In `frontend/src/App.tsx`, replace the EMD route with FDR:

```tsx
import { FDRsPage } from './features/fdrs/pages/FDRsPage';

// In your routes:
<Route path="/fdrs/*" element={<FDRsPage />} />
```

Remove the old /emds route.

## Testing Checklist

After completing all files:

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Test FDR CRUD operations
4. Test bulk import with sample Excel file
5. Test FDR detail view with all new fields
6. Test filtering and status updates
7. Test document upload and AI extraction

## Sample Excel Format for Bulk Import

The Excel file should have these columns:
- Category (FD or BG)
- Bank
- Account No.
- FD/BG No.
- Account Name
- Deposit Amount
- Date of Deposit
- Maturity Value
- Contract No.
- Contract Details
- POC
- Location
- EMD
- SD
- Status (Running/Completed/Cancelled/Returned)
