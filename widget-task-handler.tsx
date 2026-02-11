import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TicketStatsWidget } from './src/features/widgets/TicketStatsWidget';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
    const widgetInfo = props.widgetInfo;

    if (widgetInfo.widgetName === 'TicketStats') {
        // In a real app, you would fetch data from Shared Preferences here.
        // For now, we will use mock data or last known state.
        // The actual data syncing will happen from the main app.

        // We can also check props.widgetInfo.renderWidget to see if we need to render.

        props.renderWidget(
            <TicketStatsWidget
                open={0}
                inProgress={0}
                resolved={0}
            />
        );
    }
}
