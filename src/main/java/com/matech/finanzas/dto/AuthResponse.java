package com.matech.finanzas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private Long id;
    private String nombre;
    private String email;
    private String rol;
    
    public AuthResponse(String token) {
        this.token = token;
        this.type = "Bearer";
    }
}
