/**
 * Prod deploy: `node dist/migrate.js` bu listeyi çalıştırır.
 * Yerel geliştirmede DATABASE_SYNCHRONIZE=true yeterli olabilir.
 */
import { InitialSchema1761500000000 } from './1761500000000-InitialSchema';
import { CartItemSelectionLabel1761600000000 } from './1761600000000-CartItemSelectionLabel';

export const ALL_MIGRATIONS = [
  InitialSchema1761500000000,
  CartItemSelectionLabel1761600000000,
];
