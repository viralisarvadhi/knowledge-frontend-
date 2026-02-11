import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface WidgetData {
    open: number;
    inProgress: number;
    resolved: number;
}

export function TicketStatsWidget({ open = 0, inProgress = 0, resolved = 0 }: WidgetData) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            <TextWidget
                text="Knowledge Base"
                style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#000000',
                    marginBottom: 8
                }}
            />

            <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}>
                <StatItem label="Open" count={open} color="#FF9500" />
                <StatItem label="In Progress" count={inProgress} color="#007AFF" />
                <StatItem label="Resolved" count={resolved} color="#34C759" />
            </FlexWidget>
        </FlexWidget>
    );
}

function StatItem({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <FlexWidget style={{ alignItems: 'center', flexDirection: 'column' }}>
            <TextWidget
                text={count.toString()}
                style={{ fontSize: 24, fontWeight: 'bold', color: color as any }}
            />
            <TextWidget
                text={label}
                style={{ fontSize: 12, color: '#666666' }}
            />
        </FlexWidget>
    );
}
