import {Component, computed, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Workbook} from 'exceljs';
import {saveAs} from 'file-saver';

interface MesInvestimento {
    mes: number;
    saldoInicial: number;
    aporte: number;
    rendimento: number;
    saldoFinal: number;
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent {
    title = 'Calculadora de Investimentos';

    valorInicial = signal(10000);
    taxaMensal = signal(0.8);
    aporteMensal = signal(500);
    numeroMeses = signal(24);

    evolucaoMensal = computed(() => {
        const meses: MesInvestimento[] = [];

        for (let mes = 1; mes <= this.numeroMeses(); mes++) {
            const saldoInicial = mes === 1 ? this.valorInicial() : meses[mes - 2].saldoFinal;
            const aporte = this.aporteMensal();
            const rendimento = (saldoInicial + aporte) * (this.taxaMensal() / 100);
            const saldoFinal = saldoInicial + aporte + rendimento;

            meses.push({mes, saldoInicial, aporte, rendimento, saldoFinal});
        }

        return meses;
    });

    totalInvestido = computed(() => {
        return this.valorInicial() + (this.aporteMensal() * this.numeroMeses());
    });

    saldoFinal = computed(() => {
        const evolucao = this.evolucaoMensal();
        return evolucao.length > 0 ? evolucao[evolucao.length - 1].saldoFinal : 0;
    });

    rendimentoTotal = computed(() => {
        return this.saldoFinal() - this.totalInvestido();
    });

    rentabilidadePercentual = computed(() => {
        return (this.rendimentoTotal() / this.totalInvestido()) * 100;
    });

    updateValorInicial(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.valorInicial.set(Number(value) || 0);
    }

    updateTaxaMensal(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.taxaMensal.set(Number(value) || 0);
    }

    updateAporteMensal(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.aporteMensal.set(Number(value) || 0);
    }

    updateNumeroMeses(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        const meses = Number(value) || 1;
        this.numeroMeses.set(Math.min(Math.max(meses, 1), 360));
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatPercent(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value / 100);
    }

    async exportarParaExcel() {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Simulação de Investimentos');

        // Configurar largura das colunas
        worksheet.columns = [
            {width: 20},
            {width: 18},
            {width: 18},
            {width: 18},
            {width: 18}
        ];

        // Título
        worksheet.mergeCells('A1:E1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'SIMULAÇÃO DE INVESTIMENTOS';
        titleCell.font = {size: 16, bold: true, color: {argb: 'FFFFFFFF'}};
        titleCell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF2C3E50'}};
        titleCell.alignment = {horizontal: 'center', vertical: 'middle'};
        worksheet.getRow(1).height = 30;

        // Espaço
        worksheet.addRow([]);

        const paramHeader = worksheet.addRow(['PARÂMETROS DA SIMULAÇÃO']);
        worksheet.mergeCells(`A${paramHeader.number}:B${paramHeader.number}`);
        paramHeader.font = {bold: true, size: 12};
        paramHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF18BC9C'}};

        worksheet.addRow(['Valor Inicial (R$)', this.valorInicial()]);
        worksheet.addRow(['Taxa Mensal (%)', this.taxaMensal()]);
        worksheet.addRow(['Aporte Mensal (R$)', this.aporteMensal()]);
        worksheet.addRow(['Número de Meses', this.numeroMeses()]);

        // Espaço
        worksheet.addRow([]);

        // Seção de Resumo
        const resumoHeader = worksheet.addRow(['RESUMO FINANCEIRO']);
        worksheet.mergeCells(`A${resumoHeader.number}:B${resumoHeader.number}`);
        resumoHeader.font = {bold: true, size: 12};
        resumoHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF18BC9C'}};

        worksheet.addRow(['Total Investido (R$)', this.totalInvestido()]);
        worksheet.addRow(['Saldo Final (R$)', this.saldoFinal()]);
        worksheet.addRow(['Rendimento Total (R$)', this.rendimentoTotal()]);
        worksheet.addRow(['Rentabilidade (%)', this.rentabilidadePercentual()]);

        // Espaço
        worksheet.addRow([]);

        // Cabeçalho da Tabela de Evolução
        const tableHeader = worksheet.addRow(['EVOLUÇÃO MENSAL']);
        worksheet.mergeCells(`A${tableHeader.number}:E${tableHeader.number}`);
        tableHeader.font = {bold: true, size: 12, color: {argb: 'FFFFFFFF'}};
        tableHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF2C3E50'}};
        tableHeader.alignment = {horizontal: 'center'};

        // Cabeçalhos das colunas
        const columnHeader = worksheet.addRow(['Mês', 'Saldo Inicial (R$)', 'Aporte (R$)', 'Rendimento (R$)', 'Saldo Final (R$)']);
        columnHeader.font = {bold: true, color: {argb: 'FFFFFFFF'}};
        columnHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF34495E'}};
        columnHeader.alignment = {horizontal: 'center'};

        // Dados da evolução
        this.evolucaoMensal().forEach(item => {
            const row = worksheet.addRow([
                item.mes,
                item.saldoInicial,
                item.aporte,
                item.rendimento,
                item.saldoFinal
            ]);

            // Formatação de moeda para colunas B a E
            for (let col = 2; col <= 5; col++) {
                row.getCell(col).numFmt = 'R$ #,##0.00';
            }
        });

        // Linha de total
        const totalRow = worksheet.addRow([
            'TOTAL',
            '',
            this.aporteMensal() * this.numeroMeses(),
            this.rendimentoTotal(),
            this.saldoFinal()
        ]);
        totalRow.font = {bold: true};
        totalRow.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFECF0F1'}};

        // Formatação de moeda para totais
        totalRow.getCell(3).numFmt = 'R$ #,##0.00';
        totalRow.getCell(4).numFmt = 'R$ #,##0.00';
        totalRow.getCell(5).numFmt = 'R$ #,##0.00';

        // Formatação das células de valores monetários na seção de parâmetros e resumo
        for (let row = 4; row <= 7; row++) {
            worksheet.getCell(`B${row}`).numFmt = row === 5 ? '0.00' : 'R$ #,##0.00';
        }

        for (let row = 10; row <= 13; row++) {
            worksheet.getCell(`B${row}`).numFmt = row === 13 ? '0.00%' : 'R$ #,##0.00';
        }

        // Adicionar bordas
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'}
                    };
                });
            }
        });

        // Gerar arquivo
        const buffer = await workbook.xlsx.writeBuffer();
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        const nomeArquivo = `simulacao-investimentos-${dataFormatada}.xlsx`;

        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        saveAs(blob, nomeArquivo);
    }

    protected readonly Math = Math;
}
