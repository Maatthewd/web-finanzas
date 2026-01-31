package com.matech.finanzas.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresupuestoDTO {

    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100)
    private String nombre;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal montoLimite;

    @NotNull
    @Min(1) @Max(12)
    private Integer mes;

    @NotNull
    @Min(2000)
    private Integer anio;

    private Long categoriaId;

    @Min(1) @Max(100)
    private Integer alertaPorcentaje;

    private boolean activo;

    // Campos calculados
    private BigDecimal montoGastado;
    private BigDecimal montoDisponible;
    private Double porcentajeUtilizado;
}