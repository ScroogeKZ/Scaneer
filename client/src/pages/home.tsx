import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { ProductForm } from "@/components/product-form";
import { ProductHistory } from "@/components/product-history";
import { ExportModal } from "@/components/export-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Product, InsertProduct } from "@shared/schema";
import { ScanBarcode, Download } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();

  // Fetch all products
  const { data: products = [], isLoading, isError, error, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Товар успешно добавлен",
        description: "Можете перейти к следующему сканированию",
      });
      // Reset form
      setScannedBarcode(null);
      // Auto-open scanner for next product
      setTimeout(() => {
        setShowScanner(true);
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка сохранения",
        description: error.message || "Не удалось сохранить товар",
        variant: "destructive",
      });
    },
  });

  const handleScanSuccess = (barcode: string) => {
    setScannedBarcode(barcode);
    setShowScanner(false);
  };

  const handleFormSubmit = (data: InsertProduct) => {
    createProductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-medium">Сканер товаров</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExportModal(true)}
            disabled={products.length === 0}
            data-testid="button-open-export"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Scan Button or Product Form */}
        {scannedBarcode ? (
          <ProductForm
            initialBarcode={scannedBarcode}
            onSubmit={handleFormSubmit}
            isSubmitting={createProductMutation.isPending}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-medium">Начните сканирование</h2>
              <p className="text-muted-foreground">
                Нажмите кнопку ниже для сканирования штрихкода товара
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowScanner(true)}
              className="h-14 px-8"
              data-testid="button-start-scan"
            >
              <ScanBarcode className="mr-2 h-5 w-5" />
              Сканировать штрихкод
            </Button>
            <div className="text-center text-sm text-muted-foreground max-w-md">
              <p className="mb-2">Последовательность действий:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Сканирование штрихкода камерой</li>
                <li>Ввод названия (голосом или текстом)</li>
                <li>Ввод цены, категории и единицы измерения</li>
                <li>Сохранение и переход к следующему товару</li>
              </ol>
            </div>
          </div>
        )}

        {/* Product History */}
        {isError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                <div className="text-destructive">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Ошибка загрузки товаров</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : "Не удалось загрузить список товаров"}
                  </p>
                  <Button onClick={() => refetch()} data-testid="button-retry-fetch">
                    Повторить попытку
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ProductHistory products={products} isLoading={isLoading} />
        )}
      </main>

      {/* Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        products={products}
      />
    </div>
  );
}
