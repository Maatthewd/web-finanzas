package com.matech.finanzas.repository;

import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.projection.ResumenCategoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    Page<Movimiento> findByUsuarioIdOrderByFechaDesc(Long usuarioId, Pageable pageable);

    Page<Movimiento> findByUsuarioIdAndWorkspaceIdOrderByFechaDesc(
        Long usuarioId, Long workspaceId, Pageable pageable);

    List<Movimiento> findByUsuarioIdAndFechaBetween(Long id, LocalDate inicio, LocalDate fin);

    // Resumenes por usuario

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = 'INGRESO'
                AND m.pagado = true
                AND m.usuario.id = :usuarioId
                AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
            """)
    BigDecimal totalIngresosPagados(
        @Param("usuarioId") Long usuarioId,
        @Param("workspaceId") Long workspaceId);

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = 'EGRESO'
                AND m.pagado = true
                AND m.usuario.id = :usuarioId
                AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
            """)
    BigDecimal totalEgresosPagados(
        @Param("usuarioId") Long usuarioId,
        @Param("workspaceId") Long workspaceId);

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = 'EGRESO'
                AND m.pagado = false
                AND m.usuario.id = :usuarioId
                AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
            """)
    BigDecimal totalDeudasPendientes(
        @Param("usuarioId") Long usuarioId,
        @Param("workspaceId") Long workspaceId);

    @Query("""
                SELECT c.nombre AS categoria, COALESCE(SUM(m.monto), 0) AS total
                FROM Movimiento m
                JOIN m.categoria c
                WHERE m.pagado = true
                AND m.usuario.id = :usuarioId
                AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
                GROUP BY c.nombre
            """)
    List<ResumenCategoria> totalPorCategoria(
        @Param("usuarioId") Long usuarioId,
        @Param("workspaceId") Long workspaceId);

    @Query("""
                SELECT COALESCE(SUM(m.monto), 0)
                FROM Movimiento m
                WHERE m.tipo = :tipo
                AND m.pagado = true
                AND m.fecha BETWEEN :inicio AND :fin
                AND m.usuario.id = :usuarioId
                AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
            """)
    BigDecimal totalPorFecha(
            @Param("tipo") TipoMovimiento tipo,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin,
            @Param("usuarioId") Long usuarioId,
            @Param("workspaceId") Long workspaceId
    );

    // Filtros con usuario y workspace

    @Query("""
        SELECT m FROM Movimiento m
        WHERE (:tipo IS NULL OR m.tipo = :tipo)
        AND (:pagado IS NULL OR m.pagado = :pagado)
        AND (:categoriaId IS NULL OR m.categoria.id = :categoriaId)
        AND (:inicio IS NULL OR m.fecha >= :inicio)
        AND (:fin IS NULL OR m.fecha <= :fin)
        AND m.usuario.id = :usuarioId
        AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
        ORDER BY m.fecha DESC, m.id DESC
    """)
    List<Movimiento> filtrarMovimientos(
            @Param("tipo") TipoMovimiento tipo,
            @Param("pagado") Boolean pagado,
            @Param("categoriaId") Long categoriaId,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin,
            @Param("usuarioId") Long usuarioId,
            @Param("workspaceId") Long workspaceId
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

    // Resúmenes por día/mes/año con workspace

    @Query("""
        SELECT COALESCE(SUM(m.monto), 0)
        FROM Movimiento m
        WHERE m.tipo = :tipo
        AND m.pagado = true
        AND YEAR(m.fecha) = :anio
        AND MONTH(m.fecha) = :mes
        AND DAY(m.fecha) = :dia
        AND m.usuario.id = :usuarioId
        AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
    """)
    BigDecimal totalPorDia(
            @Param("tipo") TipoMovimiento tipo,
            @Param("anio") int anio,
            @Param("mes") int mes,
            @Param("dia") int dia,
            @Param("usuarioId") Long usuarioId,
            @Param("workspaceId") Long workspaceId
    );

    @Query("""
        SELECT COALESCE(SUM(m.monto), 0)
        FROM Movimiento m
        WHERE m.tipo = :tipo
        AND m.pagado = true
        AND YEAR(m.fecha) = :anio
        AND MONTH(m.fecha) = :mes
        AND m.usuario.id = :usuarioId
        AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
    """)
    BigDecimal totalPorMes(
            @Param("tipo") TipoMovimiento tipo,
            @Param("anio") int anio,
            @Param("mes") int mes,
            @Param("usuarioId") Long usuarioId,
            @Param("workspaceId") Long workspaceId
    );

    @Query("""
        SELECT COALESCE(SUM(m.monto), 0)
        FROM Movimiento m
        WHERE m.tipo = :tipo
        AND m.pagado = true
        AND YEAR(m.fecha) = :anio
        AND m.usuario.id = :usuarioId
        AND (:workspaceId IS NULL OR m.workspace.id = :workspaceId)
    """)
    BigDecimal totalPorAnio(
            @Param("tipo") TipoMovimiento tipo,
            @Param("anio") int anio,
            @Param("usuarioId") Long usuarioId,
            @Param("workspaceId") Long workspaceId
    );
}