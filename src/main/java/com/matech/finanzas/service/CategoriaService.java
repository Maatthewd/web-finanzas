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
     * Crea las categorías predeterminadas GLOBALES (sin usuario asignado)
     * Solo se ejecuta UNA VEZ en toda la aplicación
     */
    @Transactional
    public void crearCategoriasPredeterminadasGlobales() {
        // Verificar si ya existen categorías predeterminadas globales
        List<Categoria> existentes = categoriaRepository.findByEsPredeterminadaTrue();
        if (!existentes.isEmpty()) {
            log.info("Las categorías predeterminadas globales ya existen, omitiendo creación");
            return;
        }

        log.info("Creando categorías predeterminadas globales (una sola vez)...");

        // INGRESOS
        Categoria salario = crearCategoriaPadreGlobal("Salario", TipoCategoria.INGRESO, "💰", "#10b981", 1);
        crearSubcategoriaGlobal("Sueldo Base", salario, TipoCategoria.INGRESO);
        crearSubcategoriaGlobal("Bonos", salario, TipoCategoria.INGRESO);
        crearSubcategoriaGlobal("Horas Extra", salario, TipoCategoria.INGRESO);

        Categoria freelance = crearCategoriaPadreGlobal("Freelance", TipoCategoria.INGRESO, "💼", "#3b82f6", 2);
        crearSubcategoriaGlobal("Proyectos", freelance, TipoCategoria.INGRESO);
        crearSubcategoriaGlobal("Consultoría", freelance, TipoCategoria.INGRESO);

        crearCategoriaPadreGlobal("Inversiones", TipoCategoria.INGRESO, "📈", "#8b5cf6", 3);
        crearCategoriaPadreGlobal("Otros Ingresos", TipoCategoria.INGRESO, "💵", "#06b6d4", 4);

        // EGRESOS
        Categoria impuestos = crearCategoriaPadreGlobal("Impuestos", TipoCategoria.EGRESO, "🏛️", "#ef4444", 1);
        crearSubcategoriaGlobal("Luz", impuestos, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Gas", impuestos, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Agua", impuestos, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Inmobiliaria", impuestos, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("ABL/ARBA", impuestos, TipoCategoria.EGRESO);

        Categoria servicios = crearCategoriaPadreGlobal("Servicios", TipoCategoria.EGRESO, "📡", "#f59e0b", 2);
        crearSubcategoriaGlobal("Internet", servicios, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Cable/Streaming", servicios, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Telefonía", servicios, TipoCategoria.EGRESO);

        Categoria alimentacion = crearCategoriaPadreGlobal("Alimentación", TipoCategoria.EGRESO, "🛒", "#84cc16", 3);
        crearSubcategoriaGlobal("Supermercado", alimentacion, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Restaurantes", alimentacion, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Delivery", alimentacion, TipoCategoria.EGRESO);

        Categoria transporte = crearCategoriaPadreGlobal("Transporte", TipoCategoria.EGRESO, "🚗", "#6366f1", 4);
        crearSubcategoriaGlobal("Combustible", transporte, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Mantenimiento", transporte, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Peajes/Estacionamiento", transporte, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Transporte Público", transporte, TipoCategoria.EGRESO);

        Categoria salud = crearCategoriaPadreGlobal("Salud", TipoCategoria.EGRESO, "🏥", "#ec4899", 5);
        crearSubcategoriaGlobal("Medicamentos", salud, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Consultas Médicas", salud, TipoCategoria.EGRESO);
        crearSubcategoriaGlobal("Prepaga/Obra Social", salud, TipoCategoria.EGRESO);

        crearCategoriaPadreGlobal("Educación", TipoCategoria.EGRESO, "📚", "#14b8a6", 6);
        crearCategoriaPadreGlobal("Entretenimiento", TipoCategoria.EGRESO, "🎮", "#a855f7", 7);
        crearCategoriaPadreGlobal("Ropa", TipoCategoria.EGRESO, "👔", "#f97316", 8);
        crearCategoriaPadreGlobal("Otros Gastos", TipoCategoria.EGRESO, "💳", "#64748b", 9);

        // AMBOS
        crearCategoriaPadreGlobal("Préstamos", TipoCategoria.AMBOS, "🏦", "#dc2626", 10);
        crearCategoriaPadreGlobal("Transferencias", TipoCategoria.AMBOS, "💸", "#0891b2", 11);

        log.info("Categorías predeterminadas globales creadas exitosamente");
    }

    /**
     * Crea una categoría padre GLOBAL (sin usuario - null)
     */
    private Categoria crearCategoriaPadreGlobal(String nombre, TipoCategoria tipo,
                                                String icono, String color, int orden) {
        Categoria categoria = Categoria.builder()
                .nombre(nombre)
                .tipo(tipo)
                .usuario(null)  // SIN USUARIO - GLOBAL
                .esPredeterminada(true)
                .icono(icono)
                .color(color)
                .orden(orden)
                .build();
        return categoriaRepository.save(categoria);
    }

    /**
     * Crea una subcategoría GLOBAL (sin usuario - null)
     */
    private void crearSubcategoriaGlobal(String nombre, Categoria padre, TipoCategoria tipo) {
        Categoria subcategoria = Categoria.builder()
                .nombre(nombre)
                .tipo(tipo)
                .usuario(null)  // SIN USUARIO - GLOBAL
                .esPredeterminada(true)
                .categoriaPadre(padre)
                .icono(padre.getIcono())
                .color(padre.getColor())
                .build();
        categoriaRepository.save(subcategoria);
    }
}