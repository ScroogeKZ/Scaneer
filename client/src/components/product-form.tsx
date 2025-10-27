import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useState } from "react";

interface ProductFormProps {
  initialBarcode?: string;
  onSubmit: (data: InsertProduct) => void;
  isSubmitting?: boolean;
}

// Common categories for Russian retail
const CATEGORIES = [
  "Молочные продукты",
  "Кондитерские изделия",
  "Напитки",
  "Хлебобулочные изделия",
  "Мясные продукты",
  "Колбасные изделия",
  "Рыба и морепродукты",
  "Овощи и фрукты",
  "Бакалея",
  "Консервы",
  "Замороженные продукты",
  "Алкогольные напитки",
  "Товары для дома",
  "Косметика и гигиена",
  "Другое",
];

const UNITS = ["шт.", "кг", "г", "л", "мл", "упак.", "м"];

export function ProductForm({ initialBarcode, onSubmit, isSubmitting }: ProductFormProps) {
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<"productName" | "retailPrice" | null>(null);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      barcode: initialBarcode || "",
      productName: "",
      retailPrice: "",
      category: "",
      unitOfMeasure: "",
    },
  });

  const startVoiceInput = (fieldName: "productName" | "retailPrice") => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Голосовой ввод не поддерживается в этом браузере");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    setActiveField(fieldName);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      form.setValue(fieldName, transcript);
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setActiveField(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setActiveField(null);
    };

    recognition.start();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Данные товара</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Штрихкод *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="4607159730018"
                      readOnly
                      className="bg-muted"
                      data-testid="input-barcode"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название товара *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder='Молоко 3.2% "Домик в деревне"'
                        data-testid="input-product-name"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => startVoiceInput("productName")}
                        disabled={isListening}
                        data-testid="button-voice-product-name"
                      >
                        {isListening && activeField === "productName" ? (
                          <Mic className="h-4 w-4 text-primary animate-pulse" />
                        ) : (
                          <MicOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="retailPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Розничная цена *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="decimal"
                      placeholder="125.50"
                      data-testid="input-retail-price"
                      onChange={(e) => {
                        // Allow only numbers and decimal point
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        // Ensure only one decimal point
                        const parts = value.split('.');
                        const formatted = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('')
                          : value;
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Введите цену в формате: 125.50
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitOfMeasure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Единица измерения *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-unit">
                        <SelectValue placeholder="Выберите единицу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="button-save-product"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить товар"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
