export type JaverianaBuildingInfo = {
  buildingNumber?: string;
  faculty?: string;
  use: string;
  description: string;
  highlights?: string[];
};

export const JAVERIANA_DESCRIPTIONS: Record<string, JaverianaBuildingInfo> = {
  "way/24368574": {
    buildingNumber: "21",
    faculty: "Administración Central y Rectoría",
    use: "Sede de Rectoría y Gobierno Universitario",
    description:
      "Edificio patrimonial e insignia del campus universitario. Alberga el despacho del Rector, la Vicerrectoría Académica, la Secretaría General, el Salón San Ignacio y las principales salas de consejo universitario.",
    highlights: ["Despacho del Rector", "Sala San Ignacio", "Consejo Directivo Universitario"],
  },
  "way/40156024": {
    use: "Biblioteca General Alfonso Borrero Cabal S.J.",
    faculty: "Sistema de Bibliotecas PUJ",
    description:
      "Corazón intelectual del campus con más de 400.000 volúmenes físicos, salas de investigación, salas de estudio silencioso, salas colaborativas 24 horas y el Archivo Histórico Javeriano Juan Manuel Pacheco S.J.",
    highlights: ["Salas 24 horas", "Archivo Histórico Javeriano", "Colecciones Especiales"],
  },
  "way/40156023": {
    buildingNumber: "11",
    faculty: "Facultad de Ingeniería",
    use: "Decanatura y Aulas de Ingeniería",
    description:
      "Edificio José Gabriel Maldonado S.J. - Oficinas. Concentra la Decanatura de Ingeniería, las direcciones de carrera (Sistemas, Civil, Industrial, Electrónica, Mecánica, Bioingeniería), salas de software especializado y aulas magnas.",
    highlights: ["Decanatura de Ingeniería", "Salas de Computación Avanzada", "Auditorio de Ingeniería"],
  },
  "way/68790368": {
    buildingNumber: "12",
    faculty: "Facultad de Ingeniería",
    use: "Complejo de Laboratorios de Ingeniería",
    description:
      "Edificio José Gabriel Maldonado S.J. - Laboratorios. Equipado con plantas piloto, túnel de viento, banco de ensayos de materiales, laboratorios de robótica, hidráulica, suelos, electrónica y manufactura avanzada.",
    highlights: ["Túnel de Viento", "Laboratorio de Robótica y Automatización", "Ensayos de Estructuras"],
  },
  "way/24368576": {
    buildingNumber: "3",
    faculty: "Facultad de Ciencias Jurídicas",
    use: "Derecho y Consultorio Jurídico",
    description:
      "Edificio Gabriel Giraldo S.J. Sede de una de las facultades de Derecho más prestigiosas del país. Cuenta con salas de audiencias y juicios simulados, el Consultorio Jurídico de atención comunitaria y centros de investigación sociojurídica.",
    highlights: ["Salas de Audiencias de Juicio Oral", "Consultorio Jurídico Gratuito", "Centro de Arbitraje"],
  },
  "way/409391091": {
    buildingNumber: "20",
    faculty: "Facultad de Ciencias Económicas y Administrativas (FCEA)",
    use: "Aulas de Negocios y Economía",
    description:
      "Edificio Jorge Hoyos Vásquez S.J. Sede de Administración de Empresas, Economía y Contaduría. Integra el Laboratorio Financiero con terminales Bloomberg, aulas tipo anfiteatro para métodos del caso y auditorios para conferencias ejecutivas.",
    highlights: ["Laboratorio Financiero y Salas Bloomberg", "Centro de Emprendimiento", "Aulas tipo Harvard"],
  },
  "way/68790088": {
    buildingNumber: "8",
    faculty: "Vicerrectoría Académica / Multi-facultad",
    use: "Centro de Alta Tecnología en Artes, Comunicación y Medios",
    description:
      "Centro Ático es uno de los complejos tecnológicos universitarios más modernos de América Latina. Posee estudios de televisión con escenografía virtual, salas de postproducción de audio y video con certificación Dolby Atmos, captura de movimiento (Mocap) y laboratorios de videojuegos.",
    highlights: ["Estudios de Televisión 4K", "Salas de Mezcla Dolby Atmos", "Set de Captura de Movimiento (MoCap)"],
  },
  "way/24368575": {
    use: "Hospital Universitario San Ignacio (HUSI)",
    faculty: "Facultad de Medicina",
    description:
      "Hospital universitario de cuarto nivel y alta complejidad médica fundado en 1953. Es el principal centro docente-asistencial del país en investigación clínica, trasplantes, oncología, neurociencias y formación de médicos especialistas.",
    highlights: ["Centro de Referencia Nacional en Salud", "Unidad de Cuidados Intensivos", "Quirófanos de Alta Tecnología"],
  },
  "way/1059330745": {
    buildingNumber: "24",
    faculty: "Facultad de Medicina",
    use: "Sede Académica de Medicina",
    description:
      "Edificio San Ignacio. Concentra la Decanatura de Medicina, auditorios clínicos, departamentos de ciencias morfológicas y salas de discusión de casos para pregrado e internado médico.",
    highlights: ["Decanatura de Medicina", "Salas de Casos Clínicos"],
  },
  "way/48255510": {
    buildingNumber: "25",
    faculty: "Facultad de Odontología",
    use: "Clínicas Odontológicas y Aulas Especializadas",
    description:
      "Sede integral de la Facultad de Odontología, con módulos de atención clínica para pacientes, simuladores odontológicos con realidad háptica y laboratorios de materiales dentales.",
    highlights: ["Clínicas Odontológicas Universitarias", "Laboratorio de Simulación Háptica"],
  },
  "way/70789525": {
    buildingNumber: "4",
    faculty: "Facultad de Artes",
    use: "Música, Artes Visuales y Escénicas",
    description:
      "Edificio Geraldo Arango S.J. Cuenta con auditorio acústico para conciertos, salas de ensayo insonorizadas, estudios de piano y orquesta, talleres de pintura, escultura y grabado.",
    highlights: ["Auditorio de Música con Acústica Especial", "Salas de Ensayo Insonorizadas", "Talleres de Artes Visuales"],
  },
  "way/1215463671": {
    buildingNumber: "42",
    faculty: "Facultad de Artes",
    use: "Artes Escénicas y Aulas de Práctica",
    description:
      "Ala Oriental de Artes, dotada de cajas negras para dramaturgia y danza contemporánea, vestuarios y talleres de diseño escenográfico.",
    highlights: ["Salas de Danza y Cajas Negras", "Talleres Escenográficos"],
  },
  "way/409391092": {
    buildingNumber: "15",
    faculty: "Facultad de Arquitectura y Diseño",
    use: "Arquitectura Leopoldo Rother",
    description:
      "Bautizado en honor al gran arquitecto y urbanista Leopoldo Rother. Espacio abierto de talleres de proyección arquitectónica, crítica de proyectos, laboratorios de modelado paramétrico y urbanismo.",
    highlights: ["Talleres de Proyección Continua", "Salas de Crítica Arquitectónica"],
  },
  "way/409391094": {
    buildingNumber: "16",
    faculty: "Facultad de Arquitectura y Diseño",
    use: "Edificio Carlos Arbeláez Camacho",
    description:
      "Alberga talleres de diseño, laboratorios de ergonomía, centro de documentación en historia de la arquitectura colombiana e investigación patrimonial.",
    highlights: ["Centro de Documentación de Arquitectura", "Laboratorio de Ergonomía"],
  },
  "way/40156900": {
    buildingNumber: "18",
    faculty: "Facultad de Arquitectura y Diseño",
    use: "Talleres Experimentales y Prototipado",
    description:
      "Edificio de talleres manuales y de fabricación digital para estudiantes de Arquitectura y Diseño Industrial, con cortadoras láser, fresado CNC e impresoras 3D.",
    highlights: ["FabLab y Fabricación Digital", "Área de Maquetería"],
  },
  "way/830697558": {
    faculty: "Facultad de Arquitectura y Diseño",
    use: "Taller de Diseño Industrial",
    description:
      "Laboratorios de carpintería, cerrajería, termoformado de plásticos y experimentación con nuevos materiales sostenibles.",
    highlights: ["Taller de Metales y Maderas", "Prototipado de Producto"],
  },
  "way/1215488586": {
    buildingNumber: "50",
    faculty: "Facultad de Ciencias",
    use: "Edificio Félix Restrepo S.J.",
    description:
      "Edificio emblemático de la Facultad de Ciencias que agrupa departamentos de Matemáticas, Física, Biología y Química, dotado de laboratorios de docencia e investigación fundamental.",
    highlights: ["Laboratorios de Química y Física", "Aulas de Ciencias Básicas"],
  },
  "way/1215488587": {
    buildingNumber: "51",
    faculty: "Facultad de Ciencias",
    use: "Edificio Ángel Valtierra S.J.",
    description:
      "Laboratorios de investigación avanzada en ciencias biológicas, microbiología aplicada, bioquímica, bioanálisis y cultivo celular.",
    highlights: ["Laboratorios de Microbiología", "Salas de Cultivo Celular"],
  },
  "way/1200925544": {
    faculty: "Facultad de Ciencias",
    use: "Edificio de Laboratorios de Ciencias PUJ",
    description:
      "Moderno complejo de laboratorios de vanguardia científica inaugurado para potenciar la investigación interdisciplinaria en biotecnología, nanotecnología y ciencias de la salud.",
    highlights: ["Microscopía Avanzada", "Áreas de Nanotecnología"],
  },
  "way/682693832": {
    buildingNumber: "55",
    faculty: "Facultad de Ciencias",
    use: "Bioterio y Colecciones Biológicas",
    description:
      "Espacio certificado de investigación con especímenes biológicos, herbario y banco de recursos genéticos para botánica y zoología.",
    highlights: ["Herbario Javeriano", "Custodia de Biodiversidad"],
  },
  "way/40156028": {
    buildingNumber: "2",
    faculty: "Facultades Eclesiásticas (Filosofía y Teología)",
    use: "Edificio Fernando Barón S.J.",
    description:
      "Una de las edificaciones históricas más tradicionales del campus. Es sede de las Facultades de Filosofía, Teología y Derecho Canónico, con extensos fondos documentales y salas de seminario.",
    highlights: ["Biblioteca de Filosofía y Teología", "Seminarios de Humanidades"],
  },
  "way/95421892": {
    buildingNumber: "95",
    faculty: "Facultad de Comunicación y Lenguaje / Ciencias Sociales",
    use: "Edificio Manuel Briceño Jáuregui S.J.",
    description:
      "Sede de Comunicación Social, Ciencia de la Información, Lenguas Modernas, Sociología, Historia y Antropología. Cuenta con salas de redacción periodística y cabinas de radio escolar.",
    highlights: ["Salas de Redacción Multimedia", "Cabinas de Radio Javeriana"],
  },
  "way/95421911": {
    buildingNumber: "94",
    faculty: "Vicerrectoría del Medio Universitario / Salud Pública",
    use: "Edificio Pedro Arrupe S.J.",
    description:
      "Centro neurálgico del bienestar universitario: Dirección de Asuntos Estudiantiles, Centro de Asesoría Psicológica, Pastoral Universitaria, Dirección de Educación Continua e Instituto de Salud Pública.",
    highlights: ["Centro de Asesoría Psicológica (CAP)", "Pastoral Universitaria", "Educación Continua"],
  },
  "way/207606041": {
    buildingNumber: "41",
    faculty: "Facultad de Estudios Ambientales y Rurales (EAR)",
    use: "Edificio Pablo Sexto",
    description:
      "Sede de la Facultad de Estudios Ambientales y Rurales (EAR), el Instituto Pensar y grupos interdisciplinarios de desarrollo rural, sostenibilidad ecológica y cambio climático.",
    highlights: ["Instituto de Estudios Ambientales", "Instituto Pensar"],
  },
  "way/24368567": {
    buildingNumber: "52",
    faculty: "Facultad de Ciencias / Instituto Geofísico",
    use: "Edificio Carlos Ortiz S.J.",
    description:
      "Instalaciones del Instituto Geofísico de los Andes. Pionero en Colombia en monitoreo sísmico, vulcanología y meteorología de alta montaña.",
    highlights: ["Sismología y Vulcanología", "Datos Geodésicos de Colombia"],
  },
  "way/124387498": {
    buildingNumber: "53",
    faculty: "Facultad de Ciencias / Instituto Geofísico",
    use: "Edificio Jesús Emilio Ramírez S.J.",
    description:
      "Laboratorios de física de la tierra, gravimetría y monitoreo ambiental del Instituto Geofísico de la Pontificia Universidad Javeriana.",
    highlights: ["Red Sísmica Institucional"],
  },
  "way/24368572": {
    buildingNumber: "67",
    faculty: "Facultad de Educación / Ciencias Políticas",
    use: "Edificio José Rafael Arboleda S.J.",
    description:
      "Sede académica de programas de pedagogía, ciencias políticas y relaciones internacionales, con aulas de debate y centros de innovación docente.",
    highlights: ["Centro de Innovación Docente", "Salas de Debate Político"],
  },
  "way/24368577": {
    use: "Centro Javeriano de Formación Deportiva (CJFD)",
    faculty: "Medio Universitario",
    description:
      "Complejo deportivo integral de alta competición con piscina semiolímpica climatizada, coliseo cubierto para baloncesto y voleibol, gimnasio de pesas y cardio, pistas de squash, dojo de artes marciales y muro de escalada.",
    highlights: ["Piscina Semiolímpica", "Coliseo Polideportivo", "Muro de Escalada"],
  },
  "way/68790086": {
    use: "Capilla Nuestra Señora del Camino",
    faculty: "Centro Pastoral San Francisco Javier",
    description:
      "Principal templo católico del campus Javeriano. Su diseño arquitectónico de planta hexagonal y vitrales geométricos ofrece un ambiente de recogimiento espiritual y eucaristías comunitarias.",
    highlights: ["Vitrales Sagrados Contemporáneos", "Eucaristías Comunitarias"],
  },
  "way/1074592656": {
    buildingNumber: "45",
    use: "Capilla San Francisco Javier",
    faculty: "Centro Pastoral San Francisco Javier",
    description:
      "Capilla histórica dedicada al patrono universitario San Francisco Javier, ubicada en el sector nororiental del campus.",
    highlights: ["Patrono San Francisco Javier"],
  },
  "way/48257359": {
    buildingNumber: "49",
    use: "Auditorio Félix Restrepo S.J.",
    faculty: "Auditorios Centrales PUJ",
    description:
      "Auditorio de gran aforo destinado a ceremonias de grado, lecciones inaugurales, congresos científicos internacionales y eventos culturales del campus.",
    highlights: ["Aforo para 500+ asistentes", "Acústica para Conferencias Magistrales"],
  },
  "way/1201221756": {
    buildingNumber: "34",
    use: "Auditorio Alejandro Novoa S.J.",
    faculty: "Auditorios Centrales PUJ",
    description:
      "Espacio de eventos académicos, encuentros institucionales y conferencias de facultades adyacentes al sector central del campus.",
    highlights: ["Conferencias y Simposios"],
  },
  "way/409391089": {
    use: "Cafetería La Central",
    faculty: "Servicios al Campus",
    description:
      "El punto de encuentro gastronómico y social por excelencia del campus. Ofrece plazoleta de comidas, mesas de diálogo al aire libre y zonas de recarga.",
    highlights: ["Plazoleta de Comidas", "Zona Social Universitaria"],
  },
  "way/48255427": {
    use: "La Pecera (Sala de Cómputo)",
    faculty: "Tecnologías de Información (DTI)",
    description:
      "Histórica sala de computadores y estaciones de trabajo de acceso libre para estudiantes de todas las facultades, con servicio ininterrumpido durante semanas de exámenes.",
    highlights: ["Estaciones de Cómputo de Alto Rendimiento", "Acceso Abierto Estudiantil"],
  },
  "way/478119312": {
    use: "La Conejera (Espacio Estudiantil)",
    faculty: "Puntos de Encuentro",
    description:
      "Popular rincón de encuentro informal entre estudiantes de Artes y Arquitectura para debates, descanso y exposiciones espontáneas.",
    highlights: ["Espacio Estudiantil al Aire Libre"],
  },
  "way/409392267": {
    use: "Kiosko Urapanes",
    faculty: "Servicios al Campus",
    description:
      "Punto de refrigerio y descanso sombreado por los tradicionales urapanes del campus javeriano, sobre el eje peatonal principal.",
    highlights: ["Zona de Café y Tertulia"],
  },
};

