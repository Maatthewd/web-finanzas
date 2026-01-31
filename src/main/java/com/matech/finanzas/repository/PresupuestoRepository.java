package com.matech.finanzas.repository;

import com.matech.finanzas.entity.Presupuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PresupuestoRepository extends JpaRepository<Presupuesto, Long> {

    List<Presupuesto> findByUsuarioIdAndActivoTrue(Long usuarioId);

    List<Presupuesto> findByUsuarioId(Long usuarioId);

    @Query("""
        SELECT p FROM Presupuesto p
        WHERE p.usuario.id = :usuarioId
        AND p.anio = :anio AND p.mes = :mes AND p.activo = true
    """)
    List<Presupuesto> findByUsuarioAndMesAnio(
        @Param("usuarioId") Long usuarioId,
        @Param("mes") int mes,
        @Param("anio") int anio
    );

    @Query("""
        SELECT p FROM Presupuesto p
        WHERE p.usuario.id = :usuarioId
        AND p.categoria.id = :categoriaId
        AND p.anio = :anio AND p.mes = :mes AND p.activo = true
    """)
    Optional<Presupuesto> findByUsuarioAndCategoriaAndMesAnio(
        @Param("usuarioId") Long usuarioId,
        @Param("categoriaId") Long categoriaId,
        @Param("mes") int mes,
        @Param("anio") int anio
    );
}