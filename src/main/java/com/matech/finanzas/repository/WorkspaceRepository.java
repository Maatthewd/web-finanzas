package com.matech.finanzas.repository;

import com.matech.finanzas.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    List<Workspace> findByUsuarioIdAndActivoTrue(Long usuarioId);

    List<Workspace> findByUsuarioIdOrderByEsPrincipalDescNombreAsc(Long usuarioId);

    Optional<Workspace> findByUsuarioIdAndEsPrincipalTrue(Long usuarioId);

    @Query("""
        SELECT w FROM Workspace w
        WHERE w.usuario.id = :usuarioId
        AND w.nombre = :nombre
    """)
    Optional<Workspace> findByUsuarioIdAndNombre(
        @Param("usuarioId") Long usuarioId,
        @Param("nombre") String nombre
    );

    long countByUsuarioId(Long usuarioId);
}