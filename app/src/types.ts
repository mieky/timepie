export interface Duration {
    total: number;
    current: number;
}

export interface Pie {
    width: number;
    height: number;
    radius: number;
    duration: Duration;
}

// TODO: proper types (with D3 declarations)
export interface PieVisualization {
    arc: any;
    color: any;
    layout: any;
    time: any;
}
