package com.matech.finanzas.repository;

import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.TipoCategoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByTipo(TipoCategoria tipo);
}
