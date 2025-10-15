-- Criar tabela para armazenar cadastros do pré-lançamento
CREATE TABLE public.pre_lancamento_cadastros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  celular TEXT NOT NULL,
  aceitar_notificacoes BOOLEAN NOT NULL DEFAULT false,
  aceitar_lgpd BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice no email para buscas rápidas e evitar duplicatas
CREATE UNIQUE INDEX idx_pre_lancamento_email ON public.pre_lancamento_cadastros(email);

-- Habilitar Row Level Security
ALTER TABLE public.pre_lancamento_cadastros ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (qualquer pessoa pode se cadastrar)
CREATE POLICY "Permitir cadastro público"
  ON public.pre_lancamento_cadastros
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir leitura apenas por usuários autenticados (futura administração)
CREATE POLICY "Apenas autenticados podem visualizar"
  ON public.pre_lancamento_cadastros
  FOR SELECT
  TO authenticated
  USING (true);