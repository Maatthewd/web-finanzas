package com.matech.finanzas.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.repository.MovimientoRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.itextpdf.layout.element.Cell;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportService {

    private final MovimientoRepository movimientoRepository;

    /**
     * Exporta movimientos a Excel
     */
    public byte[] exportarMovimientosExcel(
            TipoMovimiento tipo,
            Boolean pagado,
            Long categoriaId,
            LocalDate inicio,
            LocalDate fin) throws IOException {

        Long usuarioId = SecurityUtils.getCurrentUserId();

        List<Movimiento> movimientos = movimientoRepository.filtrarMovimientos(
                tipo, pagado, categoriaId, inicio, fin, usuarioId);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Movimientos");

            // Estilo para encabezados
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Estilo para montos
            CellStyle moneyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            moneyStyle.setDataFormat(format.getFormat("$#,##0.00"));

            // Estilo para fechas
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(format.getFormat("dd/mm/yyyy"));

            // Crear fila de encabezados
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Fecha", "Descripción", "Tipo", "Categoría", "Monto", "Pagado", "Vencimiento"};

            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Llenar datos
            int rowNum = 1;
            BigDecimal totalIngresos = BigDecimal.ZERO;
            BigDecimal totalEgresos = BigDecimal.ZERO;

            for (Movimiento mov : movimientos) {
                Row row = sheet.createRow(rowNum++);

                // Fecha
                org.apache.poi.ss.usermodel.Cell cellFecha = row.createCell(0);
                cellFecha.setCellValue(mov.getFecha().toString());
                cellFecha.setCellStyle(dateStyle);

                // Descripción
                row.createCell(1).setCellValue(mov.getDescripcion());

                // Tipo
                row.createCell(2).setCellValue(mov.getTipo().toString());

                // Categoría
                row.createCell(3).setCellValue(mov.getCategoria().getNombre());

                // Monto
                org.apache.poi.ss.usermodel.Cell cellMonto = row.createCell(4);
                cellMonto.setCellValue(mov.getMonto().doubleValue());
                cellMonto.setCellStyle(moneyStyle);

                // Pagado
                row.createCell(5).setCellValue(mov.isPagado() ? "Sí" : "No");

                // Vencimiento
                if (mov.getFechaVencimiento() != null) {
                    org.apache.poi.ss.usermodel.Cell cellVenc = row.createCell(6);
                    cellVenc.setCellValue(mov.getFechaVencimiento().toString());
                    cellVenc.setCellStyle(dateStyle);
                }

                // Acumular totales
                if (mov.getTipo() == TipoMovimiento.INGRESO && mov.isPagado()) {
                    totalIngresos = totalIngresos.add(mov.getMonto());
                } else if (mov.getTipo() == TipoMovimiento.EGRESO && mov.isPagado()) {
                    totalEgresos = totalEgresos.add(mov.getMonto());
                }
            }

            // Agregar totales
            rowNum += 2;
            Row totalRow = sheet.createRow(rowNum++);
            totalRow.createCell(3).setCellValue("Total Ingresos:");
            org.apache.poi.ss.usermodel.Cell cellTotalIngresos = totalRow.createCell(4);
            cellTotalIngresos.setCellValue(totalIngresos.doubleValue());
            cellTotalIngresos.setCellStyle(moneyStyle);

            totalRow = sheet.createRow(rowNum++);
            totalRow.createCell(3).setCellValue("Total Egresos:");
            org.apache.poi.ss.usermodel.Cell cellTotalEgresos = totalRow.createCell(4);
            cellTotalEgresos.setCellValue(totalEgresos.doubleValue());
            cellTotalEgresos.setCellStyle(moneyStyle);

            totalRow = sheet.createRow(rowNum);
            totalRow.createCell(3).setCellValue("Balance:");
            org.apache.poi.ss.usermodel.Cell cellBalance = totalRow.createCell(4);
            cellBalance.setCellValue(totalIngresos.subtract(totalEgresos).doubleValue());
            cellBalance.setCellStyle(moneyStyle);

            // Ajustar ancho de columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Exporta movimientos a PDF
     */
    public byte[] exportarMovimientosPDF(
            TipoMovimiento tipo,
            Boolean pagado,
            Long categoriaId,
            LocalDate inicio,
            LocalDate fin) throws IOException {

        Long usuarioId = SecurityUtils.getCurrentUserId();

        List<Movimiento> movimientos = movimientoRepository.filtrarMovimientos(
                tipo, pagado, categoriaId, inicio, fin, usuarioId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Título
            Paragraph title = new Paragraph("Reporte de Movimientos Financieros")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            // Fecha del reporte
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            Paragraph fecha = new Paragraph("Generado el: " + LocalDate.now().format(formatter))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(fecha);

            document.add(new Paragraph("\n"));

            // Tabla de movimientos
            float[] columnWidths = {2, 4, 2, 3, 2, 2, 2};
            Table table = new Table(columnWidths);
            table.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100));

            // Encabezados
            String[] headers = {"Fecha", "Descripción", "Tipo", "Categoría", "Monto", "Pagado", "Vencimiento"};

            for (String header : headers) {
                Cell cell = new Cell()
                        .add(new Paragraph(header).setBold())
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addCell(cell);
            }

            // Datos
            BigDecimal totalIngresos = BigDecimal.ZERO;
            BigDecimal totalEgresos = BigDecimal.ZERO;

            for (Movimiento mov : movimientos) {
                table.addCell(new Cell().add(new Paragraph(mov.getFecha().format(formatter))));
                table.addCell(new Cell().add(new Paragraph(mov.getDescripcion())));
                table.addCell(new Cell().add(new Paragraph(mov.getTipo().toString())));
                table.addCell(new Cell().add(new Paragraph(mov.getCategoria().getNombre())));
                table.addCell(new Cell().add(new Paragraph(String.format("$%.2f", mov.getMonto()))));
                table.addCell(new Cell().add(new Paragraph(mov.isPagado() ? "Sí" : "No")));
                table.addCell(new Cell().add(new Paragraph(
                        mov.getFechaVencimiento() != null ?
                        mov.getFechaVencimiento().format(formatter) : "-")));

                // Acumular totales
                if (mov.getTipo() == TipoMovimiento.INGRESO && mov.isPagado()) {
                    totalIngresos = totalIngresos.add(mov.getMonto());
                } else if (mov.getTipo() == TipoMovimiento.EGRESO && mov.isPagado()) {
                    totalEgresos = totalEgresos.add(mov.getMonto());
                }
            }

            document.add(table);

            // Totales
            document.add(new Paragraph("\n"));
            document.add(new Paragraph(String.format("Total Ingresos: $%.2f", totalIngresos))
                    .setBold());
            document.add(new Paragraph(String.format("Total Egresos: $%.2f", totalEgresos))
                    .setBold());
            document.add(new Paragraph(String.format("Balance: $%.2f",
                    totalIngresos.subtract(totalEgresos)))
                    .setBold()
                    .setFontSize(14));

            document.close();
            return out.toByteArray();
        }
    }
}