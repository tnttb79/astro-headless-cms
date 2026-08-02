export interface SiteImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
}

const image = (stem: string, width: number, height: number, alt: string): SiteImage => ({
  src: `/images/site/${stem}-1600.webp`,
  srcSet: `/images/site/${stem}-800.webp 800w, /images/site/${stem}-1600.webp 1600w`,
  width,
  height,
  alt,
});

export const SITE_IMAGES = {
  homeHero: image("home-hero-meditation-sunrise", 975, 549, "Dr. Kang meditating on a mountain ridge at sunrise"),
  homeDoctor: image("dr-kang-headshot", 551, 662, "Portrait of Dr. Hyo-won Kang"),
  whyChoose: image("why-choose-us-family", 968, 727, "A family sharing a quiet moment outdoors"),
  doctorMeet: image("dr-kang-acupuncture-profile", 1448, 1086, "Dr. Kang preparing an acupuncture treatment"),
  doctorComplex: image("dr-kang-acupuncture-about", 1448, 1086, "Dr. Kang providing attentive acupuncture care"),
  consultation: image("tcm-formula-consultation", 1600, 899, "A traditional medicine consultation"),
  firstTreatment: image("dr-kang-acupuncture-home", 1448, 1086, "Dr. Kang during an acupuncture appointment"),
  acupuncture: image("acupuncture-neck-treatment", 1408, 768, "Acupuncture needles placed during a neck treatment"),
  "electro-acupuncture": image("electro-acupuncture-treatment", 295, 166, "Electro-acupuncture treatment equipment connected to selected needles"),
  "facial-acupuncture": image("facial-acupuncture-specialty", 323, 354, "Facial acupuncture treatment"),
  "ear-acupuncture": image("auricular-acupuncture-ear", 1431, 1073, "Auricular acupuncture points on an ear"),
  moxibustion: image("moxibustion-therapy-back", 437, 414, "Moxibustion warming therapy"),
  "medical-massage-met": image("medical-massage-met-treatment", 1408, 768, "Medical massage and muscle energy technique treatment"),
  "lymphatic-massage": image("lymphatic-massage-treatment", 1408, 768, "Gentle lymphatic massage treatment"),
  "herbal-medicine": image("herbal-medicine-ingredients", 1372, 784, "Traditional herbal medicine ingredients"),
  "auto-injury-care": image("therapeutic-massage-treatment", 1408, 768, "Manual therapy provided as part of an individualized care plan"),
  "colds-and-allergies": image("cold-and-allergies", 310, 208, "Herbal tea and seasonal wellness ingredients"),
  "weight-loss-support": image("weight-loss-support", 317, 320, "Balanced food and movement representing weight-management support"),
  "constipation-support": image("constipation-support", 292, 152, "Foods commonly associated with digestive wellness"),
  "fertility-support": image("fertility-support", 329, 179, "Hands forming a heart as a symbol of fertility support"),
  "oncology-support": image("oncology-acupuncture-support", 376, 211, "Supportive care represented by hands and a ribbon"),
  cupping: image("cupping-therapy-back", 1408, 768, "Cupping therapy applied to the back"),
  "facial-acupressure": image("facial-healing-acupressure-treatment", 975, 532, "Facial acupressure treatment"),
  reflexology: image("medical-foot-therapy-treatment", 1116, 960, "Foot reflexology treatment"),
} as const;

export type SiteImageKey = keyof typeof SITE_IMAGES;

export function getServiceImage(slug: string, imagePath?: string): SiteImage {
  const fallback = SITE_IMAGES[slug as SiteImageKey] ?? SITE_IMAGES.acupuncture;
  if (!imagePath) return fallback;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return { ...fallback, src: imagePath, srcSet: "" };
  }
  const stem = imagePath.replace(/^\/?images\/(?:source-document|site)\//, "").replace(/\.(png|jpe?g|webp)$/i, "").replace(/-(800|1600)$/, "");
  return { ...fallback, src: `/images/site/${stem}-1600.webp`, srcSet: `/images/site/${stem}-800.webp 800w, /images/site/${stem}-1600.webp 1600w` };
}
