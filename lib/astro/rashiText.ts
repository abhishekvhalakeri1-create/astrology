/**
 * Wording for the rashi-phala pages. The judgement itself (which houses are favourable) comes from gochar.ts;
 * this file only says, in three languages, what the tradition expects of the Moon in each house from the
 * natal Moon sign (Chandra gochara, as given in Phaladeepika and the printed panchangas).
 */
import type { Element } from './zodiac';
import type { Tri } from './names';

/** Index 0 = Moon in the 1st from the rashi … index 11 = in the 12th. */
export const MOON_HOUSE_TEXT: readonly Tri[] = [
  {
    en: 'The Moon is in your own rashi. A day for comfort, good food and attending to yourself; the mind is settled.',
    hi: 'चंद्र आपकी अपनी राशि में है। आराम, अच्छे भोजन और अपना ध्यान रखने का दिन; मन स्थिर रहता है।',
    kn: 'ಚಂದ್ರ ನಿಮ್ಮದೇ ರಾಶಿಯಲ್ಲಿದ್ದಾನೆ. ವಿಶ್ರಾಂತಿ, ಒಳ್ಳೆಯ ಊಟ ಮತ್ತು ನಿಮ್ಮ ಕಡೆ ಗಮನ ಕೊಡುವ ದಿನ; ಮನಸ್ಸು ಸ್ಥಿರವಾಗಿರುತ್ತದೆ.',
  },
  {
    en: 'Keep an eye on spending and on sharp words at home. Not the day for money decisions.',
    hi: 'खर्च और घर में कड़वे बोल पर ध्यान रखें। धन संबंधी निर्णय का दिन नहीं।',
    kn: 'ಖರ್ಚು ಮತ್ತು ಮನೆಯಲ್ಲಿ ಕಟು ಮಾತಿನ ಬಗ್ಗೆ ಎಚ್ಚರ. ಹಣದ ನಿರ್ಧಾರಗಳಿಗೆ ಇದು ದಿನವಲ್ಲ.',
  },
  {
    en: 'Courage and initiative come easily. Good for short journeys, messages and starting what you have been postponing.',
    hi: 'साहस और पहल सहज आती है। छोटी यात्रा, संदेश और टाले हुए काम शुरू करने के लिए अच्छा।',
    kn: 'ಧೈರ್ಯ ಮತ್ತು ಉತ್ಸಾಹ ಸಹಜವಾಗಿ ಬರುತ್ತದೆ. ಸಣ್ಣ ಪ್ರಯಾಣ, ಸಂದೇಶ ಮತ್ತು ಮುಂದೂಡಿದ ಕೆಲಸ ಆರಂಭಿಸಲು ಒಳ್ಳೆಯದು.',
  },
  {
    en: 'The mind is a little restless and home matters ask for attention. Keep the day simple.',
    hi: 'मन थोड़ा बेचैन रहता है और घर के मामले ध्यान माँगते हैं। दिन को सरल रखें।',
    kn: 'ಮನಸ್ಸು ಸ್ವಲ್ಪ ಚಂಚಲ; ಮನೆಯ ವಿಷಯಗಳು ಗಮನ ಕೇಳುತ್ತವೆ. ದಿನವನ್ನು ಸರಳವಾಗಿಡಿ.',
  },
  {
    en: 'Thoughts scatter and plans meet small obstacles. Leave speculation alone; time with children or study steadies you.',
    hi: 'विचार बिखरते हैं और योजनाओं में छोटी रुकावटें आती हैं। सट्टे से बचें; बच्चों के साथ समय या अध्ययन मन को स्थिर करता है।',
    kn: 'ಆಲೋಚನೆಗಳು ಚದುರುತ್ತವೆ, ಯೋಜನೆಗಳಿಗೆ ಸಣ್ಣ ಅಡೆತಡೆ. ಊಹಾತ್ಮಕ ಹೂಡಿಕೆ ಬೇಡ; ಮಕ್ಕಳೊಂದಿಗೆ ಸಮಯ ಅಥವಾ ಅಧ್ಯಯನ ಮನಸ್ಸನ್ನು ಸ್ಥಿರಗೊಳಿಸುತ್ತದೆ.',
  },
  {
    en: 'Good for clearing dues, facing rivals and looking after your health. Work gets done.',
    hi: 'बकाया निपटाने, विरोधियों का सामना करने और स्वास्थ्य की देखभाल के लिए अच्छा। काम पूरे होते हैं।',
    kn: 'ಬಾಕಿ ತೀರಿಸಲು, ವಿರೋಧಿಗಳನ್ನು ಎದುರಿಸಲು ಮತ್ತು ಆರೋಗ್ಯ ನೋಡಿಕೊಳ್ಳಲು ಒಳ್ಳೆಯದು. ಕೆಲಸಗಳು ಮುಗಿಯುತ್ತವೆ.',
  },
  {
    en: 'Pleasant company and cooperation. Good for meetings, partnerships and time with your spouse.',
    hi: 'सुखद संगति और सहयोग। मुलाक़ात, साझेदारी और जीवनसाथी के साथ समय के लिए अच्छा।',
    kn: 'ಹಿತವಾದ ಸಹವಾಸ ಮತ್ತು ಸಹಕಾರ. ಭೇಟಿ, ಪಾಲುದಾರಿಕೆ ಮತ್ತು ಸಂಗಾತಿಯೊಂದಿಗೆ ಸಮಯಕ್ಕೆ ಒಳ್ಳೆಯದು.',
  },
  {
    en: 'Chandrashtama: the Moon is eighth from your rashi. Avoid major decisions, signing and arguments for these two days; routine work is fine.',
    hi: 'चंद्राष्टम: चंद्र आपकी राशि से आठवाँ है। इन दो दिनों में बड़े निर्णय, हस्ताक्षर और बहस से बचें; रोज़ का काम ठीक है।',
    kn: 'ಚಂದ್ರಾಷ್ಟಮ: ಚಂದ್ರ ನಿಮ್ಮ ರಾಶಿಯಿಂದ ಎಂಟನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ. ಈ ಎರಡು ದಿನ ದೊಡ್ಡ ನಿರ್ಧಾರ, ಸಹಿ ಮತ್ತು ವಾದಗಳನ್ನು ತಪ್ಪಿಸಿ; ದೈನಂದಿನ ಕೆಲಸಕ್ಕೆ ತೊಂದರೆಯಿಲ್ಲ.',
  },
  {
    en: 'Efforts feel heavier than usual and elders or officials may be slow to agree. Be patient; a temple visit suits the day.',
    hi: 'प्रयास सामान्य से भारी लगते हैं और बड़े-बुज़ुर्ग या अधिकारी देर से मानते हैं। धैर्य रखें; मंदिर दर्शन इस दिन अनुकूल है।',
    kn: 'ಪ್ರಯತ್ನಗಳು ಎಂದಿಗಿಂತ ಭಾರವೆನಿಸುತ್ತವೆ; ಹಿರಿಯರು ಅಥವಾ ಅಧಿಕಾರಿಗಳು ಒಪ್ಪಲು ತಡ ಮಾಡಬಹುದು. ತಾಳ್ಮೆ ಇರಲಿ; ದೇವಸ್ಥಾನ ದರ್ಶನ ಈ ದಿನಕ್ಕೆ ಹೊಂದುತ್ತದೆ.',
  },
  {
    en: 'Work is noticed. Good for professional matters and for meeting people in authority.',
    hi: 'काम की सराहना होती है। व्यावसायिक मामलों और अधिकारियों से मिलने के लिए अच्छा।',
    kn: 'ಕೆಲಸಕ್ಕೆ ಮನ್ನಣೆ ಸಿಗುತ್ತದೆ. ವೃತ್ತಿ ವಿಷಯಗಳಿಗೆ ಮತ್ತು ಅಧಿಕಾರಿಗಳ ಭೇಟಿಗೆ ಒಳ್ಳೆಯದು.',
  },
  {
    en: 'Gains, good news and the company of friends. A good day to ask for what you want.',
    hi: 'लाभ, शुभ समाचार और मित्रों का साथ। जो चाहते हैं वह माँगने का अच्छा दिन।',
    kn: 'ಲಾಭ, ಶುಭ ಸುದ್ದಿ ಮತ್ತು ಸ್ನೇಹಿತರ ಸಹವಾಸ. ಬೇಕಾದ್ದನ್ನು ಕೇಳಲು ಒಳ್ಳೆಯ ದಿನ.',
  },
  {
    en: 'Expenses and tiredness. Rest, avoid lending and keep travel plans flexible.',
    hi: 'खर्च और थकान। आराम करें, उधार देने से बचें और यात्रा की योजना लचीली रखें।',
    kn: 'ಖರ್ಚು ಮತ್ತು ಆಯಾಸ. ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಸಾಲ ಕೊಡಬೇಡಿ, ಪ್ರಯಾಣದ ಯೋಜನೆ ಸಡಿಲವಾಗಿರಲಿ.',
  },
];

export const ELEMENT: Record<Element, Tri> = {
  fire: { en: 'Agni (fire)', hi: 'अग्नि', kn: 'ಅಗ್ನಿ' },
  earth: { en: 'Prithvi (earth)', hi: 'पृथ्वी', kn: 'ಪೃಥ್ವಿ' },
  air: { en: 'Vayu (air)', hi: 'वायु', kn: 'ವಾಯು' },
  water: { en: 'Jala (water)', hi: 'जल', kn: 'ಜಲ' },
};

export const FAVOURABLE: Tri = { en: 'Favourable', hi: 'अनुकूल', kn: 'ಅನುಕೂಲ' };
export const NEEDS_CARE: Tri = { en: 'Go gently', hi: 'संभलकर चलें', kn: 'ಎಚ್ಚರಿಕೆಯಿಂದ ಇರಿ' };
export const CHANDRASHTAMA: Tri = { en: 'Chandrashtama', hi: 'चंद्राष्टम', kn: 'ಚಂದ್ರಾಷ್ಟಮ' };
