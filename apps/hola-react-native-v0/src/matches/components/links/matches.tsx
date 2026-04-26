import { Link } from '@react-navigation/native';
import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export function MatchesIndexLink({ children }: Props) {
    return (
        <Link screen="Matches" params={{ screen: 'Index' }} style={{ display: "contents" }}>
            {children}
        </Link>
    );
}