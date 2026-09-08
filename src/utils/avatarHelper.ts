// Centralized neutral demo avatars for SkillTrack trainees
// Generates visually distinct, professional vector avatars for male and female trainees
// without using real identifiable people's photographs.

const createSvgDataUrl = (svgString: string): string => {
  const cleaned = svgString.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
};

// Priya Sharma - Female (Web Development)
export const AVATAR_PRIYA = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYDl7DVzFJDJ9TdC3C_Dxq99aNEZIgxo5JA6EohjlBBKTD6ZlTPF7dHgP-xNyVxpP-G6E1Jg6hElJU0_Hgo18b0YdrFYF5_N3XNEGGb6y628Ra_IWbCYARYCIieenOtPvL8QKnbst_G1ncJ2gkKjPGR_ZedU1WbFTLpdkX7hGsweobiVMjn6Ju7wDaYgOovVlq2jzevc9MdthNbKAPCqZEwvrOMBUPon45Y1V3y2g0nNsnirwFAZLf';

// Rahul Patil - Male (Data Entry & Office Admin)
export const AVATAR_RAHUL = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_rahul" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E0E7FF" />
      <stop offset="100%" stop-color="#C7D2FE" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg_rahul)" />
  <!-- Shoulders & Collared Shirt -->
  <path d="M22 120 C22 96 38 84 60 84 C82 84 98 96 98 120 Z" fill="#1E3A8A" />
  <path d="M48 84 L60 102 L72 84 Z" fill="#DBEAFE" />
  <path d="M60 102 L60 120" stroke="#93C5FD" stroke-width="2" />
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="18" rx="4" fill="#E8B589" />
  <!-- Head / Face -->
  <ellipse cx="60" cy="54" rx="22" ry="26" fill="#F4C79F" />
  <!-- Ears -->
  <circle cx="38" cy="55" r="5" fill="#E8B589" />
  <circle cx="82" cy="55" r="5" fill="#E8B589" />
  <!-- Male Short Professional Hair -->
  <path d="M37 50 C36 34 46 24 60 24 C74 24 84 34 83 50 C80 43 72 38 60 38 C48 38 40 43 37 50 Z" fill="#1E293B" />
  <path d="M37 45 C38 38 42 34 48 32 C44 38 42 44 41 50 Z" fill="#0F172A" />
  <!-- Eyebrows -->
  <path d="M46 45 Q52 43 56 46" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <path d="M64 46 Q68 43 74 45" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <!-- Eyes -->
  <circle cx="51" cy="51" r="2.5" fill="#0F172A" />
  <circle cx="69" cy="51" r="2.5" fill="#0F172A" />
  <!-- Nose -->
  <path d="M60 52 L59 60 L63 60" stroke="#D79E72" stroke-width="2" stroke-linecap="round" fill="none" />
  <!-- Friendly Smile -->
  <path d="M52 66 Q60 72 68 66" stroke="#B45309" stroke-width="2.2" stroke-linecap="round" fill="none" />
