import {Component, computed, signal, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Workbook} from 'exceljs';
import {saveAs} from 'file-saver';
import {HttpClient} from '@angular/common/http';
import {catchError, of} from 'rxjs';

interface MesInvestimento {
    mes: number;
    saldoInicial: number;
    aporte: number;
    rendimento: number;
    saldoFinal: number;
}

interface SelicResponse {
    valor: string;
    data: string;
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
    title = 'Calculadora de Investimentos';

    valorInicial = signal(10000);
    taxaMensal = signal(0.8);
    aporteMensal = signal(500);
    numeroMeses = signal(24);
    carregandoSelic = signal(false);
    selicAtualizada = signal(false);

    constructor(private http: HttpClient) {
    }

    ngOnInit() {
        this.carregarTaxaSelic();
    }

    carregarTaxaSelic() {
        this.carregandoSelic.set(true);

        // API do Banco Central - Meta SELIC (definida pelo COPOM)
        // Serie 432 = Meta SELIC
        const urlSelic = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json';

        this.http.get<SelicResponse[]>(urlSelic).pipe(
            catchError(error => {
                console.warn('Erro ao carregar SELIC, usando taxa padrão:', error);
                return of(null);
            })
        ).subscribe(response => {
            this.carregandoSelic.set(false);

            if (response && response.length > 0) {
                const taxaSelicAnual = parseFloat(response[0].valor);
                // Converter taxa anual para mensal: (1 + taxa_anual/100)^(1/12) - 1
                const taxaMensal = (Math.pow(1 + taxaSelicAnual / 100, 1 / 12) - 1) * 100;

                console.log(`📊 SELIC META do Banco Central:`);
                console.log(`   Anual: ${taxaSelicAnual}%`);
                console.log(`   Mensal: ${taxaMensal.toFixed(4)}%`);
                console.log(`   Data: ${response[0].data}`);

                this.taxaMensal.set(Number(taxaMensal.toFixed(2)));
                this.selicAtualizada.set(true);
            } else {
                console.log('Usando taxa padrão: 0.8%');
                this.selicAtualizada.set(false);
            }
        });
    }

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
        this.selicAtualizada.set(false); // Marca como taxa manual
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

        worksheet.columns = [
            {width: 20},
            {width: 18},
            {width: 18},
            {width: 18},
            {width: 18}
        ];

        worksheet.mergeCells('A1:E1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'SIMULAÇÃO DE INVESTIMENTOS';
        titleCell.font = {size: 16, bold: true, color: {argb: 'FFFFFFFF'}};
        titleCell.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF2C3E50'}};
        titleCell.alignment = {horizontal: 'center', vertical: 'middle'};
        worksheet.getRow(1).height = 30;

        worksheet.addRow([]);

        const paramHeader = worksheet.addRow(['PARÂMETROS DA SIMULAÇÃO']);
        worksheet.mergeCells(`A${paramHeader.number}:B${paramHeader.number}`);
        paramHeader.font = {bold: true, size: 12};
        paramHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF18BC9C'}};

        worksheet.addRow(['Valor Inicial (R$)', this.valorInicial()]);
        worksheet.addRow(['Taxa Mensal (%)', this.taxaMensal()]);
        worksheet.addRow(['Aporte Mensal (R$)', this.aporteMensal()]);
        worksheet.addRow(['Número de Meses', this.numeroMeses()]);

        worksheet.addRow([]);

        const resumoHeader = worksheet.addRow(['RESUMO FINANCEIRO']);
        worksheet.mergeCells(`A${resumoHeader.number}:B${resumoHeader.number}`);
        resumoHeader.font = {bold: true, size: 12};
        resumoHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF18BC9C'}};

        worksheet.addRow(['Total Investido (R$)', this.totalInvestido()]);
        worksheet.addRow(['Saldo Final (R$)', this.saldoFinal()]);
        worksheet.addRow(['Rendimento Total (R$)', this.rendimentoTotal()]);
        worksheet.addRow(['Rentabilidade (%)', this.rentabilidadePercentual()]);

        worksheet.addRow([]);

        const tableHeader = worksheet.addRow(['EVOLUÇÃO MENSAL']);
        worksheet.mergeCells(`A${tableHeader.number}:E${tableHeader.number}`);
        tableHeader.font = {bold: true, size: 12, color: {argb: 'FFFFFFFF'}};
        tableHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF2C3E50'}};
        tableHeader.alignment = {horizontal: 'center'};

        const columnHeader = worksheet.addRow(['Mês', 'Saldo Inicial (R$)', 'Aporte (R$)', 'Rendimento (R$)', 'Saldo Final (R$)']);
        columnHeader.font = {bold: true, color: {argb: 'FFFFFFFF'}};
        columnHeader.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF34495E'}};
        columnHeader.alignment = {horizontal: 'center'};

        this.evolucaoMensal().forEach(item => {
            const row = worksheet.addRow([
                item.mes,
                item.saldoInicial,
                item.aporte,
                item.rendimento,
                item.saldoFinal
            ]);

            for (let col = 2; col <= 5; col++) {
                row.getCell(col).numFmt = 'R$ #,##0.00';
            }
        });

        const totalRow = worksheet.addRow([
            'TOTAL',
            '',
            this.aporteMensal() * this.numeroMeses(),
            this.rendimentoTotal(),
            this.saldoFinal()
        ]);
        totalRow.font = {bold: true};
        totalRow.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFECF0F1'}};

        totalRow.getCell(3).numFmt = 'R$ #,##0.00';
        totalRow.getCell(4).numFmt = 'R$ #,##0.00';
        totalRow.getCell(5).numFmt = 'R$ #,##0.00';

        for (let row = 4; row <= 7; row++) {
            worksheet.getCell(`B${row}`).numFmt = row === 5 ? '0.00' : 'R$ #,##0.00';
        }

        for (let row = 10; row <= 13; row++) {
            worksheet.getCell(`B${row}`).numFmt = row === 13 ? '0.00%' : 'R$ #,##0.00';
        }

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

        const buffer = await workbook.xlsx.writeBuffer();
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        const nomeArquivo = `simulacao-investimentos-${dataFormatada}.xlsx`;

        const blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        saveAs(blob, nomeArquivo);
    }

    protected readonly Math = Math;
}