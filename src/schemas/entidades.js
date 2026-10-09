import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email('Correo electrónico inválido')),
  password: z.string().trim().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  email: z.string().trim().toLowerCase().pipe(z.string().email('Correo electrónico inválido')),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const prestadorPaso1Schema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  category: z.string().trim().min(1, 'Seleccione una categoría'),
  rif: z.string().trim().min(1, 'El RIF es obligatorio').regex(/^[JjVvEe]-?\d{6,9}-?\d$/, 'Formato inválido (ej: J-12345678-9)'),
  email: z.string().trim().toLowerCase().pipe(z.string().email('Correo inválido')).optional().or(z.literal('')),
});

export const prestadorPaso2Schema = z.object({
  regionId: z.string().trim().min(1, 'Seleccione una región'),
  estadoId: z.string().trim().min(1, 'Seleccione un estado'),
  municipioId: z.string().trim().min(1, 'Seleccione un municipio'),
  address: z.string().trim().min(1, 'La dirección es obligatoria').max(500),
  branches: z.coerce.number().int().min(1, 'Debe tener al menos 1 sede'),
});

export const destinoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(200),
  municipioId: z.coerce.number().int().min(1, 'Municipio inválido'),
  tipoTurismoId: z.coerce.number().int().min(1, 'Tipo de turismo inválido').optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
});

export const eventoSchema = z.object({
  nombre: z.string().trim().min(1, 'El título es requerido').max(200),
  fechaInicio: z.string().trim().min(1, 'La fecha es requerida'),
  tipoEventoId: z.coerce.number().int().min(1).optional(),
  destinoId: z.coerce.number().int().min(1).optional(),
});

export function zodErrors(result) {
  const errs = {};
  if (result.success) return errs;
  result.error.issues.forEach((i) => {
    const key = String(i.path[0] ?? 'form');
    if (!errs[key]) errs[key] = i.message;
  });
  return errs;
}
