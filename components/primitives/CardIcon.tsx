import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

type CardIconProps = {
    src: any;
    color: string;
    size: number;
};

export default function CardIcon({ src, color, size }: CardIconProps) {
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Image
                source={src}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
                contentPosition="center"
                tintColor={color}
                cachePolicy="memory-disk"
            />
        </View>
    );
}