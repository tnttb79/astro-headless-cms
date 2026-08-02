export interface ConditionCategory {
  slug: string;
  title: string;
  intro: string;
  commonServices: string[];
  order: number;
}

export const CONDITION_CATEGORIES: ConditionCategory[] = [
  { slug: "pain-and-injury", title: "Pain & Injury", intro: "Personalized support for musculoskeletal discomfort, mobility concerns, and recovery needs.", commonServices: ["Acupuncture", "Electro-acupuncture", "Medical Massage / MET", "Auto Injury Care"], order: 1 },
  { slug: "mental-and-emotional", title: "Mental & Emotional Wellness", intro: "Whole-person care that may support relaxation, rest, and resilience alongside appropriate medical or mental-health care.", commonServices: ["Acupuncture", "Ear Acupuncture", "Herbal Medicine"], order: 2 },
  { slug: "immune-and-respiratory", title: "Immune & Respiratory", intro: "Integrative wellness support for seasonal, sinus, and respiratory concerns, with medical evaluation when symptoms warrant it.", commonServices: ["Acupuncture", "Moxibustion", "Herbal Medicine"], order: 3 },
  { slug: "energy-and-digestive", title: "Energy & Digestive", intro: "Individualized care for digestive comfort, energy, and related lifestyle patterns.", commonServices: ["Acupuncture", "Moxibustion", "Herbal Medicine"], order: 4 },
  { slug: "womens-health", title: "Women’s Health", intro: "Supportive care for menstrual, menopausal, and reproductive wellness as part of an appropriate care plan.", commonServices: ["Acupuncture", "Moxibustion", "Herbal Medicine"], order: 5 },
  { slug: "skin-and-facial", title: "Skin & Facial Wellness", intro: "Cosmetic and whole-person approaches intended to support circulation, relaxation, and skin wellness.", commonServices: ["Facial Acupuncture", "Acupuncture", "Herbal Medicine"], order: 6 },
];

export function getConditionCategory(slug: string): ConditionCategory | undefined {
  return CONDITION_CATEGORIES.find((category) => category.slug === slug);
}
