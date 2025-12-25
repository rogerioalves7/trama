# 📋 TODO List - Trama ERP

## 🚀 Prioridade Alta (Imediato)
- [ ] **Verificar Fluxo de Compras (Entradas)**
    - [ ] Cadastrar insumos de teste.
    - [ ] Registrar uma compra com múltiplos itens e frete.
    - [ ] Conferir se o estoque dos materiais aumentou.
    - [ ] Conferir se o "Custo Atual" do material foi atualizado corretamente (com rateio do frete).
- [ ] **Verificar Fluxo de Produção**
    - [ ] Criar um Produto com Ficha Técnica (usando os materiais recém-comprados).
    - [ ] Realizar uma produção.
    - [ ] Validar se o estoque dos insumos baixou e o do produto subiu.
- [ ] **Testar Vendas (PDV)**
    - [ ] Como resetamos o banco financeiro, testar uma venda no PDV.
    - [ ] Verificar se a venda gera a transação financeira corretamente.

## 🛠️ Backend & Banco de Dados
- [ ] **Relatório de Movimentação de Estoque (Kardex)**
    - [ ] Criar tabela/log para registrar *toda* entrada e saída (não apenas o saldo final).
    - [ ] Implementar Model `StockMovement` (Tipo: Compra, Produção, Perda, Ajuste).
- [ ] **Ajuste Manual de Estoque**
    - [ ] Criar endpoint para correção de saldo (inventário) sem precisar "comprar" ou "produzir".

## 💻 Frontend (Web & Mobile)
- [ ] **Otimizar Formulário de Compras para Mobile**
    - [ ] A tabela de itens da compra pode ficar larga no celular. Adaptar para *cards* ou layout vertical em telas pequenas.
- [ ] **Histórico de Produções**
    - [ ] Criar tela para listar o histórico de produções realizadas (hoje só vemos o saldo final).
    - [ ] Permitir "desfazer" uma produção (estorno de estoque).
- [ ] **Dashboard Principal**
    - [ ] Atualizar os cards do Dashboard para puxar dados reais das novas tabelas (`Purchase` e `Sale`).
    - [ ] Adicionar gráfico de "Custos vs Faturamento".

## 🎨 UX/UI (Experiência do Usuário)
- [ ] **Feedback Visual de Estoque Baixo**
    - [ ] Destacar em vermelho no PDV produtos sem estoque.
    - [ ] Criar alerta na Home de "Materiais Críticos" (abaixo do mínimo).
- [ ] **Impressão**
    - [ ] Gerar PDF simples da Nota de Compra ou do Pedido de Venda.

## ⚙️ DevOps & Configuração
- [ ] **Variáveis de Ambiente**
    - [ ] Garantir que `SECRET_KEY`, `DEBUG` e credenciais do Supabase estejam em arquivo `.env` e não no código.
- [ ] **Backup**
    - [ ] Configurar rotina de backup do banco Supabase.