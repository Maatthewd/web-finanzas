package com.matech.finanzas.dto;

import com.matech.finanzas.entity.TipoCategoria;
import com.matech.finanzas.entity.TipoMovimiento;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class MovimientoDTO {
    private Long id;
    private String descripcion;
    private TipoMovimiento tipo;
    private BigDecimal monto;
    private LocalDate fecha;
    private LocalDate fechaVencimiento;
    private boolean pagado;
    private Long categoriaId;
}