</svg>
`);

// Aisha Khan - Female (Digital Marketing)
export const AVATAR_AISHA = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_aisha" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE4E6" />
      <stop offset="100%" stop-color="#FECDD3" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg_aisha)" />
  <!-- Back Hair (shoulder length wavy) -->
  <path d="M34 50 C30 75 32 96 42 108 C46 108 42 85 45 70 Z" fill="#292524" />
  <path d="M86 50 C90 75 88 96 78 108 C74 108 78 85 75 70 Z" fill="#292524" />
  <!-- Shoulders & Coral Blazer -->
  <path d="M22 120 C22 96 38 85 60 85 C82 85 98 96 98 120 Z" fill="#BE123C" />
  <path d="M48 85 L60 106 L72 85 Z" fill="#FFE4E6" />
  <circle cx="60" cy="94" r="2" fill="#F43F5E" />
  <!-- Neck -->
  <rect x="53" y="69" width="14" height="18" rx="3" fill="#E8BA93" />
  <!-- Head / Face -->
  <ellipse cx="60" cy="54" rx="20" ry="24" fill="#F8D3B2" />
  <!-- Ears & Pearl Earrings -->
  <circle cx="40" cy="56" r="4" fill="#E8BA93" />
  <circle cx="80" cy="56" r="4" fill="#E8BA93" />
  <circle cx="39" cy="61" r="2" fill="#FFF" />
  <circle cx="81" cy="61" r="2" fill="#FFF" />
  <!-- Front Hair (wavy center part) -->
  <path d="M38 48 C36 30 46 22 60 22 C74 22 84 30 82 48 C78 36 68 34 60 36 C52 34 42 36 38 48 Z" fill="#292524" />
  <path d="M38 48 C41 55 43 62 42 70 C39 60 38 54 38 48 Z" fill="#1C1917" />
  <path d="M82 48 C79 55 77 62 78 70 C81 60 82 54 82 48 Z" fill="#1C1917" />
  <!-- Eyebrows -->
  <path d="M47 46 Q52 44 56 46" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none" />
  <path d="M64 46 Q68 44 73 46" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none" />
  <!-- Eyes -->
  <circle cx="51" cy="51" r="2.5" fill="#1C1917" />
  <circle cx="69" cy="51" r="2.5" fill="#1C1917" />
  <circle cx="52" cy="50" r="0.8" fill="#FFF" />
  <circle cx="70" cy="50" r="0.8" fill="#FFF" />
  <!-- Nose -->
  <path d="M60 52 L59 58 L62 59" stroke="#DB9F73" stroke-width="1.8" stroke-linecap="round" fill="none" />
  <!-- Warm Rose Lip Smile -->
  <path d="M53 66 Q60 72 67 66" stroke="#BE123C" stroke-width="2.5" stroke-linecap="round" fill="none" />
</svg>
`);

// Amit Deshmukh - Male (Solar PV Installation)
export const AVATAR_AMIT = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_amit" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#DCFCE7" />
      <stop offset="100%" stop-color="#BBF7D0" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg_amit)" />
  <!-- Shoulders & Green Field Tech Jacket -->
  <path d="M22 120 C22 96 38 84 60 84 C82 84 98 96 98 120 Z" fill="#15803D" />
  <path d="M46 84 L60 104 L74 84 Z" fill="#F0FDF4" />
  <rect x="58" y="104" width="4" height="16" fill="#166534" />
  <circle cx="42" cy="100" r="3" fill="#86EFAC" />
  <!-- Neck -->
  <rect x="52" y="69" width="16" height="18" rx="4" fill="#E2A676" />
  <!-- Head / Face -->
  <ellipse cx="60" cy="53" rx="22" ry="25" fill="#EEB78A" />
  <!-- Ears -->
  <circle cx="38" cy="54" r="5" fill="#E2A676" />
  <circle cx="82" cy="54" r="5" fill="#E2A676" />
  <!-- Male Side-Parted Styled Hair -->
  <path d="M37 48 C36 32 46 22 60 22 C75 22 84 32 83 48 C81 40 73 34 60 34 C47 34 39 40 37 48 Z" fill="#3B2F2F" />
  <path d="M40 36 C46 28 58 28 65 30 C58 35 48 37 40 36 Z" fill="#241B1B" />
  <!-- Eyebrows -->
  <path d="M45 44 Q51 42 56 44" stroke="#241B1B" stroke-width="2.5" stroke-linecap="round" fill="none" />
  <path d="M64 44 Q69 42 75 44" stroke="#241B1B" stroke-width="2.5" stroke-linecap="round" fill="none" />
  <!-- Eyes -->
  <circle cx="50" cy="50" r="2.6" fill="#241B1B" />
  <circle cx="70" cy="50" r="2.6" fill="#241B1B" />
  <!-- Nose -->
  <path d="M60 51 L59 59 L63 59" stroke="#C88553" stroke-width="2" stroke-linecap="round" fill="none" />
  <!-- Mustache / Confident Smile -->
  <path d="M53 64 Q60 62 67 64" stroke="#3B2F2F" stroke-width="1.8" stroke-linecap="round" fill="none" />
  <path d="M54 67 Q60 72 66 67" stroke="#9A3412" stroke-width="2.2" stroke-linecap="round" fill="none" />
