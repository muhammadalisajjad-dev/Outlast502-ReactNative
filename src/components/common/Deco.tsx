import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Ellipse,
  Line,
  G,
  Circle,
} from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useResponsiveInsets } from '../../hooks/useResponsiveInsets';
import { ChevronLeft } from 'lucide-react-native';

export type DecoBackdropVariant = 'home' | 'table' | 'screen';

/* ------------------------------------------------------------------ */
/* Atmospheric backgrounds                                             */
/* ------------------------------------------------------------------ */

const rayLines = (
  cx: number,
  cy: number,
  radius: number,
  count: number,
  keyPrefix: string
) =>
  Array.from({ length: count }).map((_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    return (
      <Line
        key={`${keyPrefix}-${index}`}
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(angle) * radius}
        y2={cy + Math.sin(angle) * radius}
        stroke={Colors.brass}
        strokeWidth={0.6}
        strokeOpacity={0.5}
      />
    );
  });

interface DecoBackdropProps {
  variant?: DecoBackdropVariant;
  style?: ViewStyle;
}

export const DecoBackdrop: React.FC<DecoBackdropProps> = ({
  variant = 'screen',
  style,
}) => {
  const gradientId = `deco-bg-${variant}`;
  const bottomId = `deco-bottom-${variant}`;
  const isHome = variant === 'home';

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <RadialGradient
            id={gradientId}
            cx={isHome ? '50%' : '50%'}
            cy={isHome ? '20%' : '38%'}
            r={isHome ? '78%' : '72%'}
          >
            <Stop offset="0" stopColor={Colors.emeraldLight} stopOpacity={0.92} />
            <Stop offset="0.42" stopColor={Colors.emerald} stopOpacity={0.9} />
            <Stop offset="0.78" stopColor={Colors.inkSoft} stopOpacity={1} />
            <Stop offset="1" stopColor={Colors.inkBlack} stopOpacity={1} />
          </RadialGradient>
          <LinearGradient id={bottomId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.inkBlack} stopOpacity={0} />
            <Stop offset="0.62" stopColor={Colors.inkBlack} stopOpacity={0.35} />
            <Stop offset="1" stopColor={Colors.inkBlack} stopOpacity={0.96} />
          </LinearGradient>
        </Defs>

        <Rect width="400" height="800" fill={`url(#${gradientId})`} />

        {/* Faint architectural rays */}
        <G opacity={isHome ? 0.16 : 0.08}>
          {rayLines(200, isHome ? 220 : 330, 420, isHome ? 24 : 16, variant)}
        </G>

        {/* Art Deco arch / frame hints */}
        <Ellipse
          cx={200}
          cy={isHome ? 250 : 380}
          rx={isHome ? 172 : 190}
          ry={isHome ? 172 : 250}
          stroke={Colors.brass}
          strokeOpacity={0.09}
          strokeWidth={1}
          fill="none"
        />
        <Ellipse
          cx={200}
          cy={isHome ? 250 : 380}
          rx={isHome ? 158 : 176}
          ry={isHome ? 158 : 236}
          stroke={Colors.brass}
          strokeOpacity={0.05}
          strokeWidth={0.7}
          fill="none"
        />

        {/* Corner fans */}
        <G stroke={Colors.brass} strokeOpacity={0.12} strokeWidth={0.8}>
          <Line x1="0" y1="70" x2="58" y2="0" />
          <Line x1="0" y1="112" x2="96" y2="0" />
          <Line x1="0" y1="154" x2="134" y2="0" />
          <Line x1="400" y1="70" x2="342" y2="0" />
          <Line x1="400" y1="112" x2="304" y2="0" />
          <Line x1="400" y1="154" x2="266" y2="0" />
        </G>

        <Rect width="400" height="800" fill={`url(#${bottomId})`} />
      </Svg>
    </View>
  );
};

/**
 * Rich felt surface used inside the playing table. The component is purely
 * decorative and sits behind the piles and motion overlay.
 */
