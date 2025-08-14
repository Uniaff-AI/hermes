interface Product {
  productId: string;
  productName: string;
  vertical: string;
  country: string;
  aff: string;
}

export async function validateProductExists(
  productId: string,
  productName: string
): Promise<{ isValid: boolean; error?: string }> {
  try {
    const response = await fetch('/api/external/get_products');
    if (!response.ok) {
      return {
        isValid: false,
        error: 'Не удалось получить список доступных продуктов',
      };
    }

    const products: Product[] = await response.json();

    const productExists = products.some(
      (product) => product.productId === productId
    );

    if (!productExists) {
      return {
        isValid: false,
        error: `Продукт "${productName}" (ID: ${productId}) не найден в списке доступных продуктов. Возможно, продукт был удален или недоступен.`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Ошибка при проверке продукта: ${
        error instanceof Error ? error.message : 'Неизвестная ошибка'
      }`,
    };
  }
}

export function validateProductLeadFilters(
  product: Product,
  leadFilters: {
    leadVertical?: string | null;
    leadCountry?: string | null;
    leadAffiliate?: string | null;
  }
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (
    leadFilters.leadVertical &&
    leadFilters.leadVertical.trim() !== '' &&
    product.vertical !== leadFilters.leadVertical
  ) {
    errors.push(
      `Несоответствие вертикали: продукт "${product.productName}" имеет вертикаль "${product.vertical}", а фильтр лидов установлен на "${leadFilters.leadVertical}"`
    );
  }

  if (
    leadFilters.leadCountry &&
    leadFilters.leadCountry.trim() !== '' &&
    product.country !== leadFilters.leadCountry
  ) {
    errors.push(
      `Несоответствие страны: продукт "${product.productName}" предназначен для страны "${product.country}", а фильтр лидов установлен на "${leadFilters.leadCountry}"`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
