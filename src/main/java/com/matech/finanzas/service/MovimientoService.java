package com.matech.finanzas.service;

import com.matech.finanzas.dto.MovimientoDTO;
import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.mapper.MovimientoMapper;
import com.matech.finanzas.repository.MovimientoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final MovimientoMapper movimientoMapper;

    public MovimientoDTO crear(MovimientoDTO dto) {
        Movimiento mov =  movimientoMapper.toEntity(dto);

        // Usuario temporal para testear
        mov.setUsuario(Usuario.builder()
                .id(1L).build());

        return movimientoMapper.toDTO(movimientoRepository.save(mov));
    }

    public List<MovimientoDTO> filtrar(
            TipoMovimiento tipo,
            Boolean pagado,
            Long categoriaId,
            LocalDate inicio,
            LocalDate fin
    ) {
        return movimientoRepository
                .filtrarMovimientos(tipo, pagado, categoriaId, inicio, fin)
                .stream()
                .map(movimientoMapper::toDTO)
                .toList();
    }


    public List<MovimientoDTO> listar() {
        return movimientoRepository.findAll()
                .stream()
                .map(movimientoMapper::toDTO)
                .toList();
    }

    @Transactional
    public void pagarMovimiento(Long id) {
        movimientoRepository.marcarComoPagado(id);
    }

    @Transactional
    public void marcarPendiente(Long id) {
        movimientoRepository.marcarComoPendiente(id);
    }

}
