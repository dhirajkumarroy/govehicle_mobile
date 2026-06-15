import React from 'react';
import { StyleSheet, View } from 'react-native';
import colors from '../theme/colors';
import spacing from '../theme/spacing';

export const SkeletonLoader: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.imagePlaceholder} />
        <View style={styles.textContainer}>
          <View style={styles.titlePlaceholder} />
          <View style={styles.subPlaceholder} />
          <View style={styles.pricePlaceholder} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusXl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  imagePlaceholder: {
    width: 100,
    height: 80,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: '#1c1c2b',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  titlePlaceholder: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#1c1c2b',
  },
  subPlaceholder: {
    width: '75%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#1c1c2b',
    marginTop: 6,
  },
  pricePlaceholder: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#1c1c2b',
    marginTop: 10,
  },
});

export default SkeletonLoader;
