package com.matech.finanzas.dto;

import com.matech.finanzas.entity.TipoMovimiento;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class MovimientoDTO {
    private Long id;
    
    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;
    
    @NotNull(message = "El tipo es obligatorio")
    private TipoMovimiento tipo;
    
    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;
    
    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;
    
    private LocalDate fechaVencimiento;
    
    private boolean pagado;
    
    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;

    @NotNull(message = "El workspace es obligatorio")
    private Long workspaceId;

    // Campos adicionales para visualización
    private String categoriaNombre;
    private String workspaceNombre;
}