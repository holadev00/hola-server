import { Link } from '@react-navigation/native';
import { ReactNode } from 'react';

type Props = {
    venue: any;
    children: ReactNode;
};

export function VenueMatchesLink({ venue, children }: Props) {
    return (
        <Link
            screen="Matches"
            params={{
                screen: 'Venue',
                venue,
            }}
            style={{ display: "contents" }}
        >
            {children}
        </Link>
    );
}