const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native-voice',
  'voice',
  'android',
  'build.gradle'
);

const fixedGradle = `apply plugin: 'com.android.library'

repositories {
    mavenLocal()
    google()
    mavenCentral()
    maven {
        // For developing the library outside the context of the example app, expect \`react-native\`
        // to be installed at \`./node_modules\`.
        url "$projectDir/../node_modules/react-native/android"
    }
    maven {
        // For developing the example app.
        url "$projectDir/../../react-native/android"
    }
}

def DEFAULT_COMPILE_SDK_VERSION = 28
def DEFAULT_BUILD_TOOLS_VERSION = "28.0.3"
def DEFAULT_TARGET_SDK_VERSION = 28
def DEFAULT_ANDROIDX_APPCOMPAT_VERSION = "1.7.0"

android {
    namespace "com.wenkesj.voice"
    compileSdk rootProject.ext.has('compileSdkVersion') ? rootProject.ext.compileSdkVersion : DEFAULT_COMPILE_SDK_VERSION
    buildToolsVersion rootProject.ext.has('buildToolsVersion') ? rootProject.ext.buildToolsVersion : DEFAULT_BUILD_TOOLS_VERSION

    defaultConfig {
        minSdkVersion rootProject.ext.has('minSdkVersion') ? rootProject.ext.minSdkVersion : 15
        targetSdkVersion rootProject.ext.has('targetSdkVersion') ? rootProject.ext.targetSdkVersion : DEFAULT_TARGET_SDK_VERSION
        versionCode 1
        versionName "1.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

buildscript {
    if (project == rootProject) {
        repositories {
            google()
            mavenCentral()
        }
        dependencies {
            classpath 'com.android.tools.build:gradle:3.3.2'

            // NOTE: Do not place your application dependencies here; they belong
            // in the individual module build.gradle files
        }
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

def appCompatVersion = rootProject.ext.has('androidxAppCompatVersion') ? rootProject.ext.androidxAppCompatVersion : DEFAULT_ANDROIDX_APPCOMPAT_VERSION

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    testImplementation 'junit:junit:4.12'
    implementation "androidx.appcompat:appcompat:\${appCompatVersion}"
    implementation 'com.facebook.react:react-native:+'
}
`;

if (!fs.existsSync(targetPath)) {
  console.warn(`[postinstall] Skipping fix: file not found at ${targetPath}`);
  process.exit(0);
}

const current = fs.readFileSync(targetPath, 'utf8');
if (current === fixedGradle) {
  console.log('[postinstall] react-native-voice Android Gradle fix already applied');
  process.exit(0);
}

fs.writeFileSync(targetPath, fixedGradle);
console.log('[postinstall] Applied react-native-voice Android Gradle fix');
