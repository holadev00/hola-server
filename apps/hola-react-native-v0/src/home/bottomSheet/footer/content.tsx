import Button from '@hola/ui/components/Button';
import { useTranslation } from 'react-i18next';
import { useMatchesScreensLinks } from "@hola/matches/hooks/useMatchesScreensLinks";
import React, { useEffect } from 'react';
import { Computed, useObservable, useObserveEffect } from '@legendapp/state/react';
import * as VenuesMarkers from '@hola/home/map/VenuesMarkers';
import { useSocket } from '@hola/socket';
import { observable } from '@legendapp/state';


export function HomeBottomSheetFooterContent(props) {
    const { t } = useTranslation();

    const venue$ = useObservable({});
    const { courts$, schedules$ } = venue$;

    useObserveEffect(VenuesMarkers.selected, ({ value: venue }) => {
        if (!venue) return;
        socket.emit('VENUES/courts/get', venue?.id, courts$.set);
        socket.emit('VENUES/schedule/get', venue?.id, schedules$.set);
    });

    const socket = useSocket("/");

    return (
        <Computed>
            {function () {
                const venue = VenuesMarkers?.selected?.get();
                const { createScreen, venueScreen } = useMatchesScreensLinks(venue?.id);

                const courts = courts$.get();
                const schedules = schedules$.get();

                if (venue) return <>
                    <Button variant="secondary" style={{ flex: 1 }} onPress={venueScreen}>
                        {t(`home.bottomSheet.matches`)}
                    </Button>
                    {(
                        !schedules?.every(s => s?.start === s?.end) &&
                        courts?.length > 0
                    ) && <Button variant="primary" style={{ flex: 1 }} onPress={createScreen}>
                        {t(`home.bottomSheet.startMatch`)}
                    </Button>}
                </>;
                return null;
            }}
        </Computed >
    );
}