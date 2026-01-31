package com.matech.finanzas.controller;

import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Exportación", description = "Exportar movimientos a Excel y PDF")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/excel")
    @Operation(summary = "Exportar movimientos a Excel")
    public ResponseEntity<byte[]> exportarExcel(
            @RequestParam(required = false) TipoMovimiento tipo,
            @RequestParam(required = false) Boolean pagado,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin
    ) throws IOException {
        byte[] excelBytes = exportService.exportarMovimientosExcel(tipo, pagado, categoriaId, inicio, fin);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "movimientos_" + LocalDate.now() + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    @GetMapping("/pdf")
    @Operation(summary = "Exportar movimientos a PDF")
    public ResponseEntity<byte[]> exportarPDF(
            @RequestParam(required = false) TipoMovimiento tipo,
            @RequestParam(required = false) Boolean pagado,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin
    ) throws IOException {
        byte[] pdfBytes = exportService.exportarMovimientosPDF(tipo, pagado, categoriaId, inicio, fin);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "movimientos_" + LocalDate.now() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}