export const FeltSurface: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 400 620"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <RadialGradient id="felt-glow" cx="50%" cy="46%" r="66%">
          <Stop offset="0" stopColor={Colors.emeraldBright} stopOpacity={0.38} />
          <Stop offset="0.4" stopColor={Colors.emeraldMid} stopOpacity={0.9} />
          <Stop offset="0.78" stopColor={Colors.emeraldDeep} stopOpacity={1} />
          <Stop offset="1" stopColor={Colors.inkBlack} stopOpacity={1} />
        </RadialGradient>
        <LinearGradient id="felt-sheen" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.05} />
          <Stop offset="0.3" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.35} />
        </LinearGradient>
      </Defs>

      <Rect width="400" height="620" fill="url(#felt-glow)" />

      {/* Woven felt suggestion */}
      <G stroke={Colors.ivory} strokeOpacity={0.018} strokeWidth={0.5}>
        {Array.from({ length: 40 }).map((_, index) => (
          <Line
            key={`h-${index}`}
            x1={0}
            y1={index * 16}
            x2={400}
            y2={index * 16}
          />
        ))}
        {Array.from({ length: 25 }).map((_, index) => (
          <Line
            key={`v-${index}`}
            x1={index * 16}
            y1={0}
            x2={index * 16}
            y2={620}
          />
        ))}
      </G>

      {/* Double brass table ring */}
      <Ellipse
        cx={200}
        cy={305}
        rx={174}
        ry={264}
        stroke={Colors.brass}
        strokeOpacity={0.16}
        strokeWidth={1}
        fill="none"
      />
      <Ellipse
        cx={200}
        cy={305}
        rx={164}
        ry={252}
        stroke={Colors.brass}
        strokeOpacity={0.08}
        strokeWidth={0.7}
        fill="none"
      />
      <Ellipse
        cx={200}
        cy={305}
        rx={86}
        ry={120}
        stroke={Colors.brass}
        strokeOpacity={0.07}
        strokeWidth={0.8}
        fill="none"
      />

      {/* Central light pool */}
      <Circle cx={200} cy={300} r={120} fill={Colors.brass} fillOpacity={0.025} />
      <Circle cx={200} cy={300} r={60} fill={Colors.brass} fillOpacity={0.025} />

      <Rect width="400" height="620" fill="url(#felt-sheen)" />
    </Svg>
  </View>
);

/* ------------------------------------------------------------------ */
/* Small ornaments                                                     */
/* ------------------------------------------------------------------ */

interface MonogramProps {
  size?: number;
  shape?: 'circle' | 'diamond';
  style?: ViewStyle;
}

export const Monogram: React.FC<MonogramProps> = ({
  size = 36,
  shape = 'circle',
  style,
}) => {
  const isDiamond = shape === 'diamond';
  const innerSize = size - 6;

  return (
    <View
      style={[
        styles.monogram,
        {
          width: size,
          height: size,
          borderRadius: isDiamond ? 4 : size / 2,
          transform: isDiamond ? [{ rotate: '45deg' }] : undefined,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.monogramInner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: isDiamond ? 2 : innerSize / 2,
          },
        ]}
      >
        <Text
          style={[
            styles.monogramText,
            {
              fontSize: size * 0.28,
              transform: isDiamond ? [{ rotate: '-45deg' }] : undefined,
            },
          ]}
        >
          502
        </Text>
      </View>
    </View>
  );
};

interface OrnamentDividerProps {
  style?: ViewStyle;
  color?: string;
  compact?: boolean;
}

export const OrnamentDivider: React.FC<OrnamentDividerProps> = ({
  style,
  color = Colors.brass,
  compact = false,
}) => (
  <View style={[styles.ornamentRow, compact && { marginVertical: 8 }, style]}>
    <View style={[styles.ornamentLine, { backgroundColor: color }]} />
    <View
      style={[
        styles.ornamentDiamond,
        { borderColor: color, width: compact ? 5 : 7, height: compact ? 5 : 7 },
      ]}
    />
    <View style={[styles.ornamentLine, { backgroundColor: color }]} />
  </View>
);

