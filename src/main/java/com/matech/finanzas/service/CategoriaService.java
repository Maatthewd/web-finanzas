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

        // Verificar que no exista otra categoría con el mismo nombre
        if (categoriaRepository.findByNombreAndUsuario(dto.getNombre(), usuarioId).isPresent()) {
            throw new ValidationException("Ya existe una categoría con ese nombre");
        }

        Categoria categoria = categoriaMapper.toEntity(dto);
        categoria.setUsuario(usuario);
        categoria.setEsPredeterminada(false);

        Categoria saved = categoriaRepository.save(categoria);
        return categoriaMapper.toDTO(saved);
    }

    public List<CategoriaDTO> listar() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return categoriaRepository.findCategoriasDisponibles(usuarioId)
                .stream()
                .map(categoriaMapper::toDTO)
                .toList();
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
     * Crea las categorías predeterminadas para un nuevo usuario
     */
    @Transactional
    public void crearCategoriasPredeterminadasParaUsuario(Usuario usuario) {
        log.info("Creando categorías predeterminadas para usuario: {}", usuario.getEmail());

        // Obtener categorías predeterminadas globales
        List<Categoria> predeterminadas = categoriaRepository.findByEsPredeterminadaTrue();

        if (predeterminadas.isEmpty()) {
            // Si no hay predeterminadas globales, crear las básicas para este usuario
            crearCategoriasBasicas(usuario);
        } else {
            // Copiar las predeterminadas al usuario
            predeterminadas.forEach(predeterminada -> {
                Categoria copia = Categoria.builder()
                        .nombre(predeterminada.getNombre())
                        .tipo(predeterminada.getTipo())
                        .usuario(usuario)
                        .esPredeterminada(false)
                        .build();
                categoriaRepository.save(copia);
            });
        }
    }

    private void crearCategoriasBasicas(Usuario usuario) {
        // Ingresos
        crearCategoria("Salario", TipoCategoria.INGRESO, usuario);
        crearCategoria("Freelance", TipoCategoria.INGRESO, usuario);
        crearCategoria("Inversiones", TipoCategoria.INGRESO, usuario);
        crearCategoria("Bonos", TipoCategoria.INGRESO, usuario);
        crearCategoria("Otros Ingresos", TipoCategoria.INGRESO, usuario);

        // Egresos
        crearCategoria("Alquiler", TipoCategoria.EGRESO, usuario);
        crearCategoria("Servicios", TipoCategoria.EGRESO, usuario);
        crearCategoria("Alimentación", TipoCategoria.EGRESO, usuario);
        crearCategoria("Transporte", TipoCategoria.EGRESO, usuario);
        crearCategoria("Salud", TipoCategoria.EGRESO, usuario);
        crearCategoria("Educación", TipoCategoria.EGRESO, usuario);
        crearCategoria("Entretenimiento", TipoCategoria.EGRESO, usuario);
        crearCategoria("Otros Gastos", TipoCategoria.EGRESO, usuario);

        // Ambos
        crearCategoria("Préstamos", TipoCategoria.AMBOS, usuario);
        crearCategoria("Transferencias", TipoCategoria.AMBOS, usuario);
    }

    private void crearCategoria(String nombre, TipoCategoria tipo, Usuario usuario) {
        Categoria categoria = Categoria.builder()
                .nombre(nombre)
                .tipo(tipo)
                .usuario(usuario)
                .esPredeterminada(false)
                .build();
        categoriaRepository.save(categoria);
    }
}