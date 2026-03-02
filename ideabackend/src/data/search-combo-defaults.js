/**
 * Opciones por defecto del search combo (dropdowns de la landing).
 * Se usan cuando no existe el documento en MongoDB (auto-poblado en primera petición).
 */
export const defaultSearchComboOptions = [
  {
    ComboBoxUserName: 'Emprendedor',
    ComboBoxUserMatches: [
      {
        ComboBoxMatchElementText: 'Emprendimiento',
        ComboBoxMatchElementUrl: [
          { ComboBoxThirdText: 'Incubadoras', ComboBoxThirdUrl: '/pagina/incubadoras' },
          { ComboBoxThirdText: 'INCUBECH', ComboBoxThirdUrl: '/pagina/incubech' },
          { ComboBoxThirdText: 'Becas con universidades', ComboBoxThirdUrl: '/pagina/becas-con-universidades' },
          { ComboBoxThirdText: 'Branding', ComboBoxThirdUrl: '/pagina/branding' },
          { ComboBoxThirdText: 'Propiedad Intelectual', ComboBoxThirdUrl: '/pagina/propiedad-intelectual' },
          { ComboBoxThirdText: 'Permisos y licencias', ComboBoxThirdUrl: '/pagina/permisos-y-licencias' },
          { ComboBoxThirdText: 'Mi situación fiscal', ComboBoxThirdUrl: '/pagina/mi-situacion-fiscal' },
          { ComboBoxThirdText: 'SAT en el SARE', ComboBoxThirdUrl: '/pagina/sat-en-el-sare' },
          { ComboBoxThirdText: 'Guía para apertura de negocios', ComboBoxThirdUrl: '/pagina/guia-para-apertura-de-negocios' },
          { ComboBoxThirdText: 'Emprendimientos con base tecnológica', ComboBoxThirdUrl: '/pagina/emprendimientos-con-base-tecnologica' },
        ],
      },
      {
        ComboBoxMatchElementText: 'Capacitación',
        ComboBoxMatchElementUrl: [
          { ComboBoxThirdText: 'MIFAM', ComboBoxThirdUrl: '/pagina/mifam' },
          { ComboBoxThirdText: 'ENCES', ComboBoxThirdUrl: '/pagina/ences' },
          { ComboBoxThirdText: 'Capital de emprendimiento', ComboBoxThirdUrl: '/pagina/capital-de-emprendimiento' },
          { ComboBoxThirdText: 'Aulas digitales', ComboBoxThirdUrl: '/pagina/aulas-digitales' },
        ],
      },
      {
        ComboBoxMatchElementText: 'Ferias y Eventos',
        ComboBoxMatchElementUrl: [
          { ComboBoxThirdText: 'Tianguis de productores', ComboBoxThirdUrl: '/pagina/tianguis-de-productores' },
          { ComboBoxThirdText: 'Impulso a eventos y festividades', ComboBoxThirdUrl: '/pagina/impulso-a-eventos-y-festividades' },
        ],
      },
      {
        ComboBoxMatchElementText: 'Apoyos y Financiamientos',
        ComboBoxMatchElementUrl: [
          { ComboBoxThirdText: 'Proyectos productivos', ComboBoxThirdUrl: '/pagina/proyectos-productivos' },
          { ComboBoxThirdText: 'FOMECH', ComboBoxThirdUrl: '/pagina/fomech' },
          { ComboBoxThirdText: 'Impulso municipal', ComboBoxThirdUrl: '/pagina/impulso-municipal' },
          { ComboBoxThirdText: 'FIDEAPECH', ComboBoxThirdUrl: '/pagina/fideapech' },
          { ComboBoxThirdText: 'FIPES', ComboBoxThirdUrl: '/pagina/fipes' },
        ],
      },
      {
        ComboBoxMatchElementText: 'Sector Industrial',
        ComboBoxMatchElementUrl: [
          { ComboBoxThirdText: 'Desarrollo de proveedores', ComboBoxThirdUrl: '/pagina/desarrollo-de-proveedores' },
          { ComboBoxThirdText: 'Clúster', ComboBoxThirdUrl: '/pagina/cluster' },
          { ComboBoxThirdText: 'Atracción de inversión', ComboBoxThirdUrl: '/pagina/atraccion-de-inversion' },
        ],
      },
    ],
  },
  {
    ComboBoxUserName: 'Empresa',
    ComboBoxUserMatches: [
      {
        ComboBoxMatchElementText: 'Sector Industrial',
        ComboBoxMatchElementUrl: [
          { ComboBoxThirdText: 'Desarrollo de proveedores', ComboBoxThirdUrl: '/pagina/desarrollo-de-proveedores' },
          { ComboBoxThirdText: 'Clúster', ComboBoxThirdUrl: '/pagina/cluster' },
          { ComboBoxThirdText: 'Atracción de inversión', ComboBoxThirdUrl: '/pagina/atraccion-de-inversion' },
        ],
      },
      {
        ComboBoxMatchElementText: 'Apoyos y Financiamientos',
        ComboBoxMatchElementUrl: [
          { ComboBoxThirdText: 'FOMECH', ComboBoxThirdUrl: '/pagina/fomech' },
          { ComboBoxThirdText: 'Impulso municipal', ComboBoxThirdUrl: '/pagina/impulso-municipal' },
        ],
      },
    ],
  },
  {
    ComboBoxUserName: 'Bolsa de trabajo',
    ComboBoxUserMatches: [
      {
        ComboBoxMatchElementText: 'Buscar empleo',
        ComboBoxMatchElementUrl: [{ ComboBoxThirdText: 'Bolsa de trabajo', ComboBoxThirdUrl: '/bolsa' }],
      },
    ],
  },
  {
    ComboBoxUserName: 'Ubicación',
    ComboBoxUserMatches: [
      {
        ComboBoxMatchElementText: 'Dónde estamos',
        ComboBoxMatchElementUrl: [{ ComboBoxThirdText: 'UBICACIÓN DDEyC', ComboBoxThirdUrl: '/pagina/ubicacion-ddeyc' }],
      },
    ],
  },
];
