package com.matech.finanzas.repository;

import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.projection.ResumenCategoria;
import com.matech.finanzas.entity.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    List<Movimiento> findByUsuarioId(Long id);

    List<Movimiento> findByUsuarioIdAndFechaBetween(Long id, LocalDate inicio, LocalDate fin);

    // Resumenes

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = 'INGRESO'
                AND m.pagado = true
            """)
    BigDecimal totalIngresosPagados();

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = 'EGRESO'
                AND m.pagado = true
            """)
    BigDecimal totalEgresosPagados();

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = 'EGRESO'
                AND m.pagado = false
            """)
    BigDecimal totalDeudasPendientes();

    @Query("""
                SELECT c.nombre AS categoria, COALESCE(SUM(m.monto), 0) AS total
                FROM Movimiento m
                JOIN m.categoria c
                WHERE m.pagado = true
                GROUP BY c.nombre
            """)
    List<ResumenCategoria> totalPorCategoria();

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = :tipo
                AND m.pagado = true
                AND m.fecha BETWEEN :inicio AND :fin
            """)
    BigDecimal totalPorFecha(
            @Param("tipo") TipoMovimiento tipo,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin
    );

    // Filtros

    // AND m.usuario.id = :usuarioId

    @Query("""
        SELECT m FROM Movimiento m
        WHERE (:tipo IS NULL OR m.tipo = :tipo)
        AND (:pagado IS NULL OR m.pagado = :pagado)
        AND (:categoriaId IS NULL OR m.categoria.id = :categoriaId)
        AND (:inicio IS NULL OR m.fecha >= :inicio)
        AND (:fin IS NULL OR m.fecha <= :fin)
        ORDER BY m.fecha DESC
    """)
    List<Movimiento> filtrarMovimientos(
            @Param("tipo") TipoMovimiento tipo,
            @Param("pagado") Boolean pagado,
            @Param("categoriaId") Long categoriaId,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin
            // @Param("usuarioId") Long usuarioId
    );

    // Cambiar estados

    @Modifying
    @Query("""
        UPDATE Movimiento m
        SET m.pagado = true
        WHERE m.id = :id
    """)
    void marcarComoPagado(@Param("id") Long id);

    @Modifying
    @Query("""
        UPDATE Movimiento m
        SET m.pagado = false
        WHERE m.id = :id
    """)
    void marcarComoPendiente(@Param("id") Long id);
}
