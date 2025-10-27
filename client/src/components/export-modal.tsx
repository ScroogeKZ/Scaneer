import { Product, ExportData } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
}

export function ExportModal({ open, onOpenChange, products }: ExportModalProps) {
  const { toast } = useToast();

  const convertToExportData = (products: Product[]): ExportData[] => {
    return products.map((p) => ({
      barcode: p.barcode,
      productName: p.productName,
      retailPrice: p.retailPrice,
      category: p.category,
      unitOfMeasure: p.unitOfMeasure,
    }));
  };

  const exportToCSV = () => {
    try {
      if (!products || products.length === 0) {
        toast({
          title: "Нет данных для экспорта",
          description: "Добавьте товары перед экспортом",
          variant: "destructive",
        });
        return;
      }

      const data = convertToExportData(products);
      
      // Create CSV with semicolon separator as specified
      const headers = ["Barcode", "Product Name", "Retail Price", "Category", "Unit of Measure"];
      const rows = data.map((item) =>
        [
          item.barcode,
          `"${item.productName.replace(/"/g, '""')}"`, // Escape quotes
          item.retailPrice,
          item.category,
          item.unitOfMeasure,
        ].join(";")
      );

      const csv = [headers.join(";"), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // Add BOM for Excel
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Экспорт успешен",
        description: `Экспортировано ${products.length} товаров в формате CSV`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные в CSV",
        variant: "destructive",
      });
    }
  };

  const exportToJSON = () => {
    try {
      if (!products || products.length === 0) {
        toast({
          title: "Нет данных для экспорта",
          description: "Добавьте товары перед экспортом",
          variant: "destructive",
        });
        return;
      }

      const data = convertToExportData(products);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Экспорт успешен",
        description: `Экспортировано ${products.length} товаров в формате JSON`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("JSON export error:", error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные в JSON",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Экспорт данных</DialogTitle>
          <DialogDescription>
            Выберите формат для экспорта данных о товарах
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Формат CSV</p>
                <p className="text-xs text-muted-foreground">
                  Для импорта в Excel или POS-системы
                </p>
              </div>
            </div>
            <Button
              onClick={exportToCSV}
              size="sm"
              disabled={products.length === 0}
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Формат JSON</p>
                <p className="text-xs text-muted-foreground">
                  Для программной обработки данных
                </p>
              </div>
            </div>
            <Button
              onClick={exportToJSON}
              size="sm"
              disabled={products.length === 0}
              data-testid="button-export-json"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>

          <div className="flex items-center justify-center pt-2">
            <Badge variant="secondary" data-testid="badge-export-count">
              {products.length} {products.length === 1 ? "товар" : "товаров"} к экспорту
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
