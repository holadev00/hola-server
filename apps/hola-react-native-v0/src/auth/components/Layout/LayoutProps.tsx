import type { LayoutActionProps } from "./LayoutActionProps";

export type LayoutProps = {
    title?: string;
    children?: React.ReactNode;
    primaryAction?: LayoutActionProps;
    secondaryAction?: LayoutActionProps;
    header?: boolean;
};
