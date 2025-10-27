import { Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface ProductHistoryProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductHistory({ products, isLoading }: ProductHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>История товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>История товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Нет отсканированных товаров</h3>
            <p className="text-sm text-muted-foreground">
              Начните сканирование товаров для заполнения истории
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>История товаров</CardTitle>
        <Badge variant="secondary" data-testid="badge-product-count">
          {products.length} {products.length === 1 ? "товар" : "товаров"}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* Mobile view - Cards */}
        <div className="md:hidden space-y-4">
          {products.map((product) => (
            <Card key={product.id} data-testid={`card-product-${product.id}`}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1 truncate" data-testid={`text-name-${product.id}`}>
                      {product.productName}
                    </h4>
                    <p className="text-xs text-muted-foreground" data-testid={`text-barcode-${product.id}`}>
                      {product.barcode}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-sm" data-testid={`text-price-${product.id}`}>
                      {product.retailPrice} ₽
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.unitOfMeasure}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop view - Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Штрихкод</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Ед. изм.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                  <TableCell className="font-mono text-sm" data-testid={`text-barcode-${product.id}`}>
                    {product.barcode}
                  </TableCell>
                  <TableCell className="font-medium" data-testid={`text-name-${product.id}`}>
                    {product.productName}
                  </TableCell>
                  <TableCell className="text-right font-medium" data-testid={`text-price-${product.id}`}>
                    {product.retailPrice} ₽
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{product.unitOfMeasure}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
