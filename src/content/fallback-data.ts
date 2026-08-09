import type { BookableService, BookingSettings, BusinessHour, CalendarConfigEntry, Closure, Condition, InsuranceProvider, Location, PricingItem, SiteSettings, Testimonial, Treatment } from "../types/content";

export const FALLBACK_SETTINGS: SiteSettings = {
  businessName: "Marin Holy Hill Acupuncture Clinic",
  doctorName: "Dr. Hyo-won Kang",
  yearsExperience: 28,
  phone: "(480) 730-4991",
  email: "marinholyhillacu@gmail.com",
  bookingUrl: "https://www.zocdoc.com/practice/marin-holy-hill-acupuncture-clinic-175973?lock=true&isNewPatient=false&referrerType=widget",
  medicalDisclaimer: "The information on this website is for general education only and is not a substitute for professional medical advice, diagnosis, or treatment. Results and appropriate treatment vary by person.",
  instagramUrl: "https://www.instagram.com/tcmkang67/",
  facebookUrl: "https://www.facebook.com/marinholyhillacu/",
  youtubeUrl: "https://www.youtube.com/channel/UCHUYhknnVi1FEgMXLn21q_w",
};

const service = (slug: string, title: string, group: "core" | "specialized", order: number, shortDescription: string, description: string, howItWorks: string, indications: string, price = "", duration = "", featured = false): Treatment => ({
  id: `fallback-${slug}`, slug, title, category: group === "core" ? "Core service" : "Specialized care", serviceGroup: group,
  shortDescription, description: `<p>${description}</p>`, howItWorks: `<p>${howItWorks}</p>`, indications: `<p>${indications}</p>`, benefits: "", imagePath: "", price, duration,
  seoTitle: `${title} in Mesa & Payson, AZ`, seoDescription: `${shortDescription} Learn about personalized care at Marin Holy Hill Acupuncture Clinic.`, displayOrder: order, featured, published: true,
});

