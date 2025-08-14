import { useEffect } from 'react';
import { useProducts } from '@/features/products/model/hooks';
import { useRuleCreationStore } from '../state';

export const useRuleCreationProducts = () => {
  const { data: products = [] } = useProducts();
  const { initializeProducts } = useRuleCreationStore();

  useEffect(() => {
    if (products.length > 0) {
      initializeProducts(products);
    }
  }, [products, initializeProducts]);

  return { products };
};
