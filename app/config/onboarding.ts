import { ImageSourcePropType } from "react-native"
import type { TxKeyPath } from "@/i18n"

// Importe as imagens localmente
const images = {
  overview: require("../../assets/images/logo.png"),
  meal_plan: require("../../assets/images/onboarding/meal.png"),
  workout_plan: require("../../assets/images/onboarding/workout.png"),
  liquid_intake: require("../../assets/images/onboarding/water_bottle.png"),
  intermittent_fasting: require("../../assets/images/onboarding/intermittent_fasting.png"),
  mental_health: require("../../assets/images/onboarding/mental_health.png"),
  cardiology: require("../../assets/images/onboarding/cardiology.png"),
  medication: require("../../assets/images/onboarding/medication.png"),
} as const

export interface OnboardingStep {
  image: ImageSourcePropType
  titleTx: TxKeyPath
  descriptionTx: TxKeyPath
}

export const onboardingSteps: OnboardingStep[] = [
  {
    image: images.overview,
    titleTx: "onboarding:overview.title",
    descriptionTx: "onboarding:overview.description",
  },
  {
    image: images.meal_plan,
    titleTx: "onboarding:meal_plan.title",
    descriptionTx: "onboarding:meal_plan.description",
  },
  {
    image: images.workout_plan,
    titleTx: "onboarding:workout_plan.title",
    descriptionTx: "onboarding:workout_plan.description",
  },
  {
    image: images.liquid_intake,
    titleTx: "onboarding:liquid_intake.title",
    descriptionTx: "onboarding:liquid_intake.description",
  },
  {
    image: images.intermittent_fasting,
    titleTx: "onboarding:intermittent_fasting.title",
    descriptionTx: "onboarding:intermittent_fasting.description",
  },
  {
    image: images.mental_health,
    titleTx: "onboarding:mental_health.title",
    descriptionTx: "onboarding:mental_health.description",
  },
  {
    image: images.cardiology,
    titleTx: "onboarding:cardiology.title",
    descriptionTx: "onboarding:cardiology.description",
  },
  {
    image: images.medication,
    titleTx: "onboarding:medication.title",
    descriptionTx: "onboarding:medication.description",
  },
] as const