export const FALLBACK_TREATMENTS: Treatment[] = [
  service("acupuncture", "Acupuncture", "core", 1, "Personalized treatment using fine, sterile needles at selected points.", "Acupuncture is a traditional practice that may support pain management, relaxation, circulation, sleep, and whole-person balance.", "After an assessment, very fine single-use needles are placed at selected points and left in place while you rest.", "Commonly used to help manage musculoskeletal discomfort, stress, sleep concerns, and general wellbeing.", "$80 focused follow-up", "Varies by visit", true),
  service("electro-acupuncture", "Electro-acupuncture", "core", 2, "Acupuncture with mild electrical stimulation at selected points.", "Electro-acupuncture may be incorporated into an individualized plan for pain, muscle tension, nerve-related symptoms, or swelling support.", "A gentle current is connected to selected acupuncture needles. Intensity is adjusted for comfort throughout the session.", "May support pain management, muscle activation or relaxation, and functional recovery.", "Included when appropriate", "Varies by visit", true),
  service("facial-acupuncture", "Facial Acupuncture", "core", 3, "Cosmetic and wellness-focused acupuncture for facial circulation and tone.", "Facial acupuncture is offered as a wellness and cosmetic service, with goals tailored to the individual.", "Fine needles are placed at selected facial and body points to support relaxation and local circulation.", "May support facial tone, skin texture, complexion, and relaxation. It is not a dermatologic treatment.", "$80", "Varies by visit", true),
  service("ear-acupuncture", "Ear Acupuncture", "core", 4, "Selected auricular points used as part of a broader care plan.", "Ear, or auricular, acupuncture uses points on the external ear and may accompany a full-body treatment.", "Very fine needles or non-needle ear seeds may be applied to selected points based on your goals.", "Commonly used to support relaxation, sleep, cravings, appetite awareness, and pain management."),
  service("moxibustion", "Moxibustion", "core", 5, "A traditional warming therapy using moxa near selected points.", "Moxibustion may be combined with acupuncture to provide focused warmth and support comfort.", "Moxa is warmed at a safe distance from the skin or used with specialized equipment while temperature and comfort are monitored.", "May support circulation, stiffness, digestive comfort, cold sensations, and women’s wellness.", "$50", "Varies by visit"),
  service("medical-massage-met", "Medical Massage / MET", "core", 6, "Manual care using massage and muscle energy techniques.", "Medical Massage and Muscle Energy Technique (MET) are individualized manual approaches for mobility and muscular balance.", "MET may use gentle resisted movement, post-isometric relaxation, and reciprocal inhibition alongside hands-on massage.", "May support range of motion, tight muscles, muscular imbalance, mobility, and swelling management.", "$80", "Varies by visit"),
  service("lymphatic-massage", "Lymphatic Massage", "core", 7, "Gentle, rhythmic manual therapy following lymphatic pathways.", "Lymphatic massage uses light, deliberate movements and is adapted to the patient’s comfort and health history.", "Slow rhythmic strokes follow lymphatic pathways without deep pressure.", "May support relaxation and fluid or swelling management. Medical causes of swelling should be evaluated first.", "$80", "Varies by visit"),
  service("herbal-medicine", "Herbal Medicine", "core", 8, "Individualized traditional formulas adjusted to constitution and progress.", "Traditional herbal formulas may be recommended to complement in-clinic care when appropriate.", "Dr. Kang reviews symptoms, digestion, constitution, other medicines, and progress before selecting or adjusting a formula.", "Formulas are individualized. Tell the clinic and your prescribing clinicians about all medicines and supplements.", "$80 plus ingredient adjustments", "Consultation based", true),
  service("auto-injury-care", "Auto Injury Care", "core", 9, "Integrative support after motor-vehicle injuries, with coverage coordination when applicable.", "Care after an auto injury may combine acupuncture and manual therapies as part of a medical recovery plan.", "The clinic evaluates your concerns, coordinates documentation when coverage applies, and adapts treatment to your recovery.", "May support pain management, mobility, muscular tension, and return to daily activity. Urgent or serious injuries require medical evaluation."),
  service("colds-and-allergies", "Colds & Allergies", "specialized", 10, "Supportive care for seasonal, sinus, and respiratory comfort.", "Acupuncture and herbal medicine may be used as supportive care for seasonal wellness and symptom management.", "Care is selected after reviewing symptoms, health history, and any current medical treatment.", "Seek medical care for breathing difficulty, high fever, severe symptoms, or symptoms that persist or worsen."),
  service("weight-loss-support", "Weight Loss Support", "specialized", 11, "Acupuncture and lifestyle support within a broader weight-management plan.", "This service focuses on wellbeing, habits, appetite awareness, stress, and sustainable routines rather than rapid-result promises.", "An individualized plan may include acupuncture, ear points, and practical lifestyle guidance.", "Weight changes have many causes. Work with an appropriate medical professional for assessment and nutrition guidance."),
  service("constipation-support", "Constipation Support", "specialized", 12, "Integrative support for digestive comfort and regularity.", "Acupuncture and traditional herbal care may be considered alongside hydration, nutrition, movement, and medical guidance.", "Care is tailored after reviewing digestive patterns, medicines, diet, and other health factors.", "Persistent, severe, or sudden constipation—especially with pain, vomiting, bleeding, or weight loss—needs medical evaluation."),
  service("fertility-support", "Fertility Support", "specialized", 13, "Supportive acupuncture alongside care from a fertility specialist.", "Fertility support is designed to complement—not replace—medical evaluation and treatment from an OB-GYN or fertility specialist.", "An individualized plan may focus on stress, sleep, treatment comfort, and overall wellbeing during a fertility journey.", "No outcome or IVF success rate can be guaranteed. Coordinate supplements and herbs with your fertility team."),
  service("oncology-support", "Oncology Support", "specialized", 14, "Comfort-focused supportive care alongside oncology treatment.", "This service is not cancer treatment. It may be considered as supportive care for comfort and quality of life with approval from the oncology team.", "Care is coordinated around the patient’s diagnosis, treatment schedule, blood counts, medicines, and oncology guidance.", "May support relaxation and symptom management. Oncology treatment decisions always remain with the patient’s medical team."),
];

