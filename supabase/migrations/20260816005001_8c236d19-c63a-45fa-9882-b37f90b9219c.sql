CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('sale','business_expense','owner_withdrawal','owner_contribution','loan_in','loan_payment','reserve_set','reserve_release','adjustment')),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  description text NOT NULL DEFAULT '',
  category text,
  source text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX financial_transactions_sale_order_unique
  ON public.financial_transactions (order_id)
  WHERE type = 'sale' AND order_id IS NOT NULL;

CREATE INDEX financial_transactions_occurred_at_idx ON public.financial_transactions (occurred_at DESC);

GRANT ALL ON public.financial_transactions TO service_role;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.financial_reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','released')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);

GRANT ALL ON public.financial_reserves TO service_role;
ALTER TABLE public.financial_reserves ENABLE ROW LEVEL SECURITY;