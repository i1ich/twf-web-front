import { LOCALES } from "../locale";

import { forPlayersSectionEn } from "./home-page/sections/for-players-section";
import { forTutorsSectionEn } from "./home-page/sections/for-tutors-section";
import { heroSectionEn } from "./home-page/sections/hero-section";
import { navigationBarEn } from "./layouts/navigation-bar";
import { ratingsSectionEn } from "./home-page/sections/ratings-section";
import { workFieldsGraphEn } from "./components/work-fields-graph";

export default {
  [LOCALES.ENGLISH]: {
    ...workFieldsGraphEn,
    "demo.languageSwitcher": "Language switch demo",
    "demo.fetchAvatar": "Fetch user's avatar",
    ...forPlayersSectionEn,
    ...forTutorsSectionEn,
    ...heroSectionEn,
    ...navigationBarEn,
    ...ratingsSectionEn,
  },
};
