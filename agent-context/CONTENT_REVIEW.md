# Content Review — Marin Holy Hill Acupuncture

Every medical, insurance, pricing, credential, promotional, and testimonial line remains draft until Dr. Kang approves it. “Published wording” below summarizes the wording implemented in code/CMS; it is not a claim of clinical approval.

| Page | Source | Published wording / treatment | Softened, dropped, or review item | Approval |
|---|---|---|---|---|
| `/` | `PROJECT_CONTEXT.md` §6–7.1; v1 ¶100–368; live testimonials | Third-generation, 28-year, individualized-care overview; testimonial section remains hidden until both `published` and `consentConfirmed` are true | No “root-cause healing,” cure, instant, or guaranteed-result claims; testimonial quotes are retained in CMS but not rendered without explicit consent | Pending |
| `/dr-kang` | v2 ¶30–44; `PROJECT_CONTEXT.md` §6–7.2 | Education stated as Master’s completed and doctoral studies pursued; pulse diagnosis/palpation described as assessment methods; prayer stated as part of practice | Dropped “diagnose unseen internal illnesses,” fundamental healing, cure language, and unconfirmed `Ph.D.`/`DAOM` postnominals | **Credentials pending** |
| `/new-patient` | v2 ¶46–145 | Six visit steps, three guidance phases, general and treatment-specific aftercare | Timelines labeled guidance, not promises; cupping marks described as a temporary local response, not “toxin release” | Pending medical review |
| `/services` | `PROJECT_CONTEXT.md` §7.4; v1 ¶485–574, 630–845 | Nine core services, five specialized-care topics, and three “also available” items | Specialized care explicitly framed as complementary; no unsupported mechanisms or outcomes | Pending |
| `/services/acupuncture` | v1 ¶485–505; context §7.4 | Fine, sterile needles; may support pain management, relaxation, circulation, sleep, and wellbeing | No cure, instant-relief, or side-effect-free claims | Pending |
| `/services/electro-acupuncture` | context §7.4 | Mild electrical stimulation; may support pain, muscles, nerve-related symptoms, swelling, and recovery | No nerve-repair or guaranteed rehabilitation claim | Pending |
| `/services/facial-acupuncture` | v1 ¶630–663; context §7.4 | Cosmetic wellness, relaxation, local circulation, facial tone, texture, and complexion | Not presented as dermatologic treatment; before/after image excluded | Pending |
| `/services/ear-acupuncture` | context §7.4 | Ear points may support relaxation, sleep, cravings, appetite awareness, and pain management | No addiction or weight-loss guarantee | Pending |
| `/services/moxibustion` | v1 ¶536–554; context §7.4 | Traditional warming care that may support circulation, stiffness, digestion, cold sensations, and women’s wellness | No disease cure or guaranteed mechanism | Pending |
| `/services/medical-massage-met` | v1 ¶518–535; context §7.4 | Manual therapy using massage and MET for mobility, muscular balance, and swelling support | No structural correction guarantee | Pending |
| `/services/lymphatic-massage` | context §7.4 | Gentle rhythmic manual care for relaxation and swelling support | Directs unexplained swelling to medical evaluation; no “detox” claim | Pending |
| `/services/herbal-medicine` | v1 ¶555–574; context §7.4 | Individualized traditional formulas; medication/supplement disclosure encouraged | No universal safety or result promise | Pending |
| `/services/auto-injury-care` | v1 ¶664–689; context §7.4 | Integrative recovery support and possible documentation/billing coordination | Baked-text promotional image excluded; no coverage or recovery guarantee | Pending |
| `/services/colds-and-allergies` | v1 ¶690–722 | Seasonal and respiratory comfort support alongside medical care | Red-flag symptoms direct visitors to medical evaluation | Pending |
| `/services/weight-loss-support` | v1 ¶723–747 | Habit, stress, appetite-awareness, and sustainable-routine support | No rapid-loss or guaranteed weight claim | Pending |
| `/services/constipation-support` | v1 ¶748–776 | Digestive-comfort support alongside hydration, nutrition, movement, and medical guidance | Red-flag symptoms called out; no cure claim | Pending |
| `/services/fertility-support` | v1 ¶777–820 | Supportive care alongside an OB-GYN or fertility specialist | Dropped “significantly increases IVF success”; no outcome guarantee | Pending specialist review |
| `/services/oncology-support` | v1 ¶821–845 | Comfort and quality-of-life support with oncology-team coordination | Explicitly not cancer treatment; no antitumor or survival claim | Pending oncology-safety review |
| `/conditions` | `PROJECT_CONTEXT.md` §7.5; v1 ¶585–628 | Six categories and factual one-line listings | No per-condition treatment claims generated | Pending |
| `/conditions/pain-and-injury` | context §7.5; v1 ¶847–864 | Support for comfort, mobility, and recovery; expanded headache guidance | New/severe/changing headaches require medical evaluation | Pending |
| `/conditions/mental-and-emotional` | context §7.5; v1 ¶865–882 | Support for relaxation, rest, resilience, stress, and sleep | Explicitly complements medical and mental-health care; no mental-illness treatment replacement | Pending |
| `/conditions/immune-and-respiratory` | context §7.5 | Seasonal, sinus, and respiratory wellness support | Breathing symptoms and infection remain under medical care | Pending |
| `/conditions/energy-and-digestive` | context §7.5 | Digestive comfort, energy, and lifestyle-pattern support | Persistent symptoms require medical evaluation | Pending |
| `/conditions/womens-health` | context §7.5 | Menstrual, menopausal, and reproductive wellness support | PCOS, fibroids, and fertility remain under appropriate medical/specialist care | Pending |
| `/conditions/skin-and-facial` | context §7.5 | Cosmetic and wellness support for circulation, relaxation, and skin concerns | Does not replace dermatology; no disease-cure claims | Pending |
| `/va-insurance` | v2 ¶152–177, 198–237; context §7.6 | VA prior-authorization flow, “Insurance we work with,” benefit-verification note, draft pricing | `INSURANCE_NETWORK_VERIFIED=false`; UMR not shown in-network; no coverage/reimbursement promise | **VA, payer status, and prices pending** |
| `/contact` | v1 ¶1002–1035; context §5, §7.7 | Mesa details and hours; Payson address/phone with “Opening soon” and no hours; privacy warning | Payson date/hours not invented; structured data includes Mesa only | Pending hours review |

## Global questions to approve

- Confirm whether the Zocdoc URL should retain `isNewPatient=false`, use `true`, or omit the parameter.
- Confirm the public display name and all credential/postnominal wording. The implementation uses “Dr. Hyo-won Kang” and does not print `Ph.D.` or `DAOM` after his name.
- Confirm 28 years of experience and the draft Mesa hours.
- Confirm VA status, every payer relationship, and all pricing.
- Confirm explicit testimonial consent. Quotes remain verbatim from the previously published site; `consentConfirmed` is seeded `false` pending documentation.
- Several approved source images include small baked-in topic labels. They are accepted for launch but should be replaced with original clinic photography when available.
