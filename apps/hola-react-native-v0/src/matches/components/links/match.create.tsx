import { useNavigation, Link } from '@react-navigation/native';
import { ReactNode } from 'react';
import { Pressable } from 'react-native';

export type Props = {
    venue: any;
    children: ReactNode;
};

export function CreateMatchInVenueLink({ venue, children }: Props) {
    const { navigate } = useNavigation();

    return (
        <Link
            screen="Matches"
            params={{
                screen: 'Venue',
                venue,
                params: { screen: 'Create' },
            }}
            style={{ display: "contents" }}
        >
            {children}
        </Link>
    );
}
