import React from "react";
import {
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from "./OnboardingScreens.styles";

function OnboardingStep({
  backgroundColor,
  imageSource,
  title,
  description,
  onPress,
}: any) {
  const { width, height } = useWindowDimensions();
  const isCompactHeight = height <= 720;
  const isCompactWidth = width <= 360;
  const imageHeight = Math.min(340, Math.max(220, height * 0.38));
  const titleFontSize = isCompactWidth ? 30 : 36;
  const descriptionFontSize = isCompactWidth ? 16 : 18;

  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        {
          backgroundColor,
          minHeight: height,
          paddingHorizontal: isCompactWidth ? 18 : 24,
          paddingTop: isCompactHeight ? 16 : 24,
          paddingBottom: isCompactHeight ? 18 : 24,
        },
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.image,
          {
            height: imageHeight,
            marginTop: isCompactHeight ? 16 : 36,
          },
        ]}
        resizeMode="contain"
      />

      <Text
        style={[
          styles.title,
          {
            fontSize: titleFontSize,
            lineHeight: Math.round(titleFontSize * 1.3),
            letterSpacing: titleFontSize * 0.05,
            marginTop: isCompactHeight ? 18 : 24,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.desc,
          {
            fontSize: descriptionFontSize,
            lineHeight: Math.round(descriptionFontSize * 1.3),
            marginTop: isCompactHeight ? 14 : 18,
            marginRight: isCompactWidth ? 12 : 24,
          },
        ]}
      >
        {description}
      </Text>

      <TouchableOpacity
        style={[
          styles.arrowBtn,
          {
            marginTop: isCompactHeight ? 24 : 32,
          },
        ]}
        onPress={onPress}
      >
        <Text style={styles.arrowText}>{">"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function DetailsStepOne({ navigation }: any) {
  return (
    <OnboardingStep
      backgroundColor="#F6C636"
      imageSource={require("../../../../assets/Detail1.png")}
      title={"Smart Living.\nSimplified."}
      description="Manage your home, security, payments, and community-all in one place."
      onPress={() => navigation.navigate("StepTwo")}
    />
  );
}

export function DetailsStepTwo({ navigation }: any) {
  return (
    <OnboardingStep
      backgroundColor="#88D8DF"
      imageSource={require("../../../../assets/Detail2.png")}
      title={"Secure. Connected.\nIn Control."}
      description="Smart access, real-time alerts, and complete residential management at your fingertips."
      onPress={() => navigation.navigate("StepThree")}
    />
  );
}

export function DetailsStepThree({ navigation }: any) {
  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    navigation.replace("Login");
  };

  return (
    <OnboardingStep
      backgroundColor="#F4D4E1"
      imageSource={require("../../../../assets/Detail3.png")}
      title={"Your Home.\nSmarter Than Ever."}
      description="Unlock doors, manage parking, raise requests, and stay connected securely."
      onPress={finishOnboarding}
    />
  );
}
