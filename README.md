# 💰 Calculadora de Investimentos

Uma aplicação moderna e intuitiva para simular a evolução de investimentos com juros compostos, desenvolvida com **Angular 21**, **Bootstrap 5** e **Bootswatch Flatly**.

![Angular](https://img.shields.io/badge/Angular-21-red)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Funcionalidades

### ✨ Principais
- ✅ **Simulação de Investimentos** - Cálculo com juros compostos e aportes mensais
- ✅ **Exportação para Excel** - Exporta todos os dados da simulação em formato XLSX
- ✅ **Interface Moderna** - Design profissional com Bootstrap 5 + Bootswatch Flatly
- ✅ **Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- ✅ **Atualização em Tempo Real** - Cálculos instantâneos ao modificar parâmetros

### 📊 Métricas Exibidas
- Total Investido (capital inicial + aportes)
- Saldo Final após o período
- Rendimento Total em R$
- Rentabilidade Percentual
- Evolução mês a mês detalhada

### 🎨 Design Features
- Gradientes modernos nos cards de métricas
- Ícones Bootstrap Icons
- Animações suaves
- Tabela com scroll customizado
- Tema Flatly (cores profissionais)

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 10 ou superior

## 🔧 Instalação

1. Extraia o arquivo ZIP

2. Instale as dependências:
```bash
npm install
```

## 🏃 Executando o Projeto

### Modo desenvolvimento
```bash
npm start
```
Acesse: `http://localhost:4200`

### Build para produção
```bash
npm run build
```
Os arquivos otimizados estarão em `dist/`

## 📖 Como Usar

### Parâmetros de Entrada

1. **Valor Inicial (R$)**: Quanto você tem para investir inicialmente
2. **Taxa Mensal (%)**: Percentual de rendimento por mês (ex: 0.8% = CDI aprox.)
3. **Aporte Mensal (R$)**: Valor que será investido todo mês
4. **Período**: Número de meses da simulação (1 a 120 meses / 10 anos)

### Visualização dos Resultados

- **Cards de Métricas**: Resumo visual com totais e percentuais
- **Tabela Detalhada**: Evolução completa mês a mês
- **Rodapé com Totalizadores**: Soma de todos os aportes e rendimentos

### Exportação para Excel

Clique no botão **"Exportar Excel"** no canto superior direito para:
- Gerar arquivo XLSX com todos os dados
- Incluir parâmetros da simulação
- Incluir resumo financeiro
- Incluir tabela completa da evolução mensal
- Nome do arquivo com data: `simulacao-investimentos-YYYY-MM-DD.xlsx`

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 21** - Framework principal
- **TypeScript 5** - Linguagem
- **Signals** - Sistema reativo do Angular
- **Standalone Components** - Arquitetura moderna

### UI/UX
- **Bootstrap 5** - Framework CSS
- **Bootswatch Flatly** - Tema profissional
- **Bootstrap Icons** - Ícones
- **Google Fonts (Lato)** - Tipografia

### Bibliotecas
- **ExcelJS** - Exportação para Excel (segura e moderna)
- **FileSaver** - Download de arquivos
- **Intl.NumberFormat** - Formatação de moedas e percentuais

## 📂 Estrutura do Projeto

```
compount-calc-app/
├── src/
│   ├── app/
│   │   ├── app.ts              # Componente principal com lógica
│   │   ├── app.html            # Template com Bootstrap
│   │   ├── app.css             # Estilos específicos
│   │   └── app.config.ts       # Configuração do app
│   ├── styles.css              # Estilos globais + Bootswatch
│   └── index.html              # HTML base
├── package.json                # Dependências
├── angular.json               # Configuração Angular
└── README.md                  # Este arquivo
```

## 🎯 Fórmulas Utilizadas

### Cálculo Mensal
```
Rendimento = (Saldo Inicial + Aporte) × Taxa Mensal (%)
Saldo Final = Saldo Inicial + Aporte + Rendimento
```

### Métricas Totais
```
Total Investido = Valor Inicial + (Aporte Mensal × Número de Meses)
Rendimento Total = Saldo Final - Total Investido
Rentabilidade (%) = (Rendimento Total / Total Investido) × 100
```

## 💡 Dicas de Uso

### Exemplos de Taxas Mensais
- **CDI (atual)**: ~0.80% ao mês (~10% ao ano)
- **Poupança**: ~0.50% ao mês (~6% ao ano)
- **Tesouro Selic**: ~0.85% ao mês (~10.5% ao ano)
- **CDB 100% CDI**: ~0.80% ao mês (~10% ao ano)
- **Ações (conservador)**: ~1.0% ao mês (~12% ao ano)

### Simulações Interessantes
1. **Aposentadoria**: 30 anos (360 meses) com aportes mensais
2. **Meta de curto prazo**: 12-24 meses para objetivos específicos
3. **Reserva de emergência**: 6-12 meses com taxa conservadora

## 🎨 Personalização

### Alterar Tema Bootswatch
Edite `src/styles.css`:
```css
@import 'bootswatch/dist/[TEMA]/bootstrap.min.css';
```

Temas disponíveis: `flatly`, `lux`, `minty`, `pulse`, `sandstone`, `slate`, `superhero`, `united`

### Cores Personalizadas
Modifique os gradientes em `src/styles.css`:
```css
.metric-card {
  background: linear-gradient(135deg, #sua-cor-1 0%, #sua-cor-2 100%);
}
```

## 🐛 Resolução de Problemas

### Erro ao instalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta 4200 em uso
```bash
ng serve --port 4201
```

### Erro na exportação Excel
Verifique se as bibliotecas estão instaladas:
```bash
npm install exceljs file-saver
```

## 🔒 Segurança

Este projeto utiliza **ExcelJS** ao invés de outras bibliotecas populares que possuem vulnerabilidades conhecidas. ExcelJS é:
- ✅ Mantido ativamente
- ✅ Sem vulnerabilidades CVE conhecidas
- ✅ Melhor performance
- ✅ Mais recursos de formatação

## 📊 Exemplos de Uso

### Exemplo 1: Investidor Iniciante
- Valor Inicial: R$ 1.000
- Taxa: 0.8% (CDI)
- Aporte: R$ 200/mês
- Período: 24 meses
- **Resultado**: ~R$ 6.300 (rendimento de ~R$ 500)

### Exemplo 2: Planejamento de Aposentadoria
- Valor Inicial: R$ 10.000
- Taxa: 0.9%
- Aporte: R$ 1.000/mês
- Período: 120 meses (10 anos)
- **Resultado**: ~R$ 207.000 (rendimento de ~R$ 77.000)

## 🤝 Contribuindo

Este é um projeto de uso livre. Sinta-se à vontade para:
- Sugerir melhorias
- Reportar bugs
- Fazer fork e personalizar

## 📄 Licença

Projeto de código aberto para fins educacionais e uso pessoal.

## 🔮 Próximas Funcionalidades (Roadmap)

- [ ] Gráfico de evolução do investimento
- [ ] Comparação entre diferentes cenários
- [ ] Cálculo de IR (Imposto de Renda)
- [ ] Histórico de simulações salvas
- [ ] Modo escuro
- [ ] Calculadora de juros compostos reversa
- [ ] Exportação para PDF

## 📞 Suporte

Para dúvidas sobre investimentos, consulte sempre um profissional certificado (assessor de investimentos ou planejador financeiro).

---

**Desenvolvido com ❤️ usando Angular 21 + Bootstrap 5**