const condition = (title: string, slug: string, category: string, order: number, summary: string, description = "", featured = false): Condition => ({ id: `fallback-${slug}`, title, slug, category, summary, description, displayOrder: order, featured, published: true });
export const FALLBACK_CONDITIONS: Condition[] = [
  condition("Neck and shoulder pain","neck-and-shoulder-pain","pain-and-injury",1,"Supportive care for tension, discomfort, and mobility concerns.","",true), condition("Frozen shoulder","frozen-shoulder","pain-and-injury",2,"An integrative approach to comfort and shoulder mobility."), condition("Upper and inter-scapular pain","upper-back-pain","pain-and-injury",3,"Care for discomfort around the upper back and shoulder blades."), condition("Lower-back pain","lower-back-pain","pain-and-injury",4,"Personalized support for lower-back comfort and function.","",true), condition("Sciatica","sciatica","pain-and-injury",5,"Supportive care for radiating leg discomfort after appropriate evaluation."), condition("Neuropathy and neuralgia","neuropathy-neuralgia","pain-and-injury",6,"Symptom-management support coordinated with medical care."), condition("Headaches and migraines","headaches-and-migraines","pain-and-injury",7,"Individualized support for headache patterns, stress, and muscular tension.","<p>Headaches can be influenced by stress, sleep, hydration, muscle tension, and medical conditions. Dr. Kang reviews patterns and contributing factors before recommending supportive care. New, severe, or changing headaches require prompt medical evaluation.</p>",true), condition("Arthritis and joint pain","arthritis-joint-pain","pain-and-injury",8,"Support for joint comfort and everyday mobility."), condition("Sports, work, and auto injuries","sports-work-auto-injuries","pain-and-injury",9,"Care that may complement an appropriate injury-recovery plan."),
  condition("Stress and anxiety","stress-anxiety","mental-and-emotional",10,"Whole-person support for relaxation and stress management.","",true), condition("Depression and mood concerns","depression-mood","mental-and-emotional",11,"Supportive wellness care alongside qualified mental-health treatment."), condition("Insomnia","insomnia","mental-and-emotional",12,"Individualized support for sleep routines, relaxation, and daily energy.","<p>Sleep can be affected by stress, pain, lifestyle, medicines, and underlying health concerns. Care may include acupuncture and practical wellness guidance. Persistent insomnia deserves evaluation from an appropriate healthcare professional.</p>",true), condition("Emotional imbalance","emotional-imbalance","mental-and-emotional",13,"Support for emotional wellbeing as part of an appropriate care plan."), condition("Fatigue","fatigue","mental-and-emotional",14,"Whole-person support after medical causes of ongoing fatigue are considered."),
  condition("Allergies and sinus concerns","allergies-sinus","immune-and-respiratory",15,"Seasonal and sinus-comfort support alongside appropriate medical care."), condition("Asthma and coughing","asthma-coughing","immune-and-respiratory",16,"Supportive care only; breathing symptoms require medical oversight."), condition("Colds, flu, and seasonal wellness","colds-flu","immune-and-respiratory",17,"General wellness support while following medical guidance for infection."),
  condition("Chronic fatigue","chronic-fatigue","energy-and-digestive",18,"Supportive care after ongoing fatigue has been medically evaluated."), condition("Indigestion, gas, and bloating","indigestion-bloating","energy-and-digestive",19,"Integrative support for digestive comfort and lifestyle patterns."), condition("Acid reflux and IBS","acid-reflux-ibs","energy-and-digestive",20,"Supportive care alongside diagnosis and treatment from a medical professional."), condition("Constipation and diarrhea","constipation-diarrhea","energy-and-digestive",21,"Care focused on digestive comfort, habits, and appropriate referral."),
  condition("PMS and menstrual pain","pms-menstrual-pain","womens-health",22,"Support for menstrual comfort and wellbeing."), condition("Irregular cycles","irregular-cycles","womens-health",23,"Integrative support alongside evaluation of cycle changes."), condition("Menopause symptoms","menopause-symptoms","womens-health",24,"Support for comfort, sleep, and wellbeing during menopause."), condition("PCOS","pcos","womens-health",25,"Supportive care alongside medical management of PCOS."), condition("Uterine fibroids","uterine-fibroids","womens-health",26,"Comfort-focused support; fibroids require gynecologic evaluation."), condition("Fertility support","fertility-support","womens-health",27,"Complementary support alongside a fertility specialist’s care."),
  condition("Skin allergies","skin-allergies","skin-and-facial",28,"Whole-person support alongside evaluation of allergic skin symptoms."), condition("Acne and dermatitis","acne-dermatitis","skin-and-facial",29,"Wellness support that does not replace dermatologic care."), condition("Eczema and psoriasis","eczema-psoriasis","skin-and-facial",30,"Supportive care alongside diagnosis and treatment from a dermatologist."), condition("Facial cosmetic wellness","facial-cosmetic-wellness","skin-and-facial",31,"Cosmetic acupuncture focused on relaxation, circulation, and facial wellness."),
];

