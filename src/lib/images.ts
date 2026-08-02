export interface SiteImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  position: string;
}

const image = (stem: string, width: number, height: number, alt: string, position = "center"): SiteImage => {
  const fullWidth = Math.min(width, 1600);
  const variants = width > 800
    ? [`/images/site/${stem}-800.webp 800w`, `/images/site/${stem}-${fullWidth}.webp ${fullWidth}w`]
    : [`/images/site/${stem}-${fullWidth}.webp ${fullWidth}w`];
  return {
    src: `/images/site/${stem}-${fullWidth}.webp`,
    srcSet: variants.join(", "),
    width: fullWidth,
    height: Math.round(height * (fullWidth / width)),
    alt,
    position,
  };
};

export const SITE_IMAGES = {
  homeHero: image("home-hero-meditation-sunrise", 975, 549, "Dr. Kang meditating on a mountain ridge at sunrise"),
  homeDoctor: image("dr-kang-headshot", 551, 662, "Portrait of Dr. Hyo-won Kang", "center 24%"),
  whyChoose: image("dr-kang-acupuncture-home", 1448, 1086, "Dr. Kang providing an individualized acupuncture treatment", "center 38%"),
  doctorMeet: image("dr-kang-acupuncture-profile", 1448, 1086, "Dr. Kang preparing an acupuncture treatment"),
  doctorComplex: image("dr-kang-acupuncture-about", 1448, 1086, "Dr. Kang providing attentive acupuncture care"),
  consultation: image("tcm-formula-consultation", 1600, 899, "A traditional medicine consultation"),
  firstTreatment: image("dr-kang-acupuncture-home", 1448, 1086, "Dr. Kang during an acupuncture appointment"),
  acupuncture: image("acupuncture-neck-treatment", 1408, 768, "Acupuncture needles placed during a neck treatment", "center 44%"),
  "electro-acupuncture": image("dr-kang-acupuncture-about", 1448, 1086, "Dr. Kang selecting points during an acupuncture treatment", "center 42%"),
  "facial-acupuncture": image("facial-healing-acupressure-treatment", 975, 532, "A focused facial treatment in the clinic", "center 42%"),
  "ear-acupuncture": image("auricular-acupuncture-ear", 1431, 1073, "Auricular acupuncture points on an ear"),
  moxibustion: image("moxibustion-therapy-closeup", 566, 535, "Moxibustion warming therapy", "center 55%"),
  "medical-massage-met": image("medical-massage-met-treatment", 1408, 768, "Medical massage and muscle energy technique treatment"),
  "lymphatic-massage": image("lymphatic-massage-treatment", 1408, 768, "Gentle lymphatic massage treatment"),
  "herbal-medicine": image("herbal-medicine-ingredients", 1372, 784, "Traditional herbal medicine ingredients"),
  "auto-injury-care": image("therapeutic-massage-treatment", 1408, 768, "Manual therapy provided as part of an individualized care plan"),
  "colds-and-allergies": image("herbal-medicine-ingredients", 1372, 784, "Traditional herbs used in an individualized wellness plan", "center 48%"),
  "weight-loss-support": image("tcm-formula-consultation", 1600, 899, "Dr. Kang discussing an individualized traditional medicine plan", "center 45%"),
  "constipation-support": image("personalized-herbal-prescriptions", 1380, 752, "Traditional herbs arranged for a personalized prescription", "center 52%"),
  "fertility-support": image("dr-kang-acupuncture-home", 1448, 1086, "Dr. Kang providing attentive supportive acupuncture care", "center 42%"),
  "oncology-support": image("dr-kang-acupuncture-profile", 1448, 1086, "Dr. Kang providing comfort-focused supportive acupuncture care", "center 38%"),
  cupping: image("cupping-therapy-back", 1408, 768, "Cupping therapy applied to the back"),
  "facial-acupressure": image("facial-healing-acupressure-treatment", 975, 532, "Facial acupressure treatment"),
  reflexology: image("medical-foot-therapy-treatment", 1116, 960, "Foot reflexology treatment"),
} as const;

export type SiteImageKey = keyof typeof SITE_IMAGES;

const LOW_RESOLUTION_CMS_STEMS = new Set([
  "electro-acupuncture-treatment",
  "facial-acupuncture-specialty",
  "moxibustion-therapy-back",
  "cold-and-allergies",
  "weight-loss-support",
  "constipation-support",
  "fertility-support",
  "oncology-acupuncture-support",
]);

export function getServiceImage(slug: string, imagePath?: string): SiteImage {
  const fallback = SITE_IMAGES[slug as SiteImageKey] ?? SITE_IMAGES.acupuncture;
  if (!imagePath) return fallback;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return { ...fallback, src: imagePath, srcSet: "" };
  }
  const stem = imagePath.replace(/^\/?images\/(?:source-document|site)\//, "").replace(/\.(png|jpe?g|webp)$/i, "").replace(/-(800|1600)$/, "");
  if (fallback.src.includes(`/images/site/${stem}-`)) return fallback;
  if (LOW_RESOLUTION_CMS_STEMS.has(stem)) return fallback;
  return { ...fallback, src: `/images/site/${stem}-1600.webp`, srcSet: `/images/site/${stem}-800.webp 800w, /images/site/${stem}-1600.webp 1600w` };
}
