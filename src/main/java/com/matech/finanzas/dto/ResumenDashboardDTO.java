package com.matech.finanzas.dto;

import com.matech.finanzas.projection.ResumenCategoria;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumenDashboardDTO {
    private BigDecimal ingresos;
    private BigDecimal egresos;
    private BigDecimal balance;
    private BigDecimal deudas;
    private List<ResumenCategoria> categorias;
}