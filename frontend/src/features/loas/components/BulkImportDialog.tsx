import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { useLOAs } from '../hooks/use-loas';
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { ScrollArea } from "../../../components/ui/scroll-area";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImportResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: Array<{
    row: number;
    loaNumber: string;
    error: string;
  }>;
  createdLoas: Array<{
    loaNumber: string;
    loaValue: number;
    site: string;
  }>;
}

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { bulkImportLOAs } = useLOAs();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (!validTypes.includes(file.type)) {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setImporting(true);
      const result = await bulkImportLOAs(selectedFile);
      setImportResult(result);

      // If there are successful imports, call onSuccess to refresh the list
      if (result.successCount > 0) {
        onSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import LOAs</DialogTitle>
          <DialogDescription>
            Import multiple LOAs from an Excel file. The file should contain columns:
            PO/LOA Number, Site, Order Value, Description of Work, Order Received Date, Delivery Date, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {!importResult ? (
            <>
              {/* File Upload Section */}
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="excel-file-input"
                />
                <label
                  htmlFor="excel-file-input"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : 'Click to upload Excel file'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: .xlsx, .xls (Max 20MB)
                    </p>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertTitle>File Ready</AlertTitle>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            /* Import Results Section */
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Rows</p>
                  <p className="text-2xl font-bold text-blue-700">{importResult.totalRows}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Success</p>
                  <p className="text-2xl font-bold text-green-700">{importResult.successCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{importResult.failureCount}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Skipped</p>
                  <p className="text-2xl font-bold text-yellow-700">{importResult.skippedCount}</p>
                </div>
              </div>

              {/* Created LOAs */}
              {importResult.createdLoas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Successfully Created LOAs
                  </h4>
                  <ScrollArea className="h-40 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>LOA Number</TableHead>
                          <TableHead>Site</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.createdLoas.map((loa, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{loa.loaNumber}</TableCell>
                            <TableCell>{loa.site}</TableCell>
                            <TableCell className="text-right">₹{loa.loaValue.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                    Errors ({importResult.errors.length})
                  </h4>
                  <ScrollArea className="h-[300px] border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Row</TableHead>
                          <TableHead className="w-[200px]">LOA Number</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.errors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell className="w-[80px]">{error.row}</TableCell>
                            <TableCell className="font-medium w-[200px]">{error.loaNumber}</TableCell>
                            <TableCell className="text-red-600 text-sm break-words">{error.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!importResult ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                Import Another File
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
