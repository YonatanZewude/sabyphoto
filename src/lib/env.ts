function createGoogleMapsEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`
}

export const env = {
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  salonName: import.meta.env.VITE_SALON_NAME ?? 'SABY Photo',
  salonTagline: import.meta.env.VITE_SALON_TAGLINE ?? 'Modern fotograf i Stockholm',
  salonHeroLabel: import.meta.env.VITE_SALON_HERO_LABEL ?? import.meta.env.VITE_SALON_NAME ?? 'SABY Photo',
  salonHeroTitle:
    import.meta.env.VITE_SALON_HERO_TITLE ??
    'Fotografering med modern känsla och enkel onlinebokning.',
  salonHeroDescription:
    import.meta.env.VITE_SALON_HERO_DESCRIPTION ??
    'Se fototjänster, välj en tid och boka din fotografering direkt utan konto.',
  salonHighlightOneLabel: import.meta.env.VITE_SALON_HIGHLIGHT_ONE_LABEL ?? 'Personligt bildspråk',
  salonHighlightOneValue: import.meta.env.VITE_SALON_HIGHLIGHT_ONE_VALUE ?? 'Bilder med känsla',
  salonHighlightTwoLabel: import.meta.env.VITE_SALON_HIGHLIGHT_TWO_LABEL ?? 'Boka utan konto',
  salonHighlightTwoValue: import.meta.env.VITE_SALON_HIGHLIGHT_TWO_VALUE ?? 'Snabbt och enkelt',
  salonHighlightThreeLabel: import.meta.env.VITE_SALON_HIGHLIGHT_THREE_LABEL ?? 'Tydliga fotopaket',
  salonHighlightThreeValue: import.meta.env.VITE_SALON_HIGHLIGHT_THREE_VALUE ?? 'Pris och tid direkt',
  salonFeatureBadge: import.meta.env.VITE_SALON_FEATURE_BADGE ?? 'Signaturfoto',
  salonFeatureTitle:
    import.meta.env.VITE_SALON_FEATURE_TITLE ??
    'Tidlösa bilder, trygg guidning och leverans med professionell finish.',
  salonFeatureDescription:
    import.meta.env.VITE_SALON_FEATURE_DESCRIPTION ??
    'Vi fotograferar porträtt, familj, event och företag med fokus på ljus, uttryck och detaljer.',
  salonFeatureCardOneTitle: import.meta.env.VITE_SALON_FEATURE_CARD_ONE_TITLE ?? 'Porträtt, event och företag',
  salonFeatureCardOneDescription:
    import.meta.env.VITE_SALON_FEATURE_CARD_ONE_DESCRIPTION ?? 'Fotopaket anpassade efter syfte, miljö och önskad känsla.',
  salonFeatureCardTwoTitle: import.meta.env.VITE_SALON_FEATURE_CARD_TWO_TITLE ?? 'Bokning på mobilen',
  salonFeatureCardTwoDescription:
    import.meta.env.VITE_SALON_FEATURE_CARD_TWO_DESCRIPTION ?? 'Boka din tid enkelt, snabbt och när det passar dig.',
  salonAboutTitle:
    import.meta.env.VITE_SALON_ABOUT_TITLE ?? 'Professionell fotografi med personlig känsla.',
  salonAboutDescription:
    import.meta.env.VITE_SALON_ABOUT_DESCRIPTION ??
    'Vi kombinerar modern fotoestetik, trygg regi och snabb bokning i en studio skapad för människor, varumärken och minnen.',
  salonBenefitOne:
    import.meta.env.VITE_SALON_BENEFIT_ONE ?? 'Personlig konsultation och resultat anpassat efter dig.',
  salonBenefitTwo:
    import.meta.env.VITE_SALON_BENEFIT_TWO ?? 'Tydliga priser och enkel bokning direkt online.',
  salonBenefitThree:
    import.meta.env.VITE_SALON_BENEFIT_THREE ?? 'Modern studio och flexibla miljöer för porträtt, event och produktfoto.',
  salonBenefitFour:
    import.meta.env.VITE_SALON_BENEFIT_FOUR ?? 'Adress, kontakt och öppettider samlade på ett ställe.',
  salonContactIntroTitle:
    import.meta.env.VITE_SALON_CONTACT_INTRO_TITLE ?? 'Boka din fotografering eller hitta till studion.',
  salonFooterDescription:
    import.meta.env.VITE_SALON_FOOTER_DESCRIPTION ??
    'erbjuder porträtt, event, familjefoto och företagsbilder med enkel onlinebokning.',
  salonPhone: import.meta.env.VITE_SALON_PHONE ?? '08-123 45 67',
  salonEmail: import.meta.env.VITE_SALON_EMAIL ?? 'hej@sabyphoto.se',
  salonAddress: import.meta.env.VITE_SALON_ADDRESS ?? 'Storgatan 12, Stockholm',
  salonInstagramUrl: import.meta.env.VITE_SALON_INSTAGRAM_URL ?? 'https://instagram.com/sabyphoto',
  salonFacebookUrl: import.meta.env.VITE_SALON_FACEBOOK_URL ?? 'https://facebook.com/sabyphoto',
  salonTiktokUrl: import.meta.env.VITE_SALON_TIKTOK_URL ?? 'https://tiktok.com/@sabyphoto',
  salonMapEmbedUrl: createGoogleMapsEmbedUrl(import.meta.env.VITE_SALON_ADDRESS ?? 'Storgatan 12, Stockholm'),
  servicesPageTitle:
    import.meta.env.VITE_SERVICES_PAGE_TITLE ?? 'Fototjänster med tydligt pris och tidsåtgång',
  servicesPageDescription:
    import.meta.env.VITE_SERVICES_PAGE_DESCRIPTION ??
    'Se fotopaket, priser och tidsåtgång innan du bokar din fotografering.',
  contactPageTitle:
    import.meta.env.VITE_CONTACT_PAGE_TITLE ?? 'Hitta till SABY Photo och kontakta oss direkt.',
  contactPageDescription:
    import.meta.env.VITE_CONTACT_PAGE_DESCRIPTION ??
    'Adress, telefon, e-post och karta för kunder som vill planera sin fotografering eller ställa frågor innan bokning.',
} as const

export const isConfigured = {
  clerk: Boolean(env.clerkPublishableKey),
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
} as const