</svg>
`);

// Sunita Jadhav - Female (Healthcare General Duty)
export const AVATAR_SUNITA = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_sunita" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#CCFBF1" />
      <stop offset="100%" stop-color="#99F6E4" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg_sunita)" />
  <!-- High Bun Hair (Medical/Clinical Style) -->
  <circle cx="60" cy="22" r="13" fill="#1C1917" />
  <!-- Shoulders & Teal Healthcare Scrubs -->
  <path d="M22 120 C22 96 38 85 60 85 C82 85 98 96 98 120 Z" fill="#0F766E" />
  <path d="M47 85 L60 104 L73 85 Z" fill="#F0FDFA" />
  <!-- Medical Cross Badge -->
  <rect x="36" y="98" width="8" height="2" fill="#CCFBF1" rx="1" />
  <rect x="39" y="95" width="2" height="8" fill="#CCFBF1" rx="1" />
  <!-- Neck -->
  <rect x="53" y="69" width="14" height="18" rx="3" fill="#E3AE81" />
  <!-- Head / Face -->
  <ellipse cx="60" cy="53" rx="20" ry="24" fill="#F4C79F" />
  <!-- Ears & Studs -->
  <circle cx="40" cy="55" r="4" fill="#E3AE81" />
  <circle cx="80" cy="55" r="4" fill="#E3AE81" />
  <circle cx="40" cy="55" r="1.5" fill="#14B8A6" />
  <circle cx="80" cy="55" r="1.5" fill="#14B8A6" />
  <!-- Front Hair (neat swept back) -->
  <path d="M40 46 C39 30 48 24 60 24 C72 24 81 30 80 46 C76 36 68 34 60 34 C52 34 44 36 40 46 Z" fill="#1C1917" />
  <!-- Eyebrows -->
  <path d="M47 45 Q52 43 56 45" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none" />
  <path d="M64 45 Q68 43 73 45" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none" />
  <!-- Eyes -->
  <circle cx="51" cy="50" r="2.5" fill="#1C1917" />
  <circle cx="69" cy="50" r="2.5" fill="#1C1917" />
  <circle cx="52" cy="49" r="0.8" fill="#FFF" />
  <circle cx="70" cy="49" r="0.8" fill="#FFF" />
  <!-- Nose -->
  <path d="M60 51 L59 58 L62 58" stroke="#D18F5B" stroke-width="1.8" stroke-linecap="round" fill="none" />
  <!-- Kind Empathetic Smile -->
  <path d="M53 65 Q60 70 67 65" stroke="#B45309" stroke-width="2.2" stroke-linecap="round" fill="none" />
</svg>
`);

// Vikram Singh - Male (Full Stack Development)
export const AVATAR_VIKRAM = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_vikram" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EEF2FF" />
      <stop offset="100%" stop-color="#E0E7FF" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg_vikram)" />
  <!-- Shoulders & Tech Indigo Hoodie / Tee -->
  <path d="M22 120 C22 96 38 84 60 84 C82 84 98 96 98 120 Z" fill="#4338CA" />
  <circle cx="60" cy="98" r="14" fill="#312E81" />
  <path d="M50 84 C50 94 70 94 70 84 Z" fill="#EEF2FF" />
  <!-- Neck -->
  <rect x="52" y="69" width="16" height="18" rx="4" fill="#DFA87C" />
  <!-- Head / Face -->
  <ellipse cx="60" cy="53" rx="21" ry="25" fill="#F1BC91" />
  <!-- Ears -->
  <circle cx="39" cy="54" r="5" fill="#DFA87C" />
  <circle cx="81" cy="54" r="5" fill="#DFA87C" />
  <!-- Modern Spiked / Textured Cut -->
  <path d="M38 46 C36 30 46 20 60 20 C74 20 84 30 82 46 C80 38 72 32 60 32 C48 32 40 38 38 46 Z" fill="#18181B" />
  <path d="M50 20 L54 14 L58 20 L64 13 L68 20" stroke="#18181B" stroke-width="4" stroke-linejoin="round" fill="none" />
  <!-- Modern Tech Developer Glasses -->
  <rect x="44" y="46" width="13" height="10" rx="2" fill="none" stroke="#1E1B4B" stroke-width="2" />
  <rect x="63" y="46" width="13" height="10" rx="2" fill="none" stroke="#1E1B4B" stroke-width="2" />
  <line x1="57" y1="50" x2="63" y2="50" stroke="#1E1B4B" stroke-width="2" />
  <!-- Eyes behind glasses -->
  <circle cx="50" cy="51" r="2.2" fill="#18181B" />
  <circle cx="70" cy="51" r="2.2" fill="#18181B" />
  <!-- Nose -->
  <path d="M60 52 L59 59 L63 59" stroke="#C58554" stroke-width="2" stroke-linecap="round" fill="none" />
  <!-- Confident Smile & Trimmed Beard Outline -->
  <path d="M53 66 Q60 71 67 66" stroke="#9A3412" stroke-width="2" stroke-linecap="round" fill="none" />
  <path d="M48 64 C50 75 70 75 72 64" stroke="#18181B" stroke-width="1.8" stroke-linecap="round" fill="none" stroke-dasharray="2,2" />