const maps = (address: string, directions = false) => `https://www.google.com/maps/${directions ? "dir/" : "search/"}?api=1&${directions ? "destination" : "query"}=${encodeURIComponent(address)}`;
export const FALLBACK_LOCATIONS: Location[] = [
  { id:"fallback-mesa", name:"Mesa Clinic", slug:"mesa", addressLine1:"1933 W. Main St.", addressLine2:"Suite #1", city:"Mesa", state:"AZ", postalCode:"85201", phone:"(480) 730-4991", email:FALLBACK_SETTINGS.email, weekdayHours:"Monday–Friday: 8:30 AM–6:00 PM", saturdayHours:"Saturday: 9:00 AM–4:00 PM", sundayHours:"Sunday: Closed", mapUrl:maps("1933 W. Main St. #1, Mesa, AZ 85201"), directionsUrl:maps("1933 W. Main St. #1, Mesa, AZ 85201",true), status:"open", displayOrder:1, active:true },
  { id:"fallback-payson", name:"Payson Clinic", slug:"payson", addressLine1:"600 E. Hwy 260", addressLine2:"Suite #5", city:"Payson", state:"AZ", postalCode:"85541", phone:"(928) 595-2018", email:FALLBACK_SETTINGS.email, weekdayHours:"", saturdayHours:"", sundayHours:"", mapUrl:maps("600 E. Hwy 260 #5, Payson, AZ 85541"), directionsUrl:maps("600 E. Hwy 260 #5, Payson, AZ 85541",true), status:"opening_soon", displayOrder:2, active:true },
];

export const FALLBACK_INSURANCE: InsuranceProvider[] = ["UnitedHealthcare","Blue Cross Blue Shield","Cigna","SCAN","Humana Medicare","Aetna","Federal Employee Insurance","UMR"].map((providerName,index) => ({ id:`fallback-insurance-${index}`, providerName, coverageNote: providerName === "UMR" ? "Welcomed; network status has not been confirmed." : "Benefits and participation depend on the individual plan.", networkStatus: providerName === "UMR" ? "welcomed" : "in_network", displayOrder:index+1, active:true, verifiedDate:"" }));

