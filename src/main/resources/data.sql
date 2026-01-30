-- Categorías predeterminadas

-- Categorías de INGRESOS
INSERT INTO categorias (nombre, tipo) VALUES ('Salario', 'INGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Freelance', 'INGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Inversiones', 'INGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Bonos', 'INGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Ventas', 'INGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Otros Ingresos', 'INGRESO') ON CONFLICT DO NOTHING;

-- Categorías de EGRESOS
INSERT INTO categorias (nombre, tipo) VALUES ('Alquiler', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Servicios', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Alimentación', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Transporte', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Salud', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Educación', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Entretenimiento', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Ropa', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Tecnología', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Impuestos', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Ahorro', 'EGRESO') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Otros Gastos', 'EGRESO') ON CONFLICT DO NOTHING;

-- Categorías que aplican a AMBOS
INSERT INTO categorias (nombre, tipo) VALUES ('Préstamos', 'AMBOS') ON CONFLICT DO NOTHING;
INSERT INTO categorias (nombre, tipo) VALUES ('Transferencias', 'AMBOS') ON CONFLICT DO NOTHING;