/**
 * Busca información enriquecida para un edificio de la Javeriana por ID o coincidencia en el nombre.
 */
export function getJaverianaBuildingInfo(id: string, name?: string | null): JaverianaBuildingInfo | null {
  // Coincidencia directa por ID de OSM
  if (JAVERIANA_DESCRIPTIONS[id]) {
    return JAVERIANA_DESCRIPTIONS[id];
  }

  if (!name) return null;

  const lowerName = name.toLowerCase();

  // Búsqueda por palabras clave en el nombre si el ID difiere (p.ej. partes divididas)
  for (const [keyId, info] of Object.entries(JAVERIANA_DESCRIPTIONS)) {
    if (lowerName.includes("biblioteca") && (keyId === "way/40156024" || info.use.includes("Biblioteca"))) {
      return info;
    }
    if (lowerName.includes("arango") && lowerName.includes("emilio")) {
      return JAVERIANA_DESCRIPTIONS["way/24368574"];
    }
    if (lowerName.includes("maldonado") || lowerName.includes("ingenier")) {
      return lowerName.includes("lab")
        ? JAVERIANA_DESCRIPTIONS["way/68790368"]
        : JAVERIANA_DESCRIPTIONS["way/40156023"];
    }
    if (lowerName.includes("ático") || lowerName.includes("atico")) {
      return JAVERIANA_DESCRIPTIONS["way/68790088"];
    }
    if (lowerName.includes("hospital") || (lowerName.includes("san ignacio") && lowerName.includes("universitario"))) {
      return JAVERIANA_DESCRIPTIONS["way/24368575"];
    }
    if (lowerName.includes("deportiv") || lowerName.includes("gimnasio") || lowerName.includes("piscina")) {
      return JAVERIANA_DESCRIPTIONS["way/24368577"];
    }
    if (lowerName.includes("giraldo") || lowerName.includes("derecho")) {
      return JAVERIANA_DESCRIPTIONS["way/24368576"];
    }
    if (lowerName.includes("hoyos") || lowerName.includes("fcea")) {
      return JAVERIANA_DESCRIPTIONS["way/409391091"];
    }
    if (lowerName.includes("barón") || lowerName.includes("baron")) {
      return JAVERIANA_DESCRIPTIONS["way/40156028"];
    }
    if (lowerName.includes("restrepo")) {
      return JAVERIANA_DESCRIPTIONS["way/1215488586"];
    }
    if (lowerName.includes("camino") || lowerName.includes("capilla")) {
      return JAVERIANA_DESCRIPTIONS["way/68790086"];
    }
  }

  return null;
}
