package com.matech.finanzas.service;

import com.matech.finanzas.dto.CategoriaDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.TipoCategoria;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.mapper.CategoriaMapper;
import com.matech.finanzas.repository.CategoriaRepository;
import com.matech.finanzas.repository.UsuarioRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaMapper categoriaMapper;

    @Transactional
    public CategoriaDTO crear(CategoriaDTO dto) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        // Verificar que no exista otra categoría con el mismo nombre y padre
        if (categoriaRepository.findByNombreAndUsuarioAndPadre(
                dto.getNombre(), usuarioId, dto.getCategoriaPadreId()).isPresent()) {
            throw new ValidationException("Ya existe una categoría con ese nombre en esta jerarquía");
        }

        Categoria categoria = categoriaMapper.toEntity(dto);
        categoria.setUsuario(usuario);
        categoria.setEsPredeterminada(false);

        // Si tiene padre, establecer la relación
        if (dto.getCategoriaPadreId() != null) {
            Categoria padre = categoriaRepository.findById(dto.getCategoriaPadreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría padre", "id", dto.getCategoriaPadreId()));
            categoria.setCategoriaPadre(padre);
        }

        Categoria saved = categoriaRepository.save(categoria);
        return categoriaMapper.toDTO(saved);
    }

    public List<CategoriaDTO> listar() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return categoriaRepository.findCategoriasDisponibles(usuarioId)
                .stream()
                .map(categoriaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<CategoriaDTO> listarCategoriasPadre() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return categoriaRepository.findCategoriasPadre(usuarioId)
                .stream()
                .map(categoriaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public CategoriaDTO obtenerPorId(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", id));

        // Verificar que sea una categoría del usuario o predeterminada
        if (!categoria.isEsPredeterminada() &&
            !categoria.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para ver esta categoría");
        }

        return categoriaMapper.toDTO(categoria);
    }

    public CategoriaDTO obtenerConSubcategorias(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Categoria categoria = categoriaRepository.findByIdWithSubcategorias(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", id));

        // Verificar permisos
        if (!categoria.isEsPredeterminada() &&
            !categoria.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para ver esta categoría");
        }

        return categoriaMapper.toDTOWithSubcategorias(categoria);
    }

    @Transactional
    public CategoriaDTO actualizar(Long id, CategoriaDTO dto) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", id));

        // No se pueden modificar las predeterminadas
        if (existente.isEsPredeterminada()) {
            throw new ValidationException("No se pueden modificar las categorías predeterminadas");
        }

        // Verificar permisos
        if (!existente.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para actualizar esta categoría");
        }

        existente.setNombre(dto.getNombre());
        existente.setTipo(dto.getTipo());
        existente.setIcono(dto.getIcono());
        existente.setColor(dto.getColor());
        existente.setOrden(dto.getOrden());

        Categoria actualizada = categoriaRepository.save(existente);
        return categoriaMapper.toDTO(actualizada);
    }

    @Transactional
    public void eliminar(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", id));

        // No se pueden eliminar las predeterminadas
        if (categoria.isEsPredeterminada()) {
            throw new ValidationException("No se pueden eliminar las categorías predeterminadas");
        }

        // Verificar permisos
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para eliminar esta categoría");
        }

        categoriaRepository.deleteById(id);
    }

    /**
     * Crea las categorías predeterminadas con subcategorías para un nuevo usuario
     */
    @Transactional
    public void crearCategoriasConSubcategoriasPredeterminadas(Usuario usuario) {
        log.info("Creando categorías con subcategorías para usuario: {}", usuario.getEmail());

        // INGRESOS
        Categoria salario = crearCategoriaPadre("Salario", TipoCategoria.INGRESO, usuario, "💰", "#10b981", 1);
        crearSubcategoria("Sueldo Base", salario, usuario);
        crearSubcategoria("Bonos", salario, usuario);
        crearSubcategoria("Horas Extra", salario, usuario);

        Categoria freelance = crearCategoriaPadre("Freelance", TipoCategoria.INGRESO, usuario, "💼", "#3b82f6", 2);
        crearSubcategoria("Proyectos", freelance, usuario);
        crearSubcategoria("Consultoría", freelance, usuario);

        crearCategoriaPadre("Inversiones", TipoCategoria.INGRESO, usuario, "📈", "#8b5cf6", 3);
        crearCategoriaPadre("Otros Ingresos", TipoCategoria.INGRESO, usuario, "💵", "#06b6d4", 4);

        // EGRESOS
        Categoria impuestos = crearCategoriaPadre("Impuestos", TipoCategoria.EGRESO, usuario, "🏛️", "#ef4444", 1);
        crearSubcategoria("Luz", impuestos, usuario);
        crearSubcategoria("Gas", impuestos, usuario);
        crearSubcategoria("Agua", impuestos, usuario);
        crearSubcategoria("Inmobiliaria", impuestos, usuario);
        crearSubcategoria("ABL/ARBA", impuestos, usuario);

        Categoria servicios = crearCategoriaPadre("Servicios", TipoCategoria.EGRESO, usuario, "📡", "#f59e0b", 2);
        crearSubcategoria("Internet", servicios, usuario);
        crearSubcategoria("Cable/Streaming", servicios, usuario);
        crearSubcategoria("Telefonía", servicios, usuario);

        Categoria alimentacion = crearCategoriaPadre("Alimentación", TipoCategoria.EGRESO, usuario, "🛒", "#84cc16", 3);
        crearSubcategoria("Supermercado", alimentacion, usuario);
        crearSubcategoria("Restaurantes", alimentacion, usuario);
        crearSubcategoria("Delivery", alimentacion, usuario);

        Categoria transporte = crearCategoriaPadre("Transporte", TipoCategoria.EGRESO, usuario, "🚗", "#6366f1", 4);
        crearSubcategoria("Combustible", transporte, usuario);
        crearSubcategoria("Mantenimiento", transporte, usuario);
        crearSubcategoria("Peajes/Estacionamiento", transporte, usuario);
        crearSubcategoria("Transporte Público", transporte, usuario);

        Categoria salud = crearCategoriaPadre("Salud", TipoCategoria.EGRESO, usuario, "🏥", "#ec4899", 5);
        crearSubcategoria("Medicamentos", salud, usuario);
        crearSubcategoria("Consultas Médicas", salud, usuario);
        crearSubcategoria("Prepaga/Obra Social", salud, usuario);

        crearCategoriaPadre("Educación", TipoCategoria.EGRESO, usuario, "📚", "#14b8a6", 6);
        crearCategoriaPadre("Entretenimiento", TipoCategoria.EGRESO, usuario, "🎮", "#a855f7", 7);
        crearCategoriaPadre("Ropa", TipoCategoria.EGRESO, usuario, "👔", "#f97316", 8);
        crearCategoriaPadre("Otros Gastos", TipoCategoria.EGRESO, usuario, "💳", "#64748b", 9);

        // AMBOS
        crearCategoriaPadre("Préstamos", TipoCategoria.AMBOS, usuario, "🏦", "#dc2626", 10);
        crearCategoriaPadre("Transferencias", TipoCategoria.AMBOS, usuario, "💸", "#0891b2", 11);

        log.info("Categorías con subcategorías creadas exitosamente para: {}", usuario.getEmail());
    }

    private Categoria crearCategoriaPadre(String nombre, TipoCategoria tipo, Usuario usuario,
                                          String icono, String color, int orden) {
        Categoria categoria = Categoria.builder()
                .nombre(nombre)
                .tipo(tipo)
                .usuario(usuario)
                .esPredeterminada(true)
                .icono(icono)
                .color(color)
                .orden(orden)
                .build();
        return categoriaRepository.save(categoria);
    }

    private void crearSubcategoria(String nombre, Categoria padre, Usuario usuario) {
        Categoria subcategoria = Categoria.builder()
                .nombre(nombre)
                .tipo(padre.getTipo())
                .usuario(usuario)
                .esPredeterminada(true)
                .categoriaPadre(padre)
                .icono(padre.getIcono())
                .color(padre.getColor())
                .build();
        categoriaRepository.save(subcategoria);
    }
}