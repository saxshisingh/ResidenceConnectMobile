import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
};

export default function NoDocumentsIllustration({
  width = 240,
  height = 142,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 680 400">
      <Ellipse cx="180" cy="210" rx="140" ry="120" fill="#EEEDFE" opacity={0.5} />
      <Ellipse cx="500" cy="210" rx="120" ry="100" fill="#E1F5EE" opacity={0.5} />

      <Rect x="218" y="52" width="256" height="324" rx="16" fill="#3C3489" opacity={0.1} />
      <Rect x="212" y="44" width="256" height="324" rx="16" fill="white" stroke="#534AB7" strokeWidth="2" />

      <Polygon points="420,44 468,92 420,92" fill="#EEEDFE" />
      <Path d="M420 44 L468 92 L420 92" fill="none" stroke="#534AB7" strokeWidth="2" />

      <Rect x="212" y="44" width="208" height="48" rx="16" fill="#534AB7" />
      <Rect x="212" y="60" width="208" height="32" fill="#534AB7" />

      <Circle cx="238" cy="68" r="5" fill="#AFA9EC" />
      <Circle cx="256" cy="68" r="5" fill="#AFA9EC" />
      <Circle cx="274" cy="68" r="5" fill="#AFA9EC" />

      <Line x1="236" y1="122" x2="444" y2="122" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="146" x2="444" y2="146" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="170" x2="444" y2="170" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="194" x2="444" y2="194" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="218" x2="444" y2="218" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="242" x2="444" y2="242" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="266" x2="444" y2="266" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="290" x2="444" y2="290" stroke="#EEEDFE" strokeWidth="1.5" />
      <Line x1="236" y1="314" x2="444" y2="314" stroke="#EEEDFE" strokeWidth="1.5" />

      <Circle cx="340" cy="184" r="42" fill="#EEEDFE" stroke="#534AB7" strokeWidth="2" />
      <Circle cx="326" cy="174" r="4" fill="#534AB7" />
      <Circle cx="354" cy="174" r="4" fill="#534AB7" />
      <Path
        d="M326 198 Q340 189 354 198"
        fill="none"
        stroke="#534AB7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <SvgText
        x="340"
        y="252"
        textAnchor="middle"
        fontSize="15"
        fontWeight="500"
        fill="#534AB7"
      >
        No document found
      </SvgText>
      <SvgText
        x="340"
        y="274"
        textAnchor="middle"
        fontSize="11"
        fill="#AFA9EC"
      >
        Nothing to show here
      </SvgText>

      <Circle cx="130" cy="108" r="22" fill="#D85A30" opacity={0.85} />
      <Circle cx="130" cy="108" r="13" fill="#F0997B" />

      <Rect x="514" y="76" width="40" height="40" rx="10" fill="#0F6E56" rotation="15" origin="534, 96" />
      <Rect x="522" y="84" width="24" height="24" rx="6" fill="#5DCAA5" rotation="15" origin="534, 96" />

      <Polygon points="116,330 148,376 84,376" fill="#BA7517" />
      <Polygon points="116,344 140,376 92,376" fill="#EF9F27" />

      <Rect x="530" y="290" width="54" height="22" rx="11" fill="#D4537E" />
      <Rect x="540" y="296" width="34" height="10" rx="5" fill="#ED93B1" opacity={0.8} />

      <G x="160" y="278">
        <Line x1="0" y1="-9" x2="0" y2="9" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" />
        <Line x1="-9" y1="0" x2="9" y2="0" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" />
        <Line x1="-5" y1="-5" x2="5" y2="5" stroke="#534AB7" strokeWidth="1" strokeLinecap="round" />
        <Line x1="5" y1="-5" x2="-5" y2="5" stroke="#534AB7" strokeWidth="1" strokeLinecap="round" />
      </G>
      <G x="520" y="188">
        <Line x1="0" y1="-7" x2="0" y2="7" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="-7" y1="0" x2="7" y2="0" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" />
        <Line x1="-4" y1="-4" x2="4" y2="4" stroke="#0F6E56" strokeWidth="1" strokeLinecap="round" />
        <Line x1="4" y1="-4" x2="-4" y2="4" stroke="#0F6E56" strokeWidth="1" strokeLinecap="round" />
      </G>
    </Svg>
  );
}
