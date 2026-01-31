package com.matech.finanzas.repository;

import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.TipoCategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByTipo(TipoCategoria tipo);

    @Query("""
        SELECT c FROM Categoria c
        WHERE c.esPredeterminada = true
        OR c.usuario.id = :usuarioId
        ORDER BY c.esPredeterminada DESC, c.orden ASC, c.nombre ASC
    """)
    List<Categoria> findCategoriasDisponibles(@Param("usuarioId") Long usuarioId);

    @Query("""
        SELECT c FROM Categoria c
        WHERE (c.esPredeterminada = true OR c.usuario.id = :usuarioId)
        AND c.categoriaPadre IS NULL
        ORDER BY c.esPredeterminada DESC, c.orden ASC, c.nombre ASC
    """)
    List<Categoria> findCategoriasPadre(@Param("usuarioId") Long usuarioId);

    @Query("""
        SELECT c FROM Categoria c
        LEFT JOIN FETCH c.subcategorias
        WHERE c.id = :id
    """)
    Optional<Categoria> findByIdWithSubcategorias(@Param("id") Long id);

    List<Categoria> findByUsuarioId(Long usuarioId);

    List<Categoria> findByEsPredeterminadaTrue();

    List<Categoria> findByCategoriaPadreId(Long categoriaPadreId);

    @Query("""
        SELECT c FROM Categoria c
        WHERE c.nombre = :nombre
        AND (c.usuario.id = :usuarioId OR c.esPredeterminada = true)
        AND (:categoriaPadreId IS NULL AND c.categoriaPadre IS NULL 
             OR c.categoriaPadre.id = :categoriaPadreId)
    """)
    Optional<Categoria> findByNombreAndUsuarioAndPadre(
        @Param("nombre") String nombre,
        @Param("usuarioId") Long usuarioId,
        @Param("categoriaPadreId") Long categoriaPadreId
    );
}