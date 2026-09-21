# ============================================================
# ResidenceConnect - R8 / ProGuard
# ============================================================

# Keep generic type information and annotations used by
# reflection / Retrofit / Gson.
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keepattributes RuntimeVisibleAnnotations
-keepattributes RuntimeInvisibleAnnotations
-keepattributes AnnotationDefault

# ============================================================
# react-native-config
# ============================================================

-keepclassmembers class **.BuildConfig {
    public static <fields>;
}

# ============================================================
# Gson
# ============================================================

-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ============================================================
# Retrofit
# ============================================================

-if interface *
-keep,allowobfuscation,allowshrinking,allowoptimization interface <1>

# ============================================================
# JNI / Native methods
# ============================================================

-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# ============================================================
# TTLock
# ============================================================

# Start WITHOUT broad TTLock keep rules.
#
# If the release build shows a TTLock runtime problem,
# add only the specific TTLock classes/members required.