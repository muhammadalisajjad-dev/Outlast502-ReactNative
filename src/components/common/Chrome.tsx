import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useResponsiveInsets } from '../../hooks/useResponsiveInsets';
import { ChevronLeft } from 'lucide-react-native';

export type AtmosphereVariant = 'home' | 'table' | 'screen';

/* ------------------------------------------------------------------ */
/* Layered atmospheric background                                       */
/* ------------------------------------------------------------------ */

interface AtmosphereProps {
  variant?: AtmosphereVariant;
  style?: ViewStyle;
}

/**
 * A quiet night-table backdrop: a deep ink base, one soft desk-light pool and
 * a muted teal field glow. No rays, fans or framing ornament.
 */
export const Atmosphere: React.FC<AtmosphereProps> = ({
  variant = 'screen',
  style,
}) => {
  const isHome = variant === 'home';
  const isTable = variant === 'table';
  const highlightId = `atmo-highlight-${variant}`;
  const poolId = `atmo-pool-${variant}`;
  const baseId = `atmo-base-${variant}`;
  const vignetteId = `atmo-vignette-${variant}`;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id={baseId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.inkSoft} />
            <Stop offset="0.55" stopColor={Colors.ink} />
            <Stop offset="1" stopColor="#070B09" />
          </LinearGradient>
          <RadialGradient
            id={highlightId}
            cx="50%"
            cy={isHome ? '18%' : '14%'}
            r={isHome ? '72%' : '64%'}
          >
            <Stop offset="0" stopColor={Colors.paper} stopOpacity={isHome ? 0.075 : 0.05} />
            <Stop offset="0.55" stopColor={Colors.paper} stopOpacity={0.018} />
            <Stop offset="1" stopColor={Colors.paper} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient
            id={poolId}
            cx="50%"
            cy={isTable ? '58%' : '64%'}
            r={isTable ? '58%' : '52%'}
          >
            <Stop offset="0" stopColor={Colors.teal} stopOpacity={isTable ? 0.22 : 0.14} />
            <Stop offset="0.6" stopColor={Colors.teal} stopOpacity={0.06} />
            <Stop offset="1" stopColor={Colors.teal} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={vignetteId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0} />
            <Stop offset="0.7" stopColor="#000000" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.4} />
          </LinearGradient>
        </Defs>

        <Rect width="400" height="800" fill={`url(#${baseId})`} />

        {isHome && (
          <>
            <Circle
              cx={200}
              cy={236}
              r={146}
              stroke={Colors.paper}
              strokeOpacity={0.07}
              strokeWidth={1}
              fill={Colors.paper}
              fillOpacity={0.02}
            />
            <Circle
              cx={200}
              cy={236}
              r={176}
              stroke={Colors.paper}
              strokeOpacity={0.035}
              strokeWidth={0.8}
              fill="none"
            />
          </>
        )}

        <Rect width="400" height="800" fill={`url(#${highlightId})`} />
        <Rect width="400" height="800" fill={`url(#${poolId})`} />

        {/* Fine woven field texture, kept almost invisible */}
        <Rect
          x={0}
          y={isTable ? 300 : 240}
          width={400}
          height={isTable ? 320 : 260}
          fill="none"
          stroke={Colors.paper}
          strokeOpacity={0.012}
          strokeWidth={6}
          rx={80}
        />

        <Rect width="400" height="800" fill={`url(#${vignetteId})`} />
      </Svg>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Screen chrome                                                       */
/* ------------------------------------------------------------------ */

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  right,
}) => {
  const insets = useResponsiveInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.side}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backButton}
          >
            <ChevronLeft size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
};

interface SectionHeadingProps {
  index?: string;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  index,
  title,
  subtitle,
  style,
  children,
}) => (
  <View style={[styles.sectionHeading, style]}>
    <View style={styles.sectionHeadingRow}>
      {index ? <Text style={styles.sectionIndex}>{index}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
    </View>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    {children ? <View style={{ marginTop: 8 }}>{children}</View> : null}
  </View>
);

export const Divider: React.FC<{ style?: ViewStyle; compact?: boolean }> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

export const Screen: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <View style={[styles.screen, style]}>
    <Atmosphere variant="screen" />
    {children}
  </View>
);

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.paperFaint,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: Colors.textPrimary,
  },
  sectionHeading: {
    marginBottom: 10,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIndex: {
    fontFamily: Typography.titleSmall.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    marginRight: 8,
    minWidth: 18,
  },
  sectionTitle: {
    fontFamily: Typography.labelUpper.fontFamily,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.textPrimary,
  },
  sectionRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.line,
    marginLeft: 10,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.line,
  },
});
export const DecoBackdrop = Atmosphere;
export const Monogram: React.FC<{ size?: number; shape?: "circle" | "diamond"; style?: any }> = ({ size = 32, style }) => (
  <View style={[{ width: size, height: size, borderRadius: 8, backgroundColor: Colors.paper, alignItems: "center", justifyContent: "center" }, style]}>
    <Text style={{ fontFamily: Typography.cardRank.fontFamily, fontSize: size * 0.34, fontWeight: "800", color: Colors.ink, letterSpacing: 0.2 }}>502</Text>
  </View>
);
export const OrnamentDivider = Divider;
export const BrassDiamond: React.FC<{ size?: number; color?: string; filled?: boolean; style?: any }> = ({ size = 6, color = Colors.accent, filled = false, style }) => (
  <View style={[{ width: size, height: size, borderWidth: 1, borderColor: color, backgroundColor: filled ? color : "transparent", transform: [{ rotate: "45deg" }] }, style]} />
);
export const ClubHeader = ScreenHeader;
export const LedgerSection: React.FC<{ numeral?: string; title: string; subtitle?: string; children: React.ReactNode; style?: any; first?: boolean }> = ({ numeral, title, subtitle, children, style, first }) => (
  <View style={[{ marginTop: first ? 0 : 24 }, style]}>
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
      {numeral ? <Text style={{ fontFamily: Typography.titleSmall.fontFamily, fontSize: 11, fontWeight: "700", color: Colors.accent, marginRight: 8, minWidth: 16 }}>{numeral}</Text> : null}
      <Text style={{ fontFamily: Typography.labelUpper.fontFamily, fontSize: 10.5, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase", color: Colors.textPrimary }}>{title}</Text>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.line, marginLeft: 10 }} />
    </View>
    {subtitle ? <Text style={{ ...Typography.bodySmall, color: Colors.textMuted, fontSize: 11.5, lineHeight: 16, marginBottom: 10 }}>{subtitle}</Text> : null}
    <View style={{ paddingTop: 4 }}>{children}</View>
  </View>
);
export const ClubScreen = Screen;
export const FeltSurface: React.FC<{ style?: any }> = ({ style }) => (
  <View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.surface, opacity: 0.9 }, style]} />
);
