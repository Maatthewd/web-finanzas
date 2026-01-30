package com.matech.finanzas.controller;

import com.matech.finanzas.dto.MovimientoDTO;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.service.MovimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;

    @PostMapping
    public MovimientoDTO crear(@RequestBody MovimientoDTO dto) {
        return movimientoService.crear(dto);
    }


    @GetMapping("/filtrar")
    public List<MovimientoDTO> filtrar(
            @RequestParam(required = false) TipoMovimiento tipo,
            @RequestParam(required = false) Boolean pagado,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) LocalDate inicio,
            @RequestParam(required = false) LocalDate fin
    ) {
        return movimientoService.filtrar(tipo, pagado, categoriaId, inicio, fin);
    }

    @GetMapping
    public List<MovimientoDTO> listar() {
        return movimientoService.listar();
    }

    @PatchMapping("/{id}/pagar")
    public void pagar(@PathVariable Long id) {
        movimientoService.pagarMovimiento(id);
    }

    @PatchMapping("/{id}/pendiente")

    public void marcarPendiente(@PathVariable Long id) {
        movimientoService.marcarPendiente(id);
    }

}

