/**
 * Prod deploy: `node dist/migrate.js` bu listeyi çalıştırır.
 * Yerel geliştirmede DATABASE_SYNCHRONIZE=true yeterli olabilir.
 */
import { InitialSchema1761500000000 } from './1761500000000-InitialSchema';
import { CartItemSelectionLabel1761600000000 } from './1761600000000-CartItemSelectionLabel';
import { UserAvatarUrlText1762100000000 } from './1762100000000-UserAvatarUrlText';
import { FixAnalyticsAndSeoSettings1762700000000 } from './1762700000000-FixAnalyticsAndSeoSettings';
import { ProductShippingFee1762800000000 } from './1762800000000-ProductShippingFee';
import { OrderItemVatRate1762900000000 } from './1762900000000-OrderItemVatRate';

export const ALL_MIGRATIONS = [
  InitialSchema1761500000000,
  CartItemSelectionLabel1761600000000,
  UserAvatarUrlText1762100000000,
  FixAnalyticsAndSeoSettings1762700000000,
  ProductShippingFee1762800000000,
  OrderItemVatRate1762900000000,
];
