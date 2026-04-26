export type LayoutActionProps = {
    label: string;
    color?: string;
    onPress?: () => void;
} | Partial<HTMLButtonElement>;