export const BrassDiamond: React.FC<{
  size?: number;
  color?: string;
  filled?: boolean;
  style?: ViewStyle;
}> = ({ size = 6, color = Colors.brass, filled = false, style }) => (
  <View
    style={[
      {
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: filled ? color : 'transparent',
        transform: [{ rotate: '45deg' }],
      },
      style,
    ]}
  />
);

/* ------------------------------------------------------------------ */
/* Screen chrome                                                       */
/* ------------------------------------------------------------------ */

interface ClubHeaderProps {
  title: string;
  kicker?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  titleStyle?: TextStyle;
}

export const ClubHeader: React.FC<ClubHeaderProps> = ({
  title,
  kicker = 'OUTLAST 502',
  onBack,
  right,
  titleStyle,
}) => {
  const insets = useResponsiveInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerSide}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={styles.backButton}
            accessibilityLabel="Back"
          >
            <ChevronLeft size={16} color={Colors.brassLight} />
            <Text style={styles.backText}>BACK</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerKicker}>{kicker}</Text>
        <Text style={[styles.headerTitle, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={[styles.headerSide, styles.headerSideRight]}>{right}</View>
    </View>
  );
};

interface LedgerSectionProps {
  numeral?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  first?: boolean;
}

export const LedgerSection: React.FC<LedgerSectionProps> = ({
  numeral,
  title,
  subtitle,
  children,
  style,
  first = false,
}) => (
  <View style={[styles.ledgerSection, !first && styles.ledgerSectionSpaced, style]}>
    <View style={styles.ledgerHeading}>
      {numeral ? <Text style={styles.ledgerNumeral}>{numeral}</Text> : null}
      <Text style={styles.ledgerTitle}>{title}</Text>
      <View style={styles.ledgerRule} />
    </View>
    {subtitle ? <Text style={styles.ledgerSubtitle}>{subtitle}</Text> : null}
    <View style={styles.ledgerBody}>{children}</View>
  </View>
);

export const ClubScreen: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <View style={[styles.clubScreen, style]}>
    <DecoBackdrop variant="screen" />
    {children}
  </View>
);

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  monogram: {
    borderWidth: 1,
    borderColor: Colors.brass,
    backgroundColor: Colors.emeraldDeep,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  monogramInner: {
    borderWidth: 0.6,
    borderColor: 'rgba(198, 164, 96, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: Typography.titleSmall.fontFamily,
    fontWeight: '700',
    color: Colors.brassLight,
    letterSpacing: 0.4,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    width: '100%',
  },
  ornamentLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    opacity: 0.4,
  },
  ornamentDiamond: {
    borderWidth: 1,
    marginHorizontal: 9,
    transform: [{ rotate: '45deg' }],
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(198, 164, 96, 0.16)',
  },
  headerSide: {
    width: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSideRight: {
    justifyContent: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 6,
  },
  backText: {
    ...Typography.micro,
    color: Colors.brassLight,
    fontSize: 8,
    letterSpacing: 1.4,
    marginLeft: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerKicker: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 7.5,
    letterSpacing: 2.2,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.labelWide,
    color: Colors.ivory,
    fontSize: 10,
    letterSpacing: 2.4,
    textAlign: 'center',
  },
  ledgerSection: {
    paddingTop: 4,
  },
  ledgerSectionSpaced: {
    marginTop: 26,
  },
  ledgerHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ledgerNumeral: {
    ...Typography.serifBody,
    fontSize: 10,
    color: Colors.brass,
    letterSpacing: 1,
    marginRight: 8,
    minWidth: 16,
  },
  ledgerTitle: {
    ...Typography.labelWide,
    color: Colors.brassLight,
    fontSize: 9.5,
    letterSpacing: 2.1,
  },
  ledgerRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(198, 164, 96, 0.18)',
    marginLeft: 10,
  },
  ledgerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
    marginTop: 2,
  },
  ledgerBody: {
    paddingTop: 4,
  },
  clubScreen: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
});
