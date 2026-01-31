package com.matech.finanzas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "presupuestos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Presupuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montoLimite;

    @Column(nullable = false)
    private int mes; // 1-12

    @Column(nullable = false)
    private int anio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria; // null = presupuesto general

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "alerta_porcentaje")
    @Builder.Default
    private Integer alertaPorcentaje = 80;

    @Column(name = "activo")
    @Builder.Default
    private boolean activo = true;
}