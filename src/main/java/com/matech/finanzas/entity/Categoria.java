package com.matech.finanzas.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categorias")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCategoria tipo;

    // IMPORTANTE: usuario ahora puede ser NULL para categorías globales
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = true)  // NULLABLE = TRUE
    private Usuario usuario;

    @Column(name = "es_predeterminada", nullable = false)
    @Builder.Default
    private boolean esPredeterminada = false;

    // Relación padre-hijo para subcategorías
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_padre_id")
    private Categoria categoriaPadre;

    @OneToMany(mappedBy = "categoriaPadre", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Categoria> subcategorias = new ArrayList<>();

    @Column(name = "icono")
    private String icono;

    @Column(name = "color")
    private String color;

    @Column(name = "orden")
    @Builder.Default
    private Integer orden = 0;

    // Helper methods
    public boolean esCategoriaPadre() {
        return categoriaPadre == null;
    }

    public void agregarSubcategoria(Categoria subcategoria) {
        subcategorias.add(subcategoria);
        subcategoria.setCategoriaPadre(this);
    }

    public void removerSubcategoria(Categoria subcategoria) {
        subcategorias.remove(subcategoria);
        subcategoria.setCategoriaPadre(null);
    }

    /**
     * Verifica si esta categoría es global (compartida entre todos los usuarios)
     */
    public boolean esGlobal() {
        return esPredeterminada && usuario == null;
    }
}