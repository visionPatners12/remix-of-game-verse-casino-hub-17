
-- Create the app_payments schema
CREATE SCHEMA IF NOT EXISTS app_payments;

-- Migrate wallets table to app_payments schema
CREATE TABLE app_payments.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  real_balance numeric NOT NULL DEFAULT 0,
  bonus_balance numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT wallets_real_balance_check CHECK (real_balance >= 0),
  CONSTRAINT wallets_bonus_balance_check CHECK (bonus_balance >= 0)
);

-- Migrate transactions table to app_payments schema
CREATE TABLE app_payments.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL,
  source_balance text NOT NULL DEFAULT 'real',
  status text NOT NULL DEFAULT 'Pending',
  description text,
  payment_method text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transactions_source_balance_check CHECK (source_balance IN ('real', 'bonus'))
);

-- Migrate crypto_payments table to app_payments schema
CREATE TABLE app_payments.crypto_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid,
  payment_id text NOT NULL,
  pay_address text NOT NULL,
  pay_currency text NOT NULL,
  pay_amount numeric NOT NULL,
  network text,
  status text DEFAULT 'waiting',
  order_id text,
  payin_extra_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Migrate mobile_money_transactions table to app_payments schema
CREATE TABLE app_payments.mobile_money_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  phone_number text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  mobile_provider text NOT NULL,
  notchpay_reference text NOT NULL,
  notchpay_payment_id text,
  notchpay_status text NOT NULL DEFAULT 'pending',
  notchpay_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Migrate currency_rates table to app_payments schema
CREATE TABLE app_payments.currency_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Create indexes for better performance
CREATE INDEX idx_app_payments_wallets_user_id ON app_payments.wallets(user_id);
CREATE INDEX idx_app_payments_transactions_wallet_id ON app_payments.transactions(wallet_id);
CREATE INDEX idx_app_payments_transactions_status ON app_payments.transactions(status);
CREATE INDEX idx_app_payments_crypto_payments_transaction_id ON app_payments.crypto_payments(transaction_id);
CREATE INDEX idx_app_payments_crypto_payments_order_id ON app_payments.crypto_payments(order_id);
CREATE INDEX idx_app_payments_mobile_money_notchpay_ref ON app_payments.mobile_money_transactions(notchpay_reference);

-- Create foreign key relationships
ALTER TABLE app_payments.transactions ADD CONSTRAINT fk_transactions_wallet_id 
  FOREIGN KEY (wallet_id) REFERENCES app_payments.wallets(id) ON DELETE CASCADE;

ALTER TABLE app_payments.crypto_payments ADD CONSTRAINT fk_crypto_payments_transaction_id 
  FOREIGN KEY (transaction_id) REFERENCES app_payments.transactions(id) ON DELETE SET NULL;

ALTER TABLE app_payments.mobile_money_transactions ADD CONSTRAINT fk_mobile_money_transaction_id 
  FOREIGN KEY (transaction_id) REFERENCES app_payments.transactions(id) ON DELETE CASCADE;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION app_payments.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON app_payments.wallets
  FOR EACH ROW EXECUTE FUNCTION app_payments.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON app_payments.transactions
  FOR EACH ROW EXECUTE FUNCTION app_payments.update_updated_at_column();

CREATE TRIGGER update_crypto_payments_updated_at BEFORE UPDATE ON app_payments.crypto_payments
  FOR EACH ROW EXECUTE FUNCTION app_payments.update_updated_at_column();

CREATE TRIGGER update_mobile_money_updated_at BEFORE UPDATE ON app_payments.mobile_money_transactions
  FOR EACH ROW EXECUTE FUNCTION app_payments.update_updated_at_column();

CREATE TRIGGER update_currency_rates_updated_at BEFORE UPDATE ON app_payments.currency_rates
  FOR EACH ROW EXECUTE FUNCTION app_payments.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE app_payments.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_payments.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_payments.crypto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_payments.mobile_money_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_payments.currency_rates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallets
CREATE POLICY "Users can view their own wallets" ON app_payments.wallets
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own wallets" ON app_payments.wallets
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role can manage all wallets" ON app_payments.wallets
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for transactions
CREATE POLICY "Users can view transactions for their wallets" ON app_payments.transactions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    wallet_id IN (SELECT id FROM app_payments.wallets WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all transactions" ON app_payments.transactions
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for crypto_payments
CREATE POLICY "Service role can manage crypto payments" ON app_payments.crypto_payments
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for mobile_money_transactions
CREATE POLICY "Service role can manage mobile money transactions" ON app_payments.mobile_money_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for currency_rates
CREATE POLICY "Anyone can read currency rates" ON app_payments.currency_rates
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage currency rates" ON app_payments.currency_rates
  FOR ALL USING (auth.role() = 'service_role');

-- Migrate existing data from public schema (if any exists)
INSERT INTO app_payments.wallets (id, user_id, real_balance, bonus_balance, currency, created_at, updated_at)
SELECT id, user_id, real_balance, bonus_balance, 
       COALESCE(currency, 'USD') as currency, 
       created_at, updated_at
FROM public.wallets
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_payments.transactions (id, wallet_id, amount, type, source_balance, status, description, payment_method, created_at, updated_at)
SELECT id, wallet_id, amount, type, 
       COALESCE(source_balance, 'real') as source_balance,
       COALESCE(status, 'Pending') as status,
       description, payment_method, created_at, 
       COALESCE(updated_at, created_at) as updated_at
FROM public.transactions
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_payments.crypto_payments (id, transaction_id, payment_id, pay_address, pay_currency, pay_amount, network, status, order_id, payin_extra_id, created_at, updated_at)
SELECT id, transaction_id, payment_id, pay_address, pay_currency, pay_amount, network, 
       COALESCE(status, 'waiting') as status, 
       order_id, payin_extra_id, created_at, 
       COALESCE(updated_at, created_at) as updated_at
FROM public.crypto_payments
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_payments.mobile_money_transactions (id, transaction_id, phone_number, amount, currency, mobile_provider, notchpay_reference, notchpay_payment_id, notchpay_status, notchpay_data, created_at, updated_at)
SELECT id, transaction_id, phone_number, amount, 
       COALESCE(currency, 'XAF') as currency,
       mobile_provider::text, notchpay_reference, notchpay_payment_id, 
       COALESCE(notchpay_status, 'pending') as notchpay_status,
       notchpay_data, created_at, updated_at
FROM public.mobile_money_transactions
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_payments.currency_rates (id, from_currency, to_currency, rate, created_at, updated_at)
SELECT id, from_currency, to_currency, rate, created_at, updated_at
FROM public.currency_rates
ON CONFLICT (from_currency, to_currency) DO NOTHING;
