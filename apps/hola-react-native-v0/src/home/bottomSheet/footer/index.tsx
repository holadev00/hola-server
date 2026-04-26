import { BottomSheetFooter } from '@gorhom/bottom-sheet';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { lazy } from 'react';
import { spacing } from '@hola/ui';
import { HomeBottomSheetFooterContent } from './content';

export function HomeBottomSheetFooter(props) {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 24,
            backgroundColor: 'grey',
        },
        contentContainer: {
            flex: 1,
            alignItems: 'center',
        },
        footerContainer: {
            padding: 12,
            margin: 12,
            borderRadius: 12,
            backgroundColor: '#80f',
        },
        footerText: {
            textAlign: 'center',
            color: 'white',
            fontWeight: '800',
        },
        background: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 300,
        },
    });

    return <BottomSheetFooter {...props} bottomInset={0}>
        <LinearGradient
            colors={['rgba(0,0,0,0)', 'white']}
            locations={[0, 0.25]}
            style={styles.background} />

        <View style={{ flexDirection: "row", gap: spacing.sm, padding: 16 }}>
            <HomeBottomSheetFooterContent />
        </View>
    </BottomSheetFooter>;
}