</svg>
`);

// Neha Gupta - Female (UI/UX & Web Development)
export const AVATAR_NEHA = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_neha" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F3E8FF" />
      <stop offset="100%" stop-color="#E9D5FF" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg_neha)" />
  <!-- Chic Bob Haircut with Bangs (UI/UX Designer Style) -->
  <path d="M34 50 C32 70 34 82 38 90 C42 90 40 70 42 56 Z" fill="#2E1065" />
  <path d="M86 50 C88 70 86 82 82 90 C78 90 80 70 78 56 Z" fill="#2E1065" />
  <!-- Shoulders & Violet Cardigan -->
  <path d="M22 120 C22 96 38 85 60 85 C82 85 98 96 98 120 Z" fill="#7E22CE" />
  <path d="M48 85 L60 105 L72 85 Z" fill="#FAF5FF" />
  <!-- Neck -->
  <rect x="53" y="69" width="14" height="18" rx="3" fill="#E8B58D" />
  <!-- Head / Face -->
  <ellipse cx="60" cy="54" rx="20" ry="24" fill="#FADBC0" />
  <!-- Ears & Modern Geometric Earrings -->
  <circle cx="40" cy="56" r="4" fill="#E8B58D" />
  <circle cx="80" cy="56" r="4" fill="#E8B58D" />
  <polygon points="40,62 38,66 42,66" fill="#A855F7" />
  <polygon points="80,62 78,66 82,66" fill="#A855F7" />
  <!-- Front Hair & Designer Fringe -->
  <path d="M36 48 C34 32 46 22 60 22 C74 22 86 32 84 48 C82 38 74 36 60 36 C46 36 38 38 36 48 Z" fill="#2E1065" />
  <path d="M42 38 C48 42 54 42 60 38 C66 42 72 42 78 38 C74 44 46 44 42 38 Z" fill="#3B0764" />
  <!-- Round Designer Glasses -->
  <circle cx="50" cy="51" r="7" fill="none" stroke="#6B21A8" stroke-width="1.8" />
  <circle cx="70" cy="51" r="7" fill="none" stroke="#6B21A8" stroke-width="1.8" />
  <line x1="57" y1="51" x2="63" y2="51" stroke="#6B21A8" stroke-width="1.8" />
  <!-- Eyes -->
  <circle cx="50" cy="51" r="2.2" fill="#2E1065" />
  <circle cx="70" cy="51" r="2.2" fill="#2E1065" />
  <circle cx="51" cy="50" r="0.7" fill="#FFF" />
  <circle cx="71" cy="50" r="0.7" fill="#FFF" />
  <!-- Nose -->
  <path d="M60 52 L59 58 L62 58" stroke="#DB9A6B" stroke-width="1.8" stroke-linecap="round" fill="none" />
  <!-- Bright Smile -->
  <path d="M53 66 Q60 71 67 66" stroke="#9333EA" stroke-width="2.4" stroke-linecap="round" fill="none" />
</svg>
`);