const price = (serviceName: string, value: string, order: number, priceNote = ""): PricingItem => ({ id:`fallback-price-${order}`, serviceName, category:"Clinic services", price:value, priceNote, displayOrder:order, active:true });
export const FALLBACK_PRICING = [price("New patient consultation and treatment","$130",1),price("Comprehensive returning-patient follow-up","$120",2),price("Focused acupuncture-only follow-up","$80",3),price("Medical Massage / MET","$80",4),price("Facial Acupuncture","$80",5),price("Cupping","$50",6),price("Moxibustion","$50",7),price("Facial Acupressure","$50",8),price("Foot Reflexology","$50",9),price("Custom Herbal Formula","$80",10,"Ingredients may change the final price.")];

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id:"fallback-dz", patientDisplayName:"DZ", quote:"Not only was the doctor able to fix my muscle tension, but I'm finally able to sleep again.\nHe went above and beyond by using needles and massaging my arm and shoulder greatly increasing movement in my join. I have seen Dr. Kang only twice and the improvement is already significant.", sourceNote:"Previously published on the clinic’s live Wix site.", consentConfirmed:false, displayOrder:1, published:true },
  { id:"fallback-devin", patientDisplayName:"Devin L.", quote:"Dr.Kang is a magical man. He is able to identify and heal injuries and ailments that have gone unsolved and untreated by others. He's shown me a deep level of attentive care and personalized treatment every time I've seen him, helping to address a wide scope of concerns i've come to him with. Incredibly knowledgeable, generous and a genuine healer.", sourceNote:"Previously published on the clinic’s live Wix site.", consentConfirmed:false, displayOrder:2, published:true },
  { id:"fallback-natasha", patientDisplayName:"Natasha Larson", quote:"He helped my teenage son with his anxiety and panic disorder! It was like a miracle it went from 15 attacks a day to attack free\nThank you very much!", sourceNote:"Previously published on the clinic’s live Wix site.", consentConfirmed:false, displayOrder:3, published:true },
];

// ── Direct-booking fallbacks ───────────────────────────────────────────────
// These mirror the CMS seed rows (scripts/wix-seed.mjs) so pages/routes still
// work if a Wix read fails. Real Google Calendar ids are confirmed values —
// see agent-context/WIP/agent_21/PLAN.md.

const bookable = (key: string, label: string, order: number): BookableService =>
  ({ id:`fallback-svc-${key}`, key, label, allowsFirstTime:true, allowsExisting:true, displayOrder:order, active:true });
export const FALLBACK_BOOKABLE_SERVICES: BookableService[] = [
  bookable("acupuncture","Acupuncture",1),
  bookable("cupping","Cupping Therapy",2),
  bookable("herbal","Herbal Medicine",3),
  bookable("met","Medical Massage (MET)",4),
];

const calCfg = (category: string, label: string, googleCalendarId: string, countsAsBusy: boolean, order: number): CalendarConfigEntry =>
  ({ id:`fallback-cal-${category}`, category, label, googleCalendarId, countsAsBusy, active:true, displayOrder:order });
export const FALLBACK_CALENDAR_CONFIG: CalendarConfigEntry[] = [
  calCfg("NEW_PATIENT","New Patient","05f0e2b82241b7ae61d3bc426bf5644785048ddeb1ba8ea5688003eb3680d123@group.calendar.google.com",true,1),
  calCfg("ACUPUNCTURE","Acupuncture","marinholyhillacu@gmail.com",true,2),
  calCfg("CA_VA_HERB_ETC","CA, VA, Herb, Etc.","633c5c3d44a76886ce997c136d28a2067b2cde47f2eef0349a0326d815086ce0@group.calendar.google.com",true,3),
  calCfg("INSURANCE","Insurance","5dd73177b27637183694425f7352a0ce939d6215049a4b178ac3d3686e208d3f@group.calendar.google.com",true,4),
  calCfg("RESCHEDULE","Reschedule","9df651109780d417ae5296e5ea10331368b7301bb1298f8c9c90432e48e44ba6@group.calendar.google.com",true,5),
];

const hours = (location: string, weekday: number, openTime: string, closeTime: string): BusinessHour =>
  ({ id:`fallback-hours-${location}-${weekday}`, location, weekday, openTime, closeTime, active:true });
export const FALLBACK_BUSINESS_HOURS: BusinessHour[] = [
  hours("mesa",1,"08:30","18:00"), hours("mesa",2,"08:30","18:00"), hours("mesa",3,"08:30","18:00"),
  hours("mesa",4,"08:30","18:00"), hours("mesa",5,"08:30","18:00"), hours("mesa",6,"09:00","16:00"),
  // Sunday (0) closed = no row. Payson hours not supplied.
];

export const FALLBACK_CLOSURES: Closure[] = [];

export const FALLBACK_BOOKING_SETTINGS: BookingSettings = {
  slotMinutes: 15,
  minLeadMinutes: 120,
  maxAdvanceDays: 45,
  cancellationPolicyText: "For cancellations, please contact us 24 hours in advance.",
};
