
export type CategorySeed = {
    name: string
    type: 'income' | 'expense'
    subcategories: {
        name: string
        is_tax_deductible: boolean
        note?: string
    }[]
}

export const DEFAULT_CATEGORIES: CategorySeed[] = [
    {
        name: "Alimentación",
        type: "expense",
        subcategories: [
            { name: "Mercado y Abarrotes", is_tax_deductible: false, note: "Compras de casa" },
            { name: "Restaurantes y Salidas", is_tax_deductible: false, note: "Fines de semana" },
            { name: "Domicilios (Apps)", is_tax_deductible: false, note: "Rappi, UberEats" },
            { name: "Cafés y Snacks", is_tax_deductible: false, note: "Gastos hormiga diarios" },
        ]
    },
    {
        name: "Belleza y Cuidado",
        type: "expense",
        subcategories: [
            { name: "Barbería / Peluquería", is_tax_deductible: false },
            { name: "Cuidado de la Piel (Skincare)", is_tax_deductible: false, note: "Cremas, tratamientos" },
            { name: "Accesorios y Aseo Personal", is_tax_deductible: false },
        ]
    },
    {
        name: "Educación",
        type: "expense",
        subcategories: [
            { name: "Cursos y Talleres", is_tax_deductible: false, note: "Formación continua" },
            { name: "Libros y Material", is_tax_deductible: false },
            { name: "Educación Sobrino/Dependientes", is_tax_deductible: true, note: "Seguro educativo o pensión" },
        ]
    },
    {
        name: "Entretenimiento",
        type: "expense",
        subcategories: [
            { name: "Cine y Eventos", is_tax_deductible: false },
            { name: "Hobbies y Pasatiempos", is_tax_deductible: false },
            { name: "Juegos y Loterías", is_tax_deductible: false },
        ]
    },
    {
        name: "Familia",
        type: "expense",
        subcategories: [
            { name: "Ayuda Familiar / Mesada", is_tax_deductible: false, note: "Apoyo a padres/familiares" },
        ]
    },
    {
        name: "Financiero",
        type: "expense",
        subcategories: [
            { name: "4x1000", is_tax_deductible: true, note: "50% deducible" },
            { name: "Comisiones Bancarias", is_tax_deductible: true, note: "Cuotas de manejo" },
            { name: "Intereses Crédito Hipotecario", is_tax_deductible: true, note: "Clave para Renta" },
            { name: "Intereses Otros Créditos", is_tax_deductible: false, note: "Tarjetas de crédito" },
            { name: "Contador / Asesoría", is_tax_deductible: false, note: "Declaración de renta" },
        ]
    },
    {
        name: "Hogar",
        type: "expense",
        subcategories: [
            { name: "Administración (Copropiedad)", is_tax_deductible: false, note: "Apto Medellín / Santa Marta" },
            { name: "Arriendo", is_tax_deductible: false, note: "Si aplica" },
            { name: "Empleada / Aseo", is_tax_deductible: false, note: "Personal de servicio" },
            { name: "Mantenimiento y Reparaciones", is_tax_deductible: false, note: "Plomería, eléctrica" },
            { name: "Mobiliario y Decoración", is_tax_deductible: false, note: "Muebles nuevos" },
            { name: "Servicios: Agua", is_tax_deductible: false },
            { name: "Servicios: Energía", is_tax_deductible: false },
            { name: "Servicios: Gas", is_tax_deductible: false },
            { name: "Servicios: Internet/TV", is_tax_deductible: false },
        ]
    },
    {
        name: "Impuestos",
        type: "expense",
        subcategories: [
            { name: "Impuesto Predial", is_tax_deductible: true, note: "Propiedades" },
            { name: "Impuesto Renta", is_tax_deductible: false, note: "Pago anual a la DIAN" },
        ]
    },
    {
        name: "Ingresos",
        type: "income",
        subcategories: [
            { name: "Arriendos Recibidos", is_tax_deductible: false, note: "Reserva del Mar" }, // Ingreso Gravable
            { name: "Dividendos / Utilidades", is_tax_deductible: false, note: "Tekus" }, // Ingreso Gravable
            { name: "Ganancia Ocasional", is_tax_deductible: false, note: "Venta activos > 2 años" },
            { name: "Honorarios / Salario", is_tax_deductible: false }, // Ingreso Gravable
            { name: "Préstamos (Desembolsos)", is_tax_deductible: false, note: "Dinero del banco (Deuda)" },
            { name: "Reembolsos", is_tax_deductible: false, note: "Devoluciones de dinero" },
            { name: "Rendimientos Financieros", is_tax_deductible: false, note: "Intereses de cuentas" }, // Ingreso Gravable
        ]
    },
    {
        name: "Inversiones",
        type: "expense",
        subcategories: [
            { name: "Aportes Finca Raíz", is_tax_deductible: false, note: "Cuotas Casa Palmas" },
            { name: "Fondos / Fiducia", is_tax_deductible: false, note: "Tyba, Trii, etc." },
            { name: "Nuevos Negocios", is_tax_deductible: false, note: "Capital semilla" },
        ]
    },
    {
        name: "Mascotas",
        type: "expense",
        subcategories: [
            { name: "Alimento Mascotas", is_tax_deductible: false },
            { name: "Veterinaria y Medicamentos", is_tax_deductible: false },
        ]
    },
    {
        name: "Proyectos",
        type: "expense",
        subcategories: [
            { name: "Insumos y Materiales", is_tax_deductible: false, note: "Específico de proyectos" },
            { name: "Mano de Obra", is_tax_deductible: false, note: "Pagos a terceros" },
            { name: "Marketing y Publicidad", is_tax_deductible: false, note: "Pauta digital" },
        ]
    },
    {
        name: "Regalos",
        type: "expense",
        subcategories: [
            { name: "Cumpleaños y Fechas", is_tax_deductible: false, note: "Navidad, aniversarios" },
            { name: "Donaciones", is_tax_deductible: true, note: "Entidades certificadas" },
        ]
    },
    {
        name: "Ropa",
        type: "expense",
        subcategories: [
            { name: "Ropa Deportiva", is_tax_deductible: false },
            { name: "Ropa Trabajo / Formal", is_tax_deductible: false },
        ]
    },
    {
        name: "Salud",
        type: "expense",
        subcategories: [
            { name: "Citas Médicas / Copagos", is_tax_deductible: true },
            { name: "Farmacia y Medicamentos", is_tax_deductible: false },
            { name: "Gimnasio / Deportes", is_tax_deductible: false },
            { name: "Medicina Prepagada", is_tax_deductible: true, note: "Sura, Colsanitas" },
        ]
    },
    {
        name: "Tecnología",
        type: "expense",
        subcategories: [
            { name: "Hardware (Equipos)", is_tax_deductible: false, note: "PC, Celular, Cámaras" },
            { name: "Software y Suscripciones", is_tax_deductible: false, note: "iCloud, OpenAI, Adobe" },
        ]
    },
    {
        name: "Transporte",
        type: "expense",
        subcategories: [
            { name: "Carga Eléctrica", is_tax_deductible: false, note: "Tesla / Híbridos" },
            { name: "Gasolina", is_tax_deductible: false, note: "Motos / Cupra" },
            { name: "Impuesto Vehicular", is_tax_deductible: true, note: "Si es activo productor" },
            { name: "Lavado y Estética", is_tax_deductible: false, note: "Detailing" },
            { name: "Mantenimiento Mecánico", is_tax_deductible: false, note: "Revisiones" },
            { name: "Parqueaderos", is_tax_deductible: false },
            { name: "Peajes", is_tax_deductible: false, note: "Viajes" },
            { name: "Seguros (Todo Riesgo)", is_tax_deductible: false, note: "Póliza Voluntaria" },
            { name: "SOAT", is_tax_deductible: false, note: "Obligatorio" },
            { name: "Transporte Público / Apps", is_tax_deductible: false, note: "Uber, Taxi" },
        ]
    },
    {
        name: "Viajes",
        type: "expense",
        subcategories: [
            { name: "Alojamiento / Hoteles", is_tax_deductible: false },
            { name: "Tiquetes Aéreos", is_tax_deductible: false },
            { name: "Viáticos / Gastos Viaje", is_tax_deductible: false, note: "Comidas en viaje" },
        ]
    }
]