// Rajesh Kumar - Male (Electrician & Power Sector)
export const AVATAR_RAJESH = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_rajesh" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FEF3C7" />
      <stop offset="100%" stop-color="#FDE68A" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg_rajesh)" />
  <!-- Shoulders & Amber Utility Work Shirt (Electrical Apprentice) -->
  <path d="M22 120 C22 96 38 84 60 84 C82 84 98 96 98 120 Z" fill="#D97706" />
  <path d="M46 84 L60 102 L74 84 Z" fill="#FFFBEB" />
  <line x1="60" y1="102" x2="60" y2="120" stroke="#B45309" stroke-width="2" />
  <!-- ID Badge -->
  <rect x="72" y="96" width="14" height="10" rx="2" fill="#FEF3C7" stroke="#92400E" stroke-width="1" />
  <!-- Neck -->
  <rect x="52" y="69" width="16" height="18" rx="4" fill="#D99B6A" />
  <!-- Head / Face -->
  <ellipse cx="60" cy="53" rx="22" ry="25" fill="#ECB183" />
  <!-- Ears -->
  <circle cx="38" cy="54" r="5" fill="#D99B6A" />
  <circle cx="82" cy="54" r="5" fill="#D99B6A" />
  <!-- Short Neat Haircut -->
  <path d="M37 48 C36 32 46 22 60 22 C74 22 84 32 83 48 C80 40 72 35 60 35 C48 35 40 40 37 48 Z" fill="#18181B" />
  <!-- Eyebrows -->
  <path d="M45 44 Q51 42 56 44" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none" />
  <path d="M64 44 Q69 42 75 44" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none" />
  <!-- Eyes -->
  <circle cx="50" cy="50" r="2.5" fill="#18181B" />
  <circle cx="70" cy="50" r="2.5" fill="#18181B" />
  <!-- Nose -->
  <path d="M60 51 L59 59 L63 59" stroke="#C07C4A" stroke-width="2" stroke-linecap="round" fill="none" />
  <!-- Cheerful Resilient Smile -->
  <path d="M53 66 Q60 72 67 66" stroke="#B45309" stroke-width="2.4" stroke-linecap="round" fill="none" />
</svg>
`);

// Map of canonical trainee IDs to their dedicated avatars
export const TRAINEE_AVATAR_MAP: Record<string, string> = {
  ST1001: AVATAR_PRIYA,
  ST1002: AVATAR_RAHUL,
  ST1003: AVATAR_AISHA,
  ST1004: AVATAR_AMIT,
  ST1005: AVATAR_SUNITA,
  ST1006: AVATAR_VIKRAM,
  ST1007: AVATAR_NEHA,
  ST1008: AVATAR_RAJESH,
};

// Fallback collections for dynamically created trainees
export const DEMO_FEMALE_AVATARS = [AVATAR_PRIYA, AVATAR_AISHA, AVATAR_SUNITA, AVATAR_NEHA];
export const DEMO_MALE_AVATARS = [AVATAR_RAHUL, AVATAR_AMIT, AVATAR_VIKRAM, AVATAR_RAJESH];

/**
 * Returns a visually appropriate, deterministic avatar image URL for any trainee
 * Guaranteed to never return undefined or a single static fallback.
 */
export function getTraineeAvatar(trainee?: {
  id?: string;
  gender?: 'Female' | 'Male' | 'Other' | string;
  profileImage?: string;
  photoUrl?: string;
  avatar?: string;
}): string {
  if (!trainee) return AVATAR_RAHUL;

  // 1. Explicit profileImage / photoUrl / avatar if set and valid
  if (trainee.profileImage && trainee.profileImage.trim().length > 0) {
    return trainee.profileImage;
  }
  if (trainee.photoUrl && trainee.photoUrl.trim().length > 0) {
    return trainee.photoUrl;
  }
  if (trainee.avatar && trainee.avatar.trim().length > 0) {
    return trainee.avatar;
  }

  // 2. ID-based direct lookup in canonical dataset map
  if (trainee.id && TRAINEE_AVATAR_MAP[trainee.id]) {
    return TRAINEE_AVATAR_MAP[trainee.id];
  }

  // 3. Deterministic gender-based assignment
  const idNum = trainee.id ? (parseInt(trainee.id.replace(/\D/g, ''), 10) || 0) : 0;
  if (trainee.gender === 'Female') {
    return DEMO_FEMALE_AVATARS[idNum % DEMO_FEMALE_AVATARS.length];
  }
  return DEMO_MALE_AVATARS[idNum % DEMO_MALE_AVATARS.length];
}
