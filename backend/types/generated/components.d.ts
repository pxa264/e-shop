import type { Schema, Attribute } from '@strapi/strapi';

export interface ProductVariant extends Schema.Component {
  collectionName: 'components_product_variants';
  info: {
    displayName: 'Product Variant';
    description: 'Product variant with name, price, stock, and SKU';
  };
  attributes: {
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    price: Attribute.Decimal &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    stock: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Attribute.DefaultTo<0>;
    sku: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'product.variant': ProductVariant;
    }
  }
}
