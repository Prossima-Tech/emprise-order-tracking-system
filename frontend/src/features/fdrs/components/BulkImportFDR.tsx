import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Card, CardContent } from '../../../components/ui/card';
import { useFDRs } from '../hooks/use-fdrs';
import type { BulkImportFDRResult } from '../types/fdr';

interface BulkImportFDRProps {
  onSuccess?: () => void;
}

export function BulkImportFDR({ onSuccess }: BulkImportFDRProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportFDRResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const { bulkImportFDRs } = useFDRs();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null); // Clear previous results
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      const importResult = await bulkImportFDRs(file);
      setResult(importResult);

      // Don't auto-close dialog - let user review results and errors
      // User can manually close by clicking "View Imported FDRs" or "Upload Another File"
    } catch (error) {
      console.error('Bulk import error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription>
          Upload an Excel file (.xlsx or .xls) with the following columns:
          <br />
          <span className="text-xs mt-2 block">
            Category, Bank, Account No., FD/BG No., Account Name, Deposit Amount,
            Date of Deposit, Maturity Value, Contract No., Contract Details, POC,
            Location, EMD, SD, Status
          </span>
        </AlertDescription>
      </Alert>

      {/* File Upload Section */}
      {!result && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="whitespace-nowrap"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{result.totalRows}</p>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{result.failureCount}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{result.skippedCount}</p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Details */}
          {result.createdFdrs.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Successfully Imported FDRs
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">FDR Number</th>
                        <th className="text-left p-2">Bank</th>
                        <th className="text-left p-2">Location</th>
                        <th className="text-right p-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.createdFdrs.map((fdr, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{fdr.fdrNumber || '-'}</td>
                          <td className="p-2">{fdr.bankName}</td>
                          <td className="p-2">{fdr.location || '-'}</td>
                          <td className="p-2 text-right">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                            }).format(fdr.depositAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Details */}
          {result.errors.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  Errors
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Row</th>
                        <th className="text-left p-2">FDR Number</th>
                        <th className="text-left p-2">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((error, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{error.row}</td>
                          <td className="p-2">{error.fdrNumber}</td>
                          <td className="p-2 text-red-600">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Upload Another File
            </Button>
            {result.successCount > 0 && onSuccess && (
              <Button onClick={onSuccess}>
                View Imported FDRs
